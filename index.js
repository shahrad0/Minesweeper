// Hard coded rules: 
// 1. The area that player clicks on at the beginning will always have a 3x3 radius with no bomb.
// 2. In custom mode, bomb density cannot be higher than 50%. (not implemented yet)

// 77.5% slop free

// bomb position array directions -> from top to bottom, left to right. first element is x, second is y.
// to do: maybe add more shapes. also there might be some unknown bugs idk

// to optimize maybe: use ints instead of strings for valid tiles
// other parts that could be optimized will be marked with "o**"

// menu elements
const menu = document.getElementById("menu")
const difficultySelection = document.getElementById("difficulty")
const xElement = document.getElementById("x")
const yElement = document.getElementById("y")
const rxElement = document.getElementById("rx")
const ryElement = document.getElementById("ry")
const bombsElement = document.getElementById("bombs")
const tileCountElement = document.getElementById("tile-count")
const boardErrorElement = document.getElementById("board-error")

// game elements
const board = document.getElementById("board")
const gameContainer = document.getElementById("game-container")
const flagCounterContainer = document.getElementById("flag-counter-container")

const bombImageElement = createCustomElement("img", { className : "board-asset" })
bombImageElement.src = "Assets/bomb.png"

const redFlagElement = createCustomElement("img", { className : "board-asset red-flag" })
redFlagElement.src = "Assets/flag_correct.png"

const emptyTile = createCustomElement("div", { className: "empty-tile" })
 
let boardInfo = {
    x: undefined,
    y: undefined,
    bombCount: undefined,
    tileCount: undefined,
    bombDensity: undefined,
    bombCountDigit: undefined,
    digitElements: [],
    isCircle: false,
    rx: undefined,
    ry: undefined
}

const boardLimits = {
    maxBombDensity: 50,
    maxX: 1000,
    maxY: 1000,
    minX: 6,
    minY: 6,

    // circle limits
    minRX: 6,
    minRY: 6,
    maxRX: 500, 
    maxRY: 500
}

let gameState = {
    canInteractWithBoard: true,
    startTime: undefined,
    finishTime: undefined,
    clickedTiles: 0,
    isFirstClick: true,
    validTiles: new Set(),
    bombsPositions: [],
    flaggedPosition: [],
    correctFlags: 0,
    falseFlags: 0,
    boardRulesFollowed: undefined
}

const difficultyPresets = {
    easy: {
        x: 10,
        y: 10,
        bombCount: 10
    },
    medium: {
        x: 16,
        y: 16,
        bombCount: 40
    },
    hard: {
        x: 20,
        y: 20,
        bombCount: 90
    },
}

const difficultyColors = {
    easy: "green",
    medium: "yellow",
    hard: "red",
    impossible: "blueviolet"
}

menu.addEventListener("input", e => {
    if (e.target.matches('input')) UpdateBombDensity()
})

function setBoardInfo() {
    boardInfo.x = Number(document.getElementById("x").value)
    boardInfo.y = Number(document.getElementById("y").value)
    boardInfo.rx = Number(document.getElementById("rx").value)
    boardInfo.ry = Number(document.getElementById("ry").value)
    boardInfo.bombCount = Number(document.getElementById("bombs").value)

    if (boardInfo.isCircle) getTileCount(1)
    else getTileCount(0)

    boardInfo.bombDensity = Math.round((boardInfo.bombCount / boardInfo.tileCount) * 10000) / 100
}

function UpdateBombDensity() {
    setBoardInfo()

    const difficulty = bombDensityScale(boardInfo.bombDensity)

    let bombDensityElement = document.getElementById("bomb-density")
    
    bombDensityElement.style.color = difficultyColors[difficulty]
    bombDensityElement.innerText = boardInfo.bombDensity + "%"
}

function checkBoardLimits({ x, y, bombDensity, rx, ry } = {}) {
    gameState.boardRulesFollowed = false

    if (boardInfo.isCircle) {
        if (rx > boardLimits.maxRX) {
            boardErrorElement.innerText = "Radius X cannot be bigger than " + boardLimits.maxX
            addErrorEffects()
        }
        else if (ry > boardLimits.maxRY) {
            boardErrorElement.innerText = "Radius Y cannot be bigger than " + boardLimits.maxY
            addErrorEffects()
        }
        else if (rx < boardLimits.minRX) {
            boardErrorElement.innerText = "Radius X cannot be lower than " + boardLimits.minRX
            addErrorEffects()
        }
        else if (ry < boardLimits.minRY) {
            boardErrorElement.innerText = "Radius Y cannot be lower than " + boardLimits.minRY
            addErrorEffects()
        }
    }
    else {
        if (x > boardLimits.maxX) {
            boardErrorElement.innerText = "X cannot be bigger than " + boardLimits.maxX
            addErrorEffects()
        }
        else if (y > boardLimits.maxY) {
            boardErrorElement.innerText = "Y cannot be bigger than " + boardLimits.maxY
            addErrorEffects()
        }        
        else if (x < boardLimits.minX) {
            boardErrorElement.innerText = "X cannot be lower than " + boardLimits.minX
            addErrorEffects()
        }
        else if (y < boardLimits.minY) {
            boardErrorElement.innerText = "Y cannot be lower than " + boardLimits.minY
            addErrorEffects()
        }
    }

    if (bombDensity > boardLimits.maxBombDensity) {
        boardErrorElement.innerText = "bomb density cannot be higher than " + boardLimits.maxBombDensity + "%"
        addErrorEffects()
    }

    else gameState.boardRulesFollowed = true
}

function addErrorEffects() {
    if (document.getElementById("error-timer-parent")) return

    const delay = 7500
    const parentBar = createCustomElement("div", { id: "error-timer-parent" })
    const bar = createCustomElement("div", { id: "error-timer" })
    bar.style.transition = `width ${delay - 100}ms ease-out `

    parentBar.appendChild(bar)
    boardErrorElement.appendChild(parentBar)

    setTimeout(() => bar.style.width = "0px", 100)
    setTimeout(() => {
        boardErrorElement.style.opacity = 0
        
        setTimeout(() => {
            boardErrorElement.innerText = null
            parentBar.remove()
            bar.remove()
            boardErrorElement.style.opacity = 1
        }, 300)
    }, delay)
}

function bombDensityScale(bombDensity) {
    if (bombDensity <= 10) return "easy"
    else if (bombDensity <= 17.5) return "medium"
    else if (bombDensity <= 25) return "hard"
    else return "impossible"
}

setDifficulty()

function showDifficultyScale() {
    if (document.getElementById("difficulty-scale-menu")) return 

    const difficultyScaleMenu = createCustomElement("div", { id: "difficulty-scale-menu" })

    const menuHeader = createCustomElement("h3")
    menuHeader.innerText = "Difficulty Scale"
    menuHeader.style.textAlign = "center"
    menuHeader.style.marginBottom = "10px"

    const closeMenuButton = createCustomElement("button", { id: "close-menu-button" })
    closeMenuButton.innerText = "X"
    closeMenuButton.addEventListener("click", () => difficultyScaleMenu.remove())

    const easyText = createCustomElement("div", { className: "difficulty-text" })
    easyText.style.color = difficultyColors["easy"]
    easyText.innerText = "Easy: bomb density <= 10%"

    const mediumText = createCustomElement("div", { className: "difficulty-text" })
    mediumText.style.color = difficultyColors["medium"]
    mediumText.innerText = "Medium: 10% < bomb density <= 17.5%"

    const hardText = createCustomElement("div", { className: "difficulty-text" })
    hardText.style.color = difficultyColors["hard"]
    hardText.innerText = "Hard: 17.5% < bomb density <= 25%"

    const impossibleText = createCustomElement("div", { className: "difficulty-text" })
    impossibleText.style.color = difficultyColors["impossible"]
    impossibleText.innerText = "Impossible: bomb density > 25%"

    difficultyScaleMenu.appendChild(menuHeader)
    difficultyScaleMenu.appendChild(closeMenuButton)
    difficultyScaleMenu.appendChild(easyText)
    difficultyScaleMenu.appendChild(mediumText)
    difficultyScaleMenu.appendChild(hardText)
    difficultyScaleMenu.appendChild(impossibleText)

    document.getElementById("bomb-density-container").appendChild(difficultyScaleMenu)
}

function setDifficulty() {
    // custom rect
    if (difficultySelection.value === "Custom") {
        document.querySelectorAll(".square").forEach(element => element.classList.remove("hidden"))
        document.querySelectorAll(".circle").forEach(element => element.classList.add("hidden"))

        xElement.disabled = false
        yElement.disabled = false
        bombsElement.disabled = false
        xElement.classList.remove("locked-input")
        yElement.classList.remove("locked-input")
        bombsElement.classList.remove("locked-input")
        boardInfo.isCircle = false
    }
    // custom circle
    else if (difficultySelection.value === "Circle") {
        bombsElement.disabled = false
        bombsElement.classList.remove("locked-input")

        document.querySelectorAll(".square").forEach(element => element.classList.add("hidden"))
        document.querySelectorAll(".circle").forEach(element => element.classList.remove("hidden"))

        boardInfo.isCircle = true
    }
    // rect
    else {
        document.querySelectorAll(".square").forEach(element => element.classList.remove("hidden"))
        document.querySelectorAll(".circle").forEach(element => element.classList.add("hidden"))

        boardInfo.isCircle = false

        xElement.disabled = true
        yElement.disabled = true
        bombsElement.disabled = true
        xElement.classList.add("locked-input")
        yElement.classList.add("locked-input")
        bombsElement.classList.add("locked-input")
    
        let selectedDifficulty = difficultyPresets[difficultySelection.value]
        xElement.value = selectedDifficulty.x
        yElement.value = selectedDifficulty.y
        bombsElement.value = selectedDifficulty.bombCount
    
        UpdateBombDensity()
    }

    UpdateBombDensity()
}

difficultySelection.addEventListener("change", () => {
    setDifficulty()
})

function checkIfInsideCircle(x, y) {
    if ((((x - boardInfo.rx) ** 2) / boardInfo.rx ** 2) + (((y - boardInfo.ry) ** 2) / boardInfo.ry ** 2) <= 0.95) return true
    else return false
}

// o**
function getTileCount(shape) {
    // 0 -> rect
    // 1 -> circle

    boardInfo.tileCount = 0

    switch (shape) {
        case 0:
            for (let x = 0; x < boardInfo.x; x++) {
                for (let y = 0; y < boardInfo.y; y++) boardInfo.tileCount++
            }

            break;
        case 1:
            for (let x = 0; x < boardInfo.rx * 2; x++) {
                for (let y = 0; y < boardInfo.ry * 2; y++) {
                    if (checkIfInsideCircle(x, y)) boardInfo.tileCount++
                }
            }

            break;
    }

    tileCountElement.innerText = `Total Tiles: ${boardInfo.tileCount} Tiles`
}

function boardLogic() {
    board.innerHTML = ""
    const fragment = document.createDocumentFragment()
    
    // adding tiles depending on the shape
    if (boardInfo.isCircle) {
        for (let x = 0; x < boardInfo.rx * 2; x++) {
            const row = createCustomElement("div", {
                id: x,
                className: "row"
            })

            for (let y = 0; y < boardInfo.ry * 2; y++) {
                if (checkIfInsideCircle(x, y)) {
                    row.appendChild(createCustomElement("div", {
                        id: `${x}-${y}`,
                        className: "tile"
                    }))

                    gameState.validTiles.add(`${x}-${y}`)
                }
                else row.appendChild(emptyTile.cloneNode(true))
            }

            fragment.appendChild(row)
        }
    }
    // rect
    else {
        for (let x = 0; x < boardInfo.x; x++) {
            const row = createCustomElement("div", {
                id: x,
                className: "row"
            })

            for (let y = 0; y < boardInfo.y; y++) {
                row.appendChild(createCustomElement("div", {
                    id: `${x}-${y}`,
                    className: "tile"
                }))

                gameState.validTiles.add(`${x}-${y}`)
            }

            fragment.appendChild(row)
        }
    }

    board.appendChild(fragment)
}

function startGame() {
    setBoardInfo()

    if (boardInfo.isCircle) checkBoardLimits(boardInfo.x, boardInfo.y, boardInfo.bombDensity)
    else checkBoardLimits(boardInfo.rx, boardInfo.ry, boardInfo.bombDensity)

    if (!gameState.boardRulesFollowed) return

    boardLogic()
    setFlagCounter()
    setClockToZero()

    menu.style.transition = '300ms'
    gameContainer.style.transition = '300ms'

    menu.style.transform = "translateY(-100vh)"
    gameContainer.style.transform = `translateY(-100vh)`

    setTimeout(() => {
        menu.style.transition = 'none'
        gameContainer.style.transition = 'none'
    }, 300)
}

function resetGameInfo() {
    gameState.isFirstClick = true
    gameState.canInteractWithBoard = true
    gameState.startTime = undefined
    gameState.finishTime = undefined
    gameState.clickedTiles = 0
    gameState.bombsPositions = []
    gameState.validTiles.clear()
    gameState.flaggedPosition = []
    gameState.correctFlags = 0
    gameState.falseFlags = 0

    if (document.getElementById("result-menu")) document.getElementById("result-menu").remove()

    setClockToZero()
    updateFlagCounter()
}

function resetGame() {
    resetGameInfo()
    boardLogic()
}

// create random bombs
function addBombs(x, y){
    const surroundingTiles = getSurroundingTiles(x, y)
    let validTilesArray = [...gameState.validTiles]

    // remove invalid tiles
    for (let i = 0; i < surroundingTiles.length; i++) {
        let removeIndex = validTilesArray.findIndex(element => element === `${surroundingTiles[i][0]}-${surroundingTiles[i][1]}`)

        validTilesArray[removeIndex] = validTilesArray[validTilesArray.length - 1]
        validTilesArray.pop()
    }

    // convert set to array for getting random positions

    // add bombs based on available tiles
    while (gameState.bombsPositions.length < boardInfo.bombCount) {
        const randomIndex = Math.floor(Math.random() * validTilesArray.length)
        const randomBomb = validTilesArray[randomIndex]

        gameState.bombsPositions.push(randomBomb.split("-").map(Number))

        validTilesArray[randomIndex] = validTilesArray[validTilesArray.length - 1]
        validTilesArray.pop()
    }
}

function mark(target) {
    if(!gameState.canInteractWithBoard) return

    const clickedElement = target
    let [x, y] = getTilePosition(target)

    if (gameState.isFirstClick) {
        addBombs(x, y)
        gameState.startTime = Date.now()
    } 
    gameState.isFirstClick = false

    // check if flagged
    if (clickedElement.classList.contains("flagged") || clickedElement.classList.contains("flag")) return

    if (checkForBomb(x, y)) {
        lose(x, y)
        return
    }

    if (!clickedElement.classList.contains("clicked")) {
        clickedElement.classList.add("clicked") 
        gameState.clickedTiles++
    }

    revealSurrounding(x, y)

    if (gameState.clickedTiles + boardInfo.bombCount == boardInfo.tileCount) winMenu()
}

// handling flag counter
function setFlagCounter() {
    boardInfo.bombCountDigit = 0
    let temp = boardInfo.bombCount

    // getting bombCount length and adding segments
    while (temp >= 1) {
        temp /= 10
        boardInfo.bombCountDigit++

        // adding digits and putting the length as each segments' id 
        const digitContainer = createCustomElement("div", { id: "d" + boardInfo.bombCountDigit, className: "digit"})

        createSegments(digitContainer)

        boardInfo.digitElements.push(digitContainer)
        flagCounterContainer.appendChild(digitContainer)
    }

    const flagImg = createCustomElement("img", { id: "flag" })
    flagImg.src = "Assets/flag.png"

    flagCounterContainer.appendChild(flagImg)

    updateFlagCounter()
}

function getSpecificDigit(number, position, length) {
    return Math.floor(number / 10**(length - position)) % 10
}

function updateFlagCounter() {
    let digit = boardInfo.bombCountDigit
    while (digit >= 1) {
        const currentDigit = boardInfo.digitElements[digit - 1]

        updateDigit(currentDigit, getSpecificDigit(boardInfo.bombCount - gameState.flaggedPosition.length, digit, boardInfo.bombCountDigit))

        digit--
    }
}

function lose(x, y) {
    gameState.canInteractWithBoard = false
    gameState.finishTime = Date.now()

    let bombTile = document.getElementById(x + "-" + y)
    bombTile.style.backgroundColor = "rgb(125, 0, 0)"

    gameState.bombsPositions = gameState.bombsPositions.filter(
        pos => !(pos[0] == x && pos[1] == y)
    )

    bombTile.appendChild(bombImageElement)

    revealBombs()

    setTimeout(() => loseMenu(), 1000)
}

function revealBombs() {
    gameState.bombsPositions.forEach((bombPosition) => {
        let positionString = bombPosition[0] + "-" + bombPosition[1]
        let bombTile = document.getElementById(positionString)
        gameState.flaggedPosition.forEach((element, index) => { if (element[1] == bombPosition[1] && element[0] == bombPosition[0]) gameState.flaggedPosition.splice(index, 1) })

        setTimeout(() => {
            bombTile.style.backgroundColor = "rgb(85, 0, 0)"

            if (bombTile.classList.contains("flagged")) {
                let flag = bombTile.querySelector(".board-asset")

                bombTile.appendChild(redFlagElement.cloneNode(true))

                // green flag fading away  
                flag.style.transition = "all 500ms"
                flag.style.opacity = 0
                flag.style.zIndex = "100"

                setTimeout(() => flag.remove(), 500)
                gameState.correctFlags++
            }

            else bombTile.appendChild(bombImageElement.cloneNode(true))
        }, Math.random() * 1000)
    })

    // handling false flags
    gameState.flaggedPosition.forEach(element => {
        document.getElementById(element[0] + "-" + element[1]).style.filter = "grayscale(1)"
        gameState.falseFlags++
    })
}

function checkForBomb(x, y) {
    return gameState.bombsPositions.some(element => x == element[0] && y == element[1])
}

// o**
function revealSurroundingAnimation(x, y) {
    let forCheckPositions = getSurroundingTiles(x, y)

    setTimeout(() => {
        forCheckPositions.forEach(position => {
            if (!document.getElementById(`${position[0]}-${position[1]}`)?.classList.contains("clicked")) {
                revealSurrounding(position[0], position[1])
            }
        })
    }, 40)
}

// o**
function revealSurrounding(x, y) {
    let clickedElement = document.getElementById(`${x}-${y}`)

    if (clickedElement.classList.contains("flagged")) return

    let forCheckPositions = getSurroundingTiles(x, y)
    let surroundingBombs = 0

    forCheckPositions.forEach(position => {
        if (checkForBomb(position[0], position[1])) surroundingBombs += 1
    })

    if (surroundingBombs === 0) {
        clickedElement.innerText = ""
        if (!clickedElement.classList.contains("clicked")) {
            clickedElement.classList.add("clicked")
            gameState.clickedTiles++
        }
        
        revealSurroundingAnimation(x, y)
    }

    else {
        clickedElement.innerText = surroundingBombs
        if (!clickedElement.classList.contains("clicked")) {
            clickedElement.classList.add("clicked")
            gameState.clickedTiles++
            if (gameState.clickedTiles + boardInfo.bombCount == boardInfo.tileCount) winMenu()
        }
    }
}

function getSurroundingTiles(x, y) {
    let surroundingTiles = []

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (gameState.validTiles.has(`${x + dx}-${y + dy}`)) 
                surroundingTiles.push([x + dx, y + dy])
        }
    }

    return surroundingTiles
}

function createCustomElement(tag, { id = "", className = "" } = {}) {
    const element = document.createElement(tag)

    if (id) element.id = id
    if (className) element.className = className

    return element
}

function flag(e) {
    if (!gameState.canInteractWithBoard) return

    let targetedElement = e.target

    if (targetedElement.classList.contains("board-asset")) {
        targetedElement = targetedElement.parentNode
    }

    if (!targetedElement.classList.contains("tile")) return
    if (targetedElement.classList.contains("clicked")) return

    const position = getTilePosition(targetedElement)

    if (targetedElement.classList.contains("flagged")) {
        removeFlag(targetedElement)
        gameState.flaggedPosition = removeArrayElement(gameState.flaggedPosition, position)
        updateFlagCounter()

        return
    }

    if (boardInfo.bombCount - gameState.flaggedPosition.length <= 0) return

    targetedElement.classList.add("flagged")
    gameState.flaggedPosition.push(position)

    const flag = createCustomElement("img", {
        className: "board-asset",
        id: targetedElement.id
    })

    flag.src = "Assets/flag.png"
    targetedElement.appendChild(flag)
    updateFlagCounter()
}

function removeFlag(targetedElement) {
    targetedElement.classList.remove("flagged")
    targetedElement.querySelector("img").remove()
}

function doubleClickReveal(target) {
    let [x, y] = getTilePosition(target)

    let surroundingTiles = getSurroundingTiles(x, y)
    let flaggedTile = 0
    let unmarkedPosition = []
    // this could be a problem 
    let bombs = target.innerText
    
    surroundingTiles.forEach(element => {
        if (document.getElementById(`${element[0]}-${element[1]}`).classList.contains("flagged")) { 
            flaggedTile ++
            return
        }
        if (!document.getElementById(`${element[0]}-${element[1]}`).classList.contains("clicked")) {
            unmarkedPosition.push(element)
        }
    })

    if (bombs == flaggedTile) {
        unmarkedPosition.forEach(element => {
            mark(document.getElementById(`${element[0]}-${element[1]}`))
        })
    }
}

function getTilePosition(element) {
    return element.id.split("-").map(Number)
}

function removeArrayElement(array, elementToRemove) {
    const index = array.findIndex(element =>
        element[0] === elementToRemove[0] &&
        element[1] === elementToRemove[1]
    )

    if (index !== -1) {
        array.splice(index, 1)
    }

    return array
}

function backToMenu() {
    menu.style.transition = '300ms'
    gameContainer.style.transition = '300ms'

    resetGameInfo()

    boardInfo.digitElements = []

    menu.style.transform = "translateY(0vh)"
    gameContainer.style.transform = `translateY(0vh)`

    setTimeout(() => {
        menu.style.transition = 'none'
        gameContainer.style.transition = 'none'
        board.innerHTML = null
        flagCounterContainer.innerHTML = null
    }, 300)
}

function loseMenu() {
    const menu = resultMenu("lose")
    
    gameContainer.appendChild(menu)
}

function winMenu() {
    gameState.canInteractWithBoard = false
    gameState.finishTime = Date.now()

    const menu = resultMenu("win")

    gameContainer.appendChild(menu)
}

function resultMenu(winOrLose) {
    const menu = createCustomElement("div", { id: "result-menu" })

    // moving menu around with mouse
    menu.addEventListener("mousedown", (e) => {
        const anchorX = e.clientX
        const anchorY = e.clientY

        const startLeft = menu.offsetLeft
        const startTop = menu.offsetTop

        const moveMenu = (event) => {
            const deltaX = event.clientX - anchorX
            const deltaY = event.clientY - anchorY

            menu.style.left = `${startLeft + deltaX}px`
            menu.style.top = `${startTop + deltaY}px`
        }

        const stopMoving = () => {
            document.removeEventListener("mousemove", moveMenu)
            document.removeEventListener("mouseup", stopMoving)
        }

        document.addEventListener("mousemove", moveMenu)
        document.addEventListener("mouseup", stopMoving)
    })

    
    // header of the menu
    const header = createCustomElement("h2", { id: "result-menu-header" })

    if (winOrLose == "win") {
        header.innerText = "You Win!"
        header.style.color = "var(--secondary-color);"
    }
    else if (winOrLose == "lose") {
        header.innerText = "You Lose!"
        header.style.color = "red"
    }

    // handle time
    const time = createCustomElement("div", { className: "result-menu-details" })
    let totalTime = (gameState.finishTime - gameState.startTime)

    const hour = Math.floor(totalTime / 3600000)
    const minute = Math.floor((totalTime % 3600000) / 60000)
    const second = Math.floor((totalTime % 60000) / 1000)
    const millisecond = totalTime % 1000

    time.innerText = `Time: ${String(hour).padStart(2, "0")} : ${String(minute).padStart(2, "0")} : ${String(second).padStart(2, "0")}.${String(millisecond).padStart(3, "0")}`

    // tile calculations
    let boardSize
    if (boardInfo.isCircle) {
        boardSize = createCustomElement("div", { className: "result-menu-details" })
        boardSize.innerText = `Board Size: ${boardInfo.rx} x ${boardInfo.ry}, Total Tiles: ${boardInfo.tileCount} Tiles`
    }
    else {
        boardSize = createCustomElement("div", { className: "result-menu-details" })
        boardSize.innerText = `Board Size: ${boardInfo.x} x ${boardInfo.y}, Total Tiles: ${boardInfo.tileCount} Tiles`
    }

    //bomb count and density 
    const bombCountElement = createCustomElement("span", { className: "result-menu-details" })
    bombCountElement.innerText = `Bomb Count: ${boardInfo.bombCount}`

    const bombDensityElement = createCustomElement("span")
    const difficulty = bombDensityScale(boardInfo.bombDensity)
    bombDensityElement.innerText = ` (${boardInfo.bombDensity}% Bomb Density)`
    bombDensityElement.style.color = difficultyColors[difficulty]

    // handling buttons
    const buttonContainer = createCustomElement("div",  { id: "result-menu-button-container", className: "result-menu-details" })
    
    const backToMenuButton = createCustomElement("button", { id: "back-to-menu-button" })
    backToMenuButton.innerText = "←"
    backToMenuButton.addEventListener("click", () => backToMenu())

    const retryButton = createCustomElement("button", { id: "result-menu-retry-button" })
    retryButton.innerText = "⟳"
    retryButton.addEventListener("click", () => resetGame())

    buttonContainer.appendChild(backToMenuButton)
    buttonContainer.appendChild(retryButton)

    menu.appendChild(header)
    menu.appendChild(time)
    menu.appendChild(boardSize)
    menu.appendChild(bombCountElement)
    menu.appendChild(bombDensityElement)

    // handling losing parameters
    if (winOrLose == "lose") {
        const completionPercentage = createCustomElement("div", { className: "result-menu-details" })
        completionPercentage.innerText = "Tiles Checked: " + (Number(gameState.clickedTiles) + Number(gameState.falseFlags) + Number(gameState.correctFlags)) + " Tiles, " + Math.floor(((Number(gameState.clickedTiles) + Number(gameState.falseFlags) + Number(gameState.correctFlags)) / boardInfo.tileCount) * 10000) / 100 + "%."

        const accuracy = createCustomElement("span", { className: "result-menu-details" })
        accuracy.innerText = "Accuracy: " 

        const correctFlags = createCustomElement("span")
        correctFlags.innerText = gameState.correctFlags + " Correct Flag(s), "
        correctFlags.style.color = "green"

        const falseFlags = createCustomElement("span")
        falseFlags.innerText = gameState.falseFlags + " False Flag(s). "
        falseFlags.style.color = "red"

        menu.appendChild(completionPercentage)
        menu.appendChild(accuracy)
        menu.appendChild(correctFlags)
        menu.appendChild(falseFlags)

        if (gameState.flaggedPosition.length) {
            const accuracyPercentage = createCustomElement("span")
            accuracyPercentage.innerText = Math.floor((gameState.correctFlags / (gameState.falseFlags + gameState.correctFlags)) * 10000) / 100 + "% Accuracy."
            menu.appendChild(accuracyPercentage)
        }
    }

    menu.appendChild(buttonContainer)

    return menu
}

document.addEventListener("contextmenu", (e) => {
    e.preventDefault()
    flag(e)
})

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("tile")) mark(e.target)
})

document.addEventListener("dblclick", (e) => {
    if (e.target.classList.contains("tile")) doubleClickReveal(e.target)
})

// timer segment

const segmentMap = {
    0: ['top', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'bottom'],
    1: ['top-right', 'bottom-right'],
    2: ['top', 'top-right', 'middle', 'bottom-left', 'bottom'],
    3: ['top', 'top-right', 'middle', 'bottom-right', 'bottom'],
    4: ['top-left', 'top-right', 'middle', 'bottom-right'],
    5: ['top', 'top-left', 'middle', 'bottom-right', 'bottom'],
    6: ['top', 'top-left', 'middle', 'bottom-left', 'bottom-right', 'bottom'],
    7: ['top', 'top-right', 'bottom-right'],
    8: ['top', 'top-left', 'top-right', 'middle', 'bottom-left', 'bottom-right', 'bottom'],
    9: ['top', 'top-left', 'top-right', 'middle', 'bottom-right', 'bottom']
}

function createSegments(parent) {
    ['top', 'top-left', 'top-right', 'middle', 'bottom-left', 'bottom-right', 'bottom'].forEach(pos => {
        const segment = document.createElement('div')
        segment.classList.add('segment', pos)
        parent.appendChild(segment)
    })
}

document.querySelectorAll('.digit').forEach(createSegments)

function setClockToZero() {
    updateDigit(document.getElementById('minuteTens'), 0)
    updateDigit(document.getElementById('minuteOnes'), 0)
    updateDigit(document.getElementById('secondTens'), 0)
    updateDigit(document.getElementById('secondOnes'), 0)
}

function updateDigit(digitElement, number) {
    const segments = digitElement.querySelectorAll('.segment')
    segments.forEach(segment => segment.classList.remove('on'))
    segmentMap[number].forEach(pos => {
        digitElement.querySelector(`.${pos}`).classList.add('on')
    })
}

function updateClock() {
    if (gameState.startTime === undefined) {
        requestAnimationFrame(updateClock)
        return
    }

    let now

    if (gameState.canInteractWithBoard) now = Date.now()
    else now = gameState.finishTime
    
    let difference = Math.min(
        Math.floor((now - gameState.startTime) / 1000),
        99 * 60 + 59
    )

    const minutes = Math.floor(difference / 60)
    const seconds = difference % 60

    const minuteTens = Math.floor(minutes / 10)
    const minuteOnes = minutes % 10

    const secondTens = Math.floor(seconds / 10)
    const secondOnes = seconds % 10

    updateDigit(document.getElementById('minuteTens'), minuteTens || 0)
    updateDigit(document.getElementById('minuteOnes'), minuteOnes || 0)
    updateDigit(document.getElementById('secondTens'), secondTens || 0)
    updateDigit(document.getElementById('secondOnes'), secondOnes || 0)

    requestAnimationFrame(updateClock)
}

requestAnimationFrame(updateClock)

UpdateBombDensity()
// Hard coded rules: 
// 1. The area that player clicks on at the beginning will always have a 3x3 radius with no bomb.
// 2. In custom mode, bomb density cannot be higher than 60 70%. (not implemented yet)

// bomb position array directions -> from top to bottom, left to right. first element is x, second is y.
// to do: bomb asset. fix timer. add lose and win menu. add the bomb density limit + board limit. also there might be some unknown bugs idk

// menu elements
const menu = document.getElementById("menu")
const difficultySelection = document.getElementById("difficulty")
const xElement = document.getElementById("x")
const yElement = document.getElementById("y")
const bombsElement = document.getElementById("bombs")

// game elements
const board = document.getElementById("board")
const gameContainer = document.getElementById("game-container")

let surface = { x: 0, y: 0 }
let bombs = 0
let bombsPositions = []
let flaggedPosition = []
let clickedTiles = 0
let isFirstClick = true
let Difficulty = {
    easy: {
        x: 10,
        y: 10,
        bombs: 10
    },
    medium: {
        x: 15,
        y: 15,
        bombs: 40
    },
    hard: {
        x: 20,
        y: 20,
        bombs: 90
    },
}

setDifficulty()

function setDifficulty() {
    if (difficultySelection.value === "Custom") {
        xElement.disabled = false
        yElement.disabled = false
        bombsElement.disabled = false
        xElement.classList.remove("locked-input")
        yElement.classList.remove("locked-input")
        bombsElement.classList.remove("locked-input")
        return
    }

    xElement.disabled = true
    yElement.disabled = true
    bombsElement.disabled = true
    xElement.classList.add("locked-input")
    yElement.classList.add("locked-input")
    bombsElement.classList.add("locked-input")

    let selectedDifficulty = Difficulty[difficultySelection.value]
    xElement.value = selectedDifficulty.x
    yElement.value = selectedDifficulty.y
    // add cap here
    bombsElement.value = selectedDifficulty.bombs
}

difficultySelection.addEventListener("change", () => setDifficulty())

function boardLogic() {
    bombs = bombsElement.value
    surface = { x: Number(xElement.value), y: Number(yElement.value) }
    board.innerHTML = ""

    // adds tiles
    for (let x = 0; x < surface.x; x++) {
        board.appendChild(createCustomElement("div", { id: `${x}`, className:"row" }))
        for (let y = 0; y < surface.y; y++){
            document.getElementById(`${x}`).appendChild(createCustomElement("div", { id: `${x}-${y}`, className: "tile" }))
        }
    }
}

function startGame() {
    boardLogic()

    menu.style.transition = '300ms'
    gameContainer.style.transition = '300ms'

    menu.style.transform = "translateY(-100vh)"
    gameContainer.style.transform = `translateY(-100vh)`

    setTimeout(() => {
        menu.style.transition = 'none'
        gameContainer.style.transition = 'none'
    }, 300)
}

function resetGame() {
    isFirstClick = true
    clickedTiles = 0
    bombsPositions = []
    boardLogic()
}

// create random bombs
function addBombs(x, y){
    let bombPosition = [
        Math.floor(Math.random() * surface.x),
        Math.floor(Math.random() * surface.y)
    ]

    if (x == bombPosition[0] && y == bombPosition[1]) return addBombs(x, y)

    let surroundingTiles = getSurroundingTiles(x, y)

    for (let i = 0; i < surroundingTiles.length; i++) {
        if (surroundingTiles[i][0] == bombPosition[0] && surroundingTiles[i][1] == bombPosition[1]) return addBombs(x, y)
    }

    for (let i = 0; i < bombsPositions.length; i++) {
        if (bombsPositions[i][0] == bombPosition[0] && bombsPositions[i][1] == bombPosition[1]) return addBombs(x, y)
    }

    bombsPositions.push(bombPosition)
}

function mark(target) {
    const clickedElement = target
    let [x, y] = getTilePosition(target)

    if (isFirstClick) {
        for (let i = 0; i < bombs; i++) addBombs(x, y)
    } 
    isFirstClick = false

    // check if flagged
    if (clickedElement.classList.contains("flagged") || clickedElement.classList.contains("flag")) return

    if (checkForBomb(x, y)) window.alert("u lose")

    if (!clickedElement.classList.contains("clicked")) {
        clickedElement.classList.add("clicked") 
        clickedTiles++
    }

    revealSurrounding(x, y)

    if (clickedTiles == (surface.x * surface.y) - bombs) win()
}

function checkForBomb(x, y) {
    return bombsPositions.some(element => x == element[0] && y == element[1])
}

function revealSurroundingAnimation(x, y) {
    let forCheckPositions = getSurroundingTiles(x, y)

    setTimeout(() => {
        forCheckPositions.forEach(position => {
            if (!document.getElementById(`${position[0]}-${position[1]}`)?.classList.contains("clicked")) {
                revealSurrounding(position[0], position[1])
            }
        })
    }, 50)
}

function revealSurrounding(x, y) {
    let clickedElement = document.getElementById(`${x}-${y}`)
    let forCheckPositions = getSurroundingTiles(x, y)
    let surroundingBombs = 0

    forCheckPositions.forEach(position => {
        if (checkForBomb(position[0], position[1])) surroundingBombs += 1
    })

    if (surroundingBombs === 0) {
        clickedElement.innerText = ""
        if (!clickedElement.classList.contains("clicked")) {
            clickedElement.classList.add("clicked")
            clickedTiles++
        }
        
        revealSurroundingAnimation(x, y)
    }
    else {
        clickedElement.innerText = surroundingBombs
        if (!clickedElement.classList.contains("clicked")) {
            clickedElement.classList.add("clicked")
            clickedTiles++
        }
    }
}

function getSurroundingTiles(x, y) {
    let surroundingTiles = []

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (
                x + dx >= 0 &&
                x + dx < surface.x &&
                y + dy >= 0 &&
                y + dy < surface.y &&
                !(dx === 0 && dy === 0)
            ) {
                surroundingTiles.push([x + dx, y + dy])
            }
        }
    }

    return surroundingTiles
}

function createCustomElement(tag, { id = "", className = "" }) {
    const element = document.createElement(tag)

    if (id) element.id = id
    if (className) element.className = className

    return element
}

function flag(e) {
    let targetedElement = e.target
    if (targetedElement.classList.contains("clicked") || !targetedElement.classList.contains("tile")) {
        if (targetedElement.classList.contains("flag")) removeFlag(targetedElement.parentNode)
        return
    }
    else if (targetedElement.classList.contains("flagged")) {
        removeFlag(targetedElement)
        return
    }
    else targetedElement.classList.add("flagged")

    let flag = createCustomElement("img", {
        className: `flag`,
        id: targetedElement.id
    })

    flag.src = "Assets/flag.png"
    targetedElement.appendChild(flag)
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

// this is a little bit weird
function backToMenu() {
    menu.style.transition = '300ms'
    gameContainer.style.transition = '300ms'

    menu.style.transform = "translateY(0vh)"
    gameContainer.style.transform = `translateY(0vh)`

    setTimeout(() => {
        menu.style.transition = 'none'
        gameContainer.style.transition = 'none'
    }, 300)
}

function win() {
    window.alert("u win")
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

function updateDigit(digitElement, number) {
    const segments = digitElement.querySelectorAll('.segment')
    segments.forEach(segment => segment.classList.remove('on'))
    segmentMap[number].forEach(pos => {
        digitElement.querySelector(`.${pos}`).classList.add('on')
    })
}

function updateClock() {
    const now = new Date()
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')

    updateDigit(document.getElementById('minuteTens'), minutes[0])
    updateDigit(document.getElementById('minuteOnes'), minutes[1])
    updateDigit(document.getElementById('secondTens'), seconds[0])
    updateDigit(document.getElementById('secondOnes'), seconds[1])

    requestAnimationFrame(updateClock)
}

requestAnimationFrame(updateClock)
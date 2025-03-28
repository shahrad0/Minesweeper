// menu elements
const menu = document.getElementById("menu")
const difficultySelection = document.getElementById("difficulty")
const xElement = document.getElementById("x")
const yElement = document.getElementById("y")
const bombsElement = document.getElementById("bombs")

// game elements
const board = document.getElementById("board")
const gameContainer = document.getElementById("game-container")

let surface = { x, y }
let bombs = 0
let bombsPositions = []
let flaggedPosition = []
let Difficulty = {
    easy: {
        x: 10,
        y: 10,
        bombs: 10
    },
    medium: {
        x: 15,
        y: 15,
        bombs: 50
    },
    hard: {
        x: 20,
        y: 20,
        bombs: 100
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
    bombsElement.value = selectedDifficulty.bombs
}

difficultySelection.addEventListener("change", () => setDifficulty())

function startGame() {
    bombs = bombsElement.value
    surface = { x: Number(xElement.value), y: Number(yElement.value) }
    board.innerHTML = ""

    // adds tiles
    for (let y = 0; y < surface.y; y++){
        board.appendChild(createCustomElement("div", { id: `${y}`, className: "row" }))
        for (let x = 0; x < surface.x; x++) {
            document.getElementById(`${y}`).appendChild(createCustomElement("div", { id: `${x}-${y}`, className:"tile" }))
        }
    }
    // adds bombs
    for (let i = 0; i < bombs; i++){
        randomBombTile()
    }

    menu.style.transform = "translateY(-100vh)"
    gameContainer.style.transform = `translateY(-100vh)`

    setTimeout(() => {
        gameContainer.style.transition = 'none'
        menu.style.transition = 'none'
    }
    , 300)
}

// create random bombs
function randomBombTile(){
    let bombPosition = [
        Math.floor(Math.random() * surface.x),
        Math.floor(Math.random() * surface.y)
    ]
    const bomb = document.getElementById(`${bombPosition[0]}-${bombPosition[1]}`)

    if (bomb.classList.contains("red")) randomBombTile()
    else {
        bomb.classList.add("red")
        bombsPositions.push(bombPosition)
    }
}

function mark(target) {
    const clickedElement = target
    if (clickedElement.classList.contains("flagged") || clickedElement.classList.contains("flag")) return
    if (clickedElement.classList.contains("red")) window.alert("you lose")
    if (!clickedElement.classList.contains("clicked")) clickedElement.classList.add("clicked") 

    let [x, y] = clickedElement.id.split("-").map(Number)

    checkForBomb({x: x, y: y})
}

function revealSurrounding(position) {
    let forCheckPositions = getSurroundingTiles(position)

    setTimeout(() => {
        forCheckPositions.forEach(position => {
            if (!document.getElementById(`${position.x}-${position.y}`)?.classList.contains("clicked")) {
                checkForBomb({ x: position.x, y: position.y })
            }
        })
    }, 50)
}

function checkForBomb({ x, y }) {
    let clickedElement = document.getElementById(`${x}-${y}`)
    let forCheckPositions = getSurroundingTiles({ x, y })
    let surroundingBombs = 0

    forCheckPositions.forEach(position => {
        if (document.getElementById(`${position.x}-${position.y}`).classList.contains("red")) surroundingBombs += 1
    })

    if (surroundingBombs === 0) {
        clickedElement.innerText = ""
        if (!clickedElement.classList.contains("clicked")) clickedElement.classList.add("clicked")
        
        revealSurrounding({ x, y })
    }
    else {
        clickedElement.innerText = surroundingBombs
        if (!clickedElement.classList.contains("clicked")) clickedElement.classList.add("clicked")
    }
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

function getSurroundingTiles(position) {
    let surroundingTiles = []

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (
                position.x + dx >= 0 &&
                position.x + dx < surface.x &&
                position.y + dy >= 0 &&
                position.y + dy < surface.y &&
                !(dx === 0 && dy === 0)
            ) {
                surroundingTiles.push({ x: position.x + dx, y: position.y + dy })
            }
        }
    }

    return surroundingTiles
}

function doubleClickReveal(target) {
    let [x, y] = target.id.split("-").map(Number)

    let clickedPosition = { x, y }
    let surroundingTiles = getSurroundingTiles(clickedPosition)
    let flaggedTile = 0
    let unmarkedPosition = []
    // this could be a problem 
    let bombs = target.innerText

    
    surroundingTiles.forEach(element => {
        if (document.getElementById(`${element.x}-${element.y}`).classList.contains("flagged")) { 
            flaggedTile ++
            return
        }
        if (!document.getElementById(`${element.x}-${element.y}`).classList.contains("clicked")) {
            unmarkedPosition.push(element)
        }
    })

    if (bombs == flaggedTile) {
        unmarkedPosition.forEach(element => {
            mark(document.getElementById(`${element.x}-${element.y}`))
        })
    }
}

document.addEventListener("contextmenu", (e) => {
    e.preventDefault()
    flag(e)
})

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("tile")) mark(e.target)
})

document.addEventListener("dblclick", (e) => {
    doubleClickReveal(e.target)
})
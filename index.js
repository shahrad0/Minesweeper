const board = document.getElementById("board")

let surface = 40
let bombs = 300
let bombsPositions = []
let flaggedPosition = []

// adds tiles
for(let i = 0; i < surface; i++){
    board.appendChild(createCustomElement("div", { id: `${i}`, className: "row" }))
    for (let j = 0; j < surface; j++) {
        document.getElementById(`${i}`).appendChild(createCustomElement("div", { id:`${i}-${j}`, className:"tile" }))
    }
}

// create random bombs
function randomBombTile(){
    let bombPosition = [Math.floor(Math.random() * surface), Math.floor(Math.random() * surface)]
    const bomb = document.getElementById(`${bombPosition[0]}-${bombPosition[1]}`)

    if (bomb.classList.contains("red")) randomBombTile()
    else {
        bomb.classList.add("red")
        bombsPositions.push(bombPosition)
    }
}

for (let i = 0; i < bombs; i++){
    randomBombTile()
}

function mark(target) {
    const clickedElement = target
    if (clickedElement.classList.contains("flagged") || clickedElement.classList.contains("flag")) return
    if (clickedElement.classList.contains("red")) window.alert("you lose")
    if (!clickedElement.classList.contains("clicked")) clickedElement.classList.add("clicked") 

    let [ x, y ] = clickedElement.id.split("-")
    x = parseInt(x)
    y = parseInt(y)

    let clickedPosition = { 
        x: x,
        y: y
    }

    checkForBomb(clickedPosition, clickedElement)
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
            if (position.x + dx >= 0 && position.x + dx < surface && position.y + dy >= 0 && position.y + dy < surface && !(position.x + dx === position.x && position.y + dy === position.y)) {
                surroundingTiles.push({ x: position.x + dx, y: position.y + dy })
            }
        }
    }

    return surroundingTiles
}

function doubleClickReveal(target) {
    let [x, y] = target.id.split("-")
    x = parseInt(x)
    y = parseInt(y)

    let surroundingTiles = getSurroundingTiles({ x, y })
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
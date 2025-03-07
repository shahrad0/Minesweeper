const board = document.getElementById("board")

let surface = 20
let bombs = 40
let bombsPositions = []

// adds tiles
for(let i = 0; i < surface; i++){
    board.appendChild(createCustomElement("div", { id: `${i}`, className: "row" }))
    for (let j = 0; j < surface; j++) {
        document.getElementById(`${i}`).appendChild(createCustomElement("div", { id:`${i}-${j}`, className:"tile", onClick: mark }))
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

function mark(event) {
    const clickedElement = event.target
    if (clickedElement.classList.contains("red")) window.alert("you lose")
    if (!clickedElement.classList.contains("clicked")) clickedElement.classList.add("clicked") 

    let xTile = ""
    let yTile = ""
    let reached = false
    for (let i = 0;i < clickedElement.id.length;i++ ) {
        if (clickedElement.id[i] === '-') {
            reached = true
            continue
        }
        reached ? yTile += clickedElement.id[i] : xTile += clickedElement.id[i]
    }

    xTile = parseInt(xTile)
    yTile = parseInt(yTile)

    let clickedPosition = { 
        x: xTile,
        y: yTile
    }

    checkForBomb(clickedPosition, clickedElement)
}

function revealSurrounding(position) {
    let forCheckPositions = []

    if (position.x === 0) forCheckPositions.push([position.x + 1, position.y])
    else if (position.x === surface - 1) forCheckPositions.push([position.x - 1, position.y])
    else forCheckPositions.push([position.x - 1, position.y], [ position.x + 1, position.y])  

    if (position.y === 0) forCheckPositions.push([position.x, position.y + 1])
    else if (position.y === surface - 1) forCheckPositions.push([position.x, position.y - 1])
    else forCheckPositions.push([position.x, position.y - 1], [position.x, position.y + 1]) 

    console.log(forCheckPositions)
    setTimeout(() => {
        forCheckPositions.forEach(position => {
            if (!document.getElementById(`${position[0]}-${position[1]}`)?.classList.contains("clicked")) {
                checkForBomb({ x: position[0], y: position[1] })
                console.log(document.getElementById(`${position[0]}-${position[1]}`))
            }
        })
    }, 50)
}

function checkForBomb({ x, y }) {
    let clickedElement = document.getElementById(`${x}-${y}`)
    let forCheckPositions = []
    let surroundingBombs = 0

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (x + dx >= 0 && x + dx < surface && y + dy >= 0 && y + dy < surface) {
                forCheckPositions.push({ x: x + dx, y: y + dy })
            }
        }
    }

    forCheckPositions.forEach(position => {
        if (document.getElementById(`${position.x}-${position.y}`).classList.contains("red")) surroundingBombs += 1
    })

    if (surroundingBombs === 0) {
        clickedElement.innerText = ""
        if (!clickedElement.classList.contains("clicked")) {
            clickedElement.classList.add("clicked")
        }
        revealSurrounding({ x, y })
    }
    else clickedElement.innerText = surroundingBombs
}

function createCustomElement(tag, { id = "", className = "", onClick = null }) {
    const element = document.createElement(tag)

    if (id) element.id = id
    if (className) element.className = className
    if (onClick) element.onclick = onClick

    return element
}
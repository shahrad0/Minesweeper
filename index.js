const board = document.getElementById("board")

let surface = 20
let bombs = 50
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

    let horizontalTile = ""
    let verticalTile = ""
    let reached = false
    for (let i = 0;i < clickedElement.id.length;i++ ) {
        if (clickedElement.id[i] === '-') {
            reached = true
            continue
        }
        reached ? verticalTile += clickedElement.id[i] : horizontalTile += clickedElement.id[i]
    }

    horizontalTile = parseInt(horizontalTile)
    verticalTile = parseInt(verticalTile)

    let clickedPosition = { 
        horizontal: horizontalTile,
        vertical: verticalTile
    }

    console.log(clickedPosition)
    checkForBomb(clickedPosition, clickedElement)
}

function revealSurrounding(position) {
    
}

function checkForBomb({ horizontal, vertical }, clickedElement) {
    let surroundingTiles = { horizontal, vertical }
    let surroundingBombs = 0
 
    if (!horizontal === 0) surroundingTiles.horizontal = [horizontal, horizontal + 1]
    else if (!horizontal === surface - 1) surroundingTiles.horizontal = [horizontal, horizontal - 1]
    else surroundingTiles.horizontal = [horizontal, horizontal - 1, horizontal + 1]

    if (vertical === 0) surroundingTiles.vertical = [vertical, vertical + 1]
    else if (vertical === surface - 1) surroundingTiles.vertical = [vertical, vertical - 1]
    else surroundingTiles.vertical = [vertical, vertical - 1, vertical + 1]

    surroundingTiles.vertical.forEach(vertical => {
        surroundingTiles.horizontal.forEach(horizontal => {
            if (document.getElementById(`${horizontal}-${vertical}`).classList.contains("red")) surroundingBombs += 1
        })
    })

    if (surroundingBombs === 0) {
        clickedElement.innerText = 0
        revealSurrounding({ horizontal, vertical })
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
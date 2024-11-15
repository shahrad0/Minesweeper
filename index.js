const board = document.getElementById("board")
function createCustomElement(tag, {id = "",className = "",onClick = null}){
    const element = document.createElement(tag)

    if (id) element.id = id
    if (className) element.className = className
    if (onClick) element.onclick = onClick

    return element
}

let surface = 20
let bombs = 50
let bombsPositions = []
for(let i = 0; i < surface; i++){
    board.appendChild(createCustomElement("div",{id:`${i}`,className:"row",}))
    for(let j = 0; j < surface; j++){
        document.getElementById(`${i}`).appendChild(createCustomElement("div",{id:`${i}-${j}`,className:"tile",onClick:mark}))
    }   
}
function randomBombTile(){
    let bombPosition =  [Math.floor( Math.random() * surface),Math.floor( Math.random() * surface)]
    const bomb = document.getElementById(`${bombPosition[0]}-${bombPosition[1]}`)

    if (bomb.classList.contains("red")) randomBombTile()
    else bomb.classList.add("red")
}
for (let i = 0; i < bombs; i++){
    randomBombTile()
}
function mark(event){
    const clickedElement = event.target
    if (clickedElement.classList.contains("red")) window.alert("you lose")
    if (!clickedElement.classList.contains("clicked")) clickedElement.classList.add("clicked") 
    
    let surroundingBombs   = 0
    let tempTileRow = ""
    let tempTile = ""
    let reached = false
    for(let i = 0;i < clickedElement.id.length;i++ ){
        if (clickedElement.id[i] === '-')   {reached = true; continue}
        reached ? tempTileRow += clickedElement.id[i] : tempTile += clickedElement.id[i]
    }
    let tile =  []
    tempTile = parseInt(tempTile)
    tempTileRow = parseInt(tempTileRow)
    if      (!tempTile === 0)    tile = [tempTile,tempTile+1]
    else if (!tempTile === surface-1)    tile = [tempTile,tempTile-1]
    else tile = [tempTile, tempTile-1, tempTile+1]
    
    let tileRow =  []
    if      (tempTileRow === 0)    tileRow = [tempTileRow,tempTileRow+1]
    else if (tempTileRow === surface-1)    tileRow = [tempTileRow,tempTileRow-1]
    else tileRow = [tempTileRow,tempTileRow-1,tempTileRow+1]
    
    tileRow.forEach(element => {
        tile.forEach(delement => {
            if (document.getElementById(`${delement}-${element}`).classList.contains("red"))surroundingBombs +=1
        
        });
    });
    clickedElement.innerText = surroundingBombs
}
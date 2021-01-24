var gridSize = 101;
const startSettings = { x: 0, y: 1 };
var endSettings = { x: gridSize - 1, y: gridSize - 2 };
var enableDiagonalMove = false;
// var draw = false;
// var remove = false;
var nodes, q;

function initNodes(){
    nodes = [];
    q = [gridSize * gridSize];
    for (let i = 0; i < gridSize; i++) {
        var column = [];
        for (let j = 0; j < gridSize; j++) {
            var node = {
                isWall: false,
                dist: Infinity,
                prev: undefined,
                pos: {x: i, y: j}
            }
            column.push(node);
        }
        nodes.push(column);
    }
}

function handleCheckBoxChange(target){
    target.value = target.value === "on" ? "off" : "on";
    enableDiagonalMove = target.value === "on";
}

// function handleEvent() {
//     var coordinates = this.id.split(":");
//     coordinates[0] = parseInt(coordinates[0]);
//     coordinates[1] = parseInt(coordinates[1]);
//     if (remove) {
//         for (let i = -1; i <= 1; i++) {
//             for (let j = -1; j <= 1; j++) {
//                 nodes[coordinates[1] + i][coordinates[0] + j].isWall = false;
//             }
//         }
//         for (let i = -1; i <= 1; i++) {
//             for (let j = -1; j <= 1; j++) {
//                 document.getElementById(`${coordinates[0] + i}:${coordinates[1] + j}`).style.backgroundColor = nodes[coordinates[1] + j][coordinates[0] + i].isWall ? "black" : "white";
//             }
//         }
//     } else if (draw) {
//         for (let i = -1; i <= 1; i++) {
//             for (let j = -1; j <= 1; j++) {
//                 nodes[coordinates[1] + i][coordinates[0] + j].isWall = true;
//             }
//         }
//         for (let i = -1; i <= 1; i++) {
//             for (let j = -1; j <= 1; j++) {
//                 document.getElementById(`${coordinates[0] + i}:${coordinates[1] + j}`).style.backgroundColor = nodes[coordinates[1] + j][coordinates[0] + i].isWall ? "black" : "white";
//             }
//         }
//     }
// }

function createGrid() {
    var parent = document.getElementById("maze");
    for (let i = 0; i < gridSize; i++) {
        var row = document.createElement("div");
        row.className = "row";
        for (let j = 0; j < gridSize; j++) {
            var cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `${j}:${i}`;
            cell.style.height = 80/gridSize + "vmin";
            cell.style.width = 80/gridSize + "vmin";
            // cell.addEventListener("mouseenter", handleEvent.bind(cell))
            row.append(cell);
        }
        parent.append(row);
    }
}

function removeGrid() {
    var parent = document.getElementById("maze");
    while (parent.hasChildNodes()) {
        var child = parent.firstChild;
        parent.removeChild(child);
    }
}

// function addDrawingHandlers() {
//     document.addEventListener('contextmenu', event => event.preventDefault());
//     document.getElementById("maze").addEventListener("mousedown", (evt) => {
//         if (evt.button === 2) {
//             remove = true;
//         } else if (evt.button === 0) {
//             draw = true;
//         }
//     })
//     document.getElementById("maze").addEventListener("mouseup", (evt) => {
//         if (evt.button === 2) {
//             remove = false;
//         } else if (evt.button === 0) {
//             draw = false;
//         }
//     })
//     document.addEventListener("keypress", (evt) => {
//         document.getElementById("maze").addEventListener("mousedown", () => { });
//         remove = false;
//         draw = false;
//         if (evt.key === " ") {
//             dijkstra(startSettings, endSettings);
//         }
//     })
// }

function importMaze(){
    const canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var data = ctx.getImageData(0,0,gridSize,gridSize).data;
    for(let i = 0; i < gridSize; i++){
        for (let j = 0; j < gridSize; j++) {
            var dataIndex = j * gridSize * 4 + i * 4;
            nodes[i][j].isWall = data[dataIndex] === 0;
            document.getElementById(`${j}:${i}`).style.backgroundColor = nodes[i][j].isWall ? "black" : "white"
        }
    }
}

function handleImport(){
    const input = document.getElementById('fileSelector');
    const canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    input.addEventListener('change', async function (e) {
        var img = new Image();
        img.onload = ()=>{
            canvas.setAttribute("height", img.height);
            canvas.setAttribute("width", img.width);
            gridSize = Math.max(img.height, img.width);
            endSettings = { x: gridSize - 1, y: gridSize - 2 };
            ctx.drawImage(img,0,0);
            removeGrid();
            createGrid();
            initNodes();
            importMaze();
            document.getElementById("startButton").addEventListener("click", ()=>{dijkstra(startSettings,endSettings);})
        }
        img.src = URL.createObjectURL(e.target.files[0]);
    });
}

window.onload = function () {
    createGrid();
    // addDrawingHandlers();
    handleImport();
}
/**
 * 
 * @param {Object} source {x, y}
 * @param {Object} end {x, y}
 */

function dijkstra(source, end) {
    var startTime = new Date();
    nodes[source.x][source.y].dist = 0;
    document.getElementById(`${source.y}:${source.x}`).style.backgroundColor = "blue"
    initNotVisitedArray();
    while(!isEmpty()) {
        var u = extract_min();
        if(enableDiagonalMove){
            for(let i = -1; i <= 1; i++){
                for(let j = -1; j <= 1; j++){
                    if(j !== 0 || i !== 0){
                        var selectedCoords = {x: u.pos.x + i, y: u.pos.y + j};
                        if(isValidStep(selectedCoords)){
                            var selectedDist = u.dist + length(u.pos, selectedCoords);
                                if(selectedDist < nodes[selectedCoords.x][selectedCoords.y].dist){
                                nodes[selectedCoords.x][selectedCoords.y].dist = selectedDist;
                                nodes[selectedCoords.x][selectedCoords.y].prev = u.pos;
                            }
                        }
                    }
                }
            }
        }else{
            for(let i = -2; i <= 2; i++){
                var x = i % 2;
                var y = parseInt(i / 2);
                if(x !== 0 || y !== 0){
                    var selectedCoords = {x: u.pos.x + x, y: u.pos.y + y};
                    if(isValidStep(selectedCoords)){
                        var selectedDist = u.dist + length(u.pos, selectedCoords);
                            if(selectedDist < nodes[selectedCoords.x][selectedCoords.y].dist){
                            nodes[selectedCoords.x][selectedCoords.y].dist = selectedDist;
                            nodes[selectedCoords.x][selectedCoords.y].prev = u.pos;
                        }
                    }
                }
            }
        }
    }
    drawRouteWithPrevious(end, source);
    var endTime = new Date();
    document.getElementById("time").innerHTML = (endTime - startTime)/1000 + "s"
}

function initNotVisitedArray(){
    q = [];
    var q_last_index = 0;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if(!nodes[i][j].isWall){
                q[q_last_index] = nodes[i][j].pos;
                q_last_index++;
            }
        }
    }
}

function isEmpty(){
    for(let i = 0; i < q.length; i++){
        var pos = q[i];
        if(pos !== undefined){
            return false;
        }
    }
    return true;
}

function isValidStep(coords) {
    if (coords.x >= 0 && coords.x < gridSize && coords.y >= 0 && coords.y < gridSize) {
        return !nodes[coords.x][coords.y].isWall;
    } else return false;
}

function extract_min(){
    var best_v = undefined;
    var best_index;
    for(let i = 0; i < q.length; i++){
        var pos = q[i];
        if(pos){
            var v = nodes[pos.x][pos.y]
            if(best_v){
                if(v.dist < best_v.dist){
                    best_v = v;
                    best_index = i;
                }
            }else{
                best_v = v;
                best_index = i;
            }
        }
    }
    q[best_index] = undefined;
    return best_v;
}

function length(u, v){
    var l = Math.sqrt((v.x - u.x) * (v.x - u.x) + (v.y - u.y) * (v.y - u.y));
    return l;
}

function drawRoute(current, end) {
    if (current.x === end.x && current.y === end.y) return;
    document.getElementById(`${current.y}:${current.x}`).style.backgroundColor = "green";
    var bestCoords;
    var bestDist;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            var selectedCoords = { x: current.x + i, y: current.y + j };
            if ((i !== 0 || j !== 0) && isValidStep(selectedCoords)) {
                var node = nodes[selectedCoords.x][selectedCoords.y];
                if (bestCoords) {
                    if (node.dist < bestDist) {
                        bestCoords = selectedCoords;
                        bestDist = node.dist;
                    }
                } else {
                    bestCoords = selectedCoords;
                    bestDist = node.dist;
                }
            }
        }
    }
    drawRoute(bestCoords, end);
}

function drawRouteWithPrevious(current, end) {
    if (current.x === end.x && current.y === end.y) return;
    document.getElementById(`${current.y}:${current.x}`).style.backgroundColor = "lime";
    var prev = nodes[current.x][current.y].prev;
    if(prev)
        drawRouteWithPrevious(prev, end);
}
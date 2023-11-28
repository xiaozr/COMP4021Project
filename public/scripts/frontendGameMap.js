const PlayerID_to_Color = {
	0 : null,
	1 : "red",
	2 : "blue",
	3 : "green",
	4 : "brown",
	5 : "yellow",
	6 : "Coral",
	7 : "GreenYellow",
	8 : "OliveDrab"
}

const surrondingLocations = [
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, -1],
	[0, 0],
	[0, 1],
	[1, -1],
	[1, 0],
	[1, 1],
];

const gameMap = (function() {
	const table = document.getElementById("gameMap");
	
    let rowCnt, colCnt;
	let storedGameMap, playerList;

	let selectedCell;
	let myPlayerID;

	function isInMap(r, c){
		return (r >= 0 && r < rowCnt && c >= 0 && c < colCnt && storedGameMap.staticMap[r][c] != '*');
	}
	function checkShow(r, c){
		for(let [dx, dy] of surrondingLocations)
			if(isInMap(r+dx, c+dy) && storedGameMap.playerMap[r+dx][c+dy] == myPlayerID)
				return true;
		return false;
	}
	function showCell(i, j){
		document.getElementById(`img-${i},${j}`).setAttributeNS('http://www.w3.org/1999/xlink','href', MapValueEnum_to_image[storedGameMap.staticMap[i][j]]);
		document.getElementById(`span-${i},${j}`).textContent = storedGameMap.unitsMap[i][j];
		document.getElementById(`span-${i},${j}`).style.visibility = storedGameMap.unitsMap[i][j] > 0 ? 'visible' : 'hidden';
		document.getElementById(`cell-${i},${j}`).style.backgroundColor = PlayerID_to_Color[storedGameMap.playerMap[i][j]];
	}
	function hideCell(i, j){
		document.getElementById(`img-${i},${j}`).setAttributeNS('http://www.w3.org/1999/xlink','href', storedGameMap.staticMap[i][j] == '*' ? "imgs/mountain.svg" : "imgs/empty.svg");
		document.getElementById(`span-${i},${j}`).style.visibility = 'hidden';
		document.getElementById(`cell-${i},${j}`).style.backgroundColor = "Grey";
	}
	function updateHightlightColor(){
		if(selectedCell){
			const {r, c} = selectedCell;
			const hightlightingPath = document.getElementById('hightlight');
			if(storedGameMap.playerMap[r][c] != myPlayerID){
				hightlightingPath.style.stroke = "black";
			}
			else {
				hightlightingPath.style.stroke = "white";
			}
		}
	}

	function updateSelectedCell(r, c, rate){
		let hightlightingPath;
		if(selectedCell){
			// document.getElementById(`cell-${selectedCell.r},${selectedCell.c}`).classList.remove("selected-cell");
			hightlightingPath = document.getElementById('hightlight');
			document.getElementById(`svg-${selectedCell.r},${selectedCell.c}`).removeChild(hightlightingPath);
		}
		else {
			hightlightingPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			hightlightingPath.classList.add("highlight-path");
			hightlightingPath.setAttribute('id', 'hightlight');
			hightlightingPath.setAttribute('d', 'M 0 0 L 80 0 L 80 80 L 0 80 L 0 0');
		}
		selectedCell = {r, c, rate};
		// document.getElementById(`cell-${r},${c}`).classList.add("selected-cell");
		document.getElementById(`svg-${r},${c}`).appendChild(hightlightingPath);
		updateHightlightColor();
	}

	function compareMap(staticMap, unitsMap, playerMap) {
		const result = {};
		for (let i = 0; i < rowCnt; i++)
			for (let j = 0; j < colCnt; j++){
				if(playerMap[i][j] != myPlayerID)
					continue;
				if(storedGameMap.staticMap[i][j] == MapValueEnum.BONUS && staticMap[i][j] != MapValueEnum.BONUS)
					result["BONUS"] = true;
				if(storedGameMap.staticMap[i][j] == MapValueEnum.TRAP && staticMap[i][j] != MapValueEnum.TRAP)
					result["TRAP"] = true;
				if(storedGameMap.staticMap[i][j] == MapValueEnum.HOLE && 
					(unitsMap[i][j] > storedGameMap.unitsMap[i][j] || playerMap[i][j] != storedGameMap.playerMap[i][j]))
					result["HOLE"] = true;
				if(storedGameMap.staticMap[i][j] == MapValueEnum.GENERAL && playerMap[i][j] != storedGameMap.playerMap[i][j])
					result["GENERAL"] = true;
				if(storedGameMap.staticMap[i][j] == MapValueEnum.CITY && playerMap[i][j] != storedGameMap.playerMap[i][j])
					result["CITY"] = true;
			}
		return result;
	}
	
	function renderMap(staticMap, unitsMap, playerMap) {
		storedGameMap = {staticMap, unitsMap, playerMap};
		for (let i = 0; i < rowCnt; i++)
			for (let j = 0; j < colCnt; j++){
				if(myPlayerID == null || checkShow(i, j))
					showCell(i, j);
				else
					hideCell(i, j);
			}
		updateHightlightColor();
	}

	function initMap(staticMap, players){
		while (table.firstChild) {
			table.removeChild(table.firstChild);
		}
		rowCnt = staticMap.length;
		colCnt = staticMap[0].length;
		myPlayerID = players[Authentication.getUser().username];
		for (let i = 0; i < rowCnt; i++) {
			let row = document.createElement("tr");
			for (let j = 0; j < colCnt; j++) {
				let cell = document.createElement("td");
				cell.classList.add("cell");

				const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("width", "80");
				svg.setAttribute("height", "80");
				svg.setAttribute('id', `svg-${i},${j}`);
				cell.appendChild(svg);

				const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
				img.id = `img-${i},${j}`;
				img.setAttribute("height", "78");
				img.setAttribute("width", "78");
				svg.appendChild(img);
	
				const indexSpan = document.createElement("span");
				indexSpan.classList.add("grid-number");
				indexSpan.id = `span-${i},${j}`;

				cell.appendChild(indexSpan);

				cell.id = `cell-${i},${j}`;
				cell.onclick = () => {
					updateSelectedCell(i, j, 1);
					console.log(selectedCell);
				}
				cell.ondblclick = () => {
					updateSelectedCell(i, j, 0.5);
					console.log(selectedCell);
				}
				row.appendChild(cell);
			}
			table.appendChild(row);
		}

	}

	function move(dir){
		if(!selectedCell)
            return ;
        let {r, c, rate} = selectedCell;
		let [dr, dc] = Dir_to_diff[dir];
		r += dr;
		c += dc;
		if(!isInMap(r, c)){
			return ;
		};
		console.log("selected cell: " + selectedCell);
		const payload = {r1: selectedCell.r, c1: selectedCell.c, dir, rate};
		updateSelectedCell(r, c, 1);
		Socket.addOperation(JSON.stringify(payload));
	}

	function cheat(){
		if(!selectedCell)
			return ;
		let cellToChange = {r1: selectedCell.r, c1: selectedCell.c};
		console.log("Player cheat!")
		Socket.cheat(cellToChange);
		
		const toStr = mat => mat.map(x => x.join("")).join("\n");
		console.log(toStr(storedGameMap.playerMap));
	}

	return {renderMap, initMap, move, cheat, compareMap};
})();


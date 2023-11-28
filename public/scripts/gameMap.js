const MapValueEnum_to_image = {
	'*': "imgs/mountain.svg", 	//mountains
	'$': "imgs/general.svg", 	//generals
	'#': "imgs/city.svg", 		//cities
	'.': "imgs/empty.svg" 		//empty space	
};

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
	let gamemap;

	let selectedCell;
	let myPlayerID;

	function isInMap(r, c){
		return (r >= 0 && r < rowCnt && c >= 0 && c < colCnt && gamemap.staticMap[r][c] != '*');
	}
	function checkShow(r, c){
		for(let [dx, dy] of surrondingLocations)
			if(isInMap(r+dx, c+dy) && gamemap.playerMap[r+dx][c+dy] == myPlayerID)
				return true;
		return false;
	}
	function showCell(i, j){
		document.getElementById(`img-${i},${j}`).src = MapValueEnum_to_image[gamemap.staticMap[i][j]];
		document.getElementById(`span-${i},${j}`).textContent = gamemap.unitsMap[i][j];
		document.getElementById(`span-${i},${j}`).style.visibility = gamemap.unitsMap[i][j] > 0 ? 'visible' : 'hidden';
		document.getElementById(`cell-${i},${j}`).style.backgroundColor = PlayerID_to_Color[gamemap.playerMap[i][j]];
	}
	function hideCell(i, j){
		document.getElementById(`img-${i},${j}`).src = gamemap.staticMap[i][j] == '*' ? "imgs/mountain.svg" : "imgs/empty.svg";
		document.getElementById(`span-${i},${j}`).style.visibility = 'hidden';
		document.getElementById(`cell-${i},${j}`).style.backgroundColor = "Grey";
	}

	function updateSelectedCell(r, c, rate){
		if(selectedCell){
			document.getElementById(`cell-${selectedCell.r},${selectedCell.c}`).classList.remove("selected-cell");
		}
		selectedCell = {r, c, rate};
		document.getElementById(`cell-${r},${c}`).classList.add("selected-cell");
	}
	
	function renderMap(staticMap, unitsMap, playerMap) {
		gamemap = {staticMap, unitsMap, playerMap};
		for (let i = 0; i < rowCnt; i++)
			for (let j = 0; j < colCnt; j++){
				if(myPlayerID == null || checkShow(i, j))
					showCell(i, j);
				else
					hideCell(i, j);
			}
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
	
				let img = document.createElement("img");
				img.id = `img-${i},${j}`;
				img.height = 78;
				img.width = 78;
				cell.appendChild(img);
	
				let indexSpan = document.createElement("span");
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
		switch(dir){
			case 0: //"w"
				r -= 1; break;
			case 1: //"a"
				c -= 1; break;
			case 2: //"s"
				r += 1; break;
			case 3: //"d"
				c += 1; break;
			default:
				return ;
		};
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
		console.log(toStr(gamemap.playerMap));
	}

	return {renderMap, initMap, move, cheat};
})();


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

let selectedCell;

function initMap(staticMap, unitsMap, playerMap, rowCnt, colCnt, table){
	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}

	for (let i = 0; i < rowCnt; i++) {
		let row = document.createElement("tr");
		for (let j = 0; j < colCnt; j++) {
			let cell = document.createElement("td");
			cell.classList.add("cell");

			let img = document.createElement("img");
			img.id = `img-${i},${j}`;
			img.src = MapValueEnum_to_image[staticMap[i][j]];
			img.height = 78;
			img.width = 78;
			cell.appendChild(img);

			let indexSpan = document.createElement("span");
			indexSpan.classList.add("grid-number");
			indexSpan.id = `span-${i},${j}`;
			indexSpan.textContent = unitsMap[i][j];
			indexSpan.style.visibility = unitsMap[i][j] > 0 ? 'visible' : 'hidden';
			cell.appendChild(indexSpan);

			cell.style.backgroundColor = PlayerID_to_Color[playerMap[i][j]];
			cell.id = `cell-${i},${j}`;
			cell.onclick = () => {
				selectedCell = {r: i, c: j, rate: 0.5};
				console.log(selectedCell);
			}
			cell.ondblclick = () => {
				selectedCell = {r: i, c: j, rate: 0.5};
				console.log(selectedCell);
			}
			row.appendChild(cell);
		}
		table.appendChild(row);
	}
}

function updateMap(staticMap, unitsMap, playerMap, rowCnt, colCnt) {
	for (let i = 0; i < rowCnt; i++)
		for (let j = 0; j < colCnt; j++){
			document.getElementById(`img-${i},${j}`).src = MapValueEnum_to_image[staticMap[i][j]];
			document.getElementById(`span-${i},${j}`).textContent = unitsMap[i][j];
			document.getElementById(`span-${i},${j}`).style.visibility = unitsMap[i][j] > 0 ? 'visible' : 'hidden';
			document.getElementById(`cell-${i},${j}`).style.backgroundColor = PlayerID_to_Color[playerMap[i][j]];
		}
}

function start(){
	const socket = io();
	let rowCnt, colCnt;
	let staticMap, unitsMap, playerMap, gameTick;

	socket.on("connect", () => {
		console.log("websocket connected");
		socket.emit("start game");
	});

	socket.on("init map", gameMapPayload => {
		({staticMap, unitsMap, playerMap, gameTick} = JSON.parse(gameMapPayload));
		
		const toStr = mat => mat.map(x => x.join("")).join("\n");
		console.log("recieved init gameMap, gameTick = " + gameTick);
		console.log(toStr(staticMap));
		console.log(toStr(unitsMap));
		console.log(toStr(playerMap));

		
		rowCnt = staticMap.length;
		colCnt = staticMap[0].length;

		initMap(staticMap, unitsMap, playerMap, rowCnt, colCnt, document.getElementById("gameMap"));
    });

	socket.on("update map", (gameMapPayload) => {
		({staticMap, unitsMap, playerMap, gameTick} = JSON.parse(gameMapPayload));

		// const toStr = mat => mat.map(x => x.join("")).join("\n");
		// console.log("recieved updated gameMap at " + gameTick);
		// console.log(toStr(staticMap));
		// console.log(toStr(unitsMap));
		// console.log(toStr(playerMap));

		updateMap(staticMap, unitsMap, playerMap, rowCnt, colCnt);
	})

	socket.on("player killed", payload => {
		killedID = parseInt(payload);
		console.log(killedID + "get killed");
	})

	document.addEventListener("keydown", event => {
		console.log("key pressed");
		if(!selectedCell)
			return ;
		let {r, c, rate} = selectedCell;
		let dir;
		switch(event.key){
			case 'w': //"w"
				dir = 0; r -= 1; break;
			case 'a': //"a"
				dir = 1; c -= 1; break;
			case 's': //"s"
				dir = 2; r += 1; break;
			case 'd': //"d"
				dir = 3; c += 1; break;
			default:
				return ;
		};
		if(!(r >= 0 && r < rowCnt && c >= 0 && c < colCnt && staticMap[r][c] != '*')){
			return ;
		};
		
		console.log("selected cell: " + selectedCell);
		const payload = {r1: selectedCell.r, c1: selectedCell.c, dir, rate};
		selectedCell = {r, c, rate:1};
		console.log(payload);
		socket.emit("add operation", JSON.stringify(payload));
	})
}
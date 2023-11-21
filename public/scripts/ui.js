function start(){
	const socket = io();
	var rowCnt, colCnt;

	socket.on("connect", () => {
		console.log("websocket connected");
	});

	socket.on("init map", gameMapPayload => {
		const {staticMap, unitsMap, playerMap} = JSON.parse(gameMapPayload);
		
		const toStr = mat => mat.map(x => x.join("")).join("\n");
		console.log("recieved gameMap");
		console.log(toStr(staticMap));
		console.log(toStr(unitsMap));
		console.log(toStr(playerMap));

		rowCnt = staticMap.length;
		colCnt = staticMap[0].length;

		var table = document.getElementById("grid");
		while (table.firstChild) {
			table.removeChild(table.firstChild);
		}

        for (var i = 0; i < rowCnt; i++) {
            var row = document.createElement("tr");
            for (var j = 0; j < colCnt; j++) {
				var cell = document.createElement("td");

				var img = document.createElement("img");
				switch(staticMap[i][j]){
					case '*': //mountains
						img.src = "imgs/mountain.svg";
						break;
					case '$': //generals
						img.src = "imgs/general.svg";
						break;
					case '#': //cities
						img.src = "imgs/city.svg";
						break;
					default:
						img.src = "imgs/empty.svg";
				}
				img.height = 78;
				img.width = 78;
				cell.appendChild(img);

				var indexSpan = document.createElement("span");
				indexSpan.textContent = unitsMap[i][j];
				indexSpan.classList.add("grid-number");
				if(unitsMap[i][j] > 0) 
					indexSpan.style.visibility = 'visible';
				cell.appendChild(indexSpan);

				cell.style.backgroundColor = 
					playerMap[i][j] == 1 ? 'red' : 
					playerMap[i][j] == 2 ? 'blue' :
					playerMap[i][j] == 3 ? 'green' : null;

				cell.id = `cell-${i},${j}`;
				row.appendChild(cell);
            }
            table.appendChild(row);
        }
    });

	socket.on("update map", (gameMapPayload) => {
		
		const gameMap = JSON.parse(gameMapPayload);
	})
}
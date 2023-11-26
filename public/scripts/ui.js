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

		initMap(staticMap, unitsMap, playerMap, rowCnt, colCnt, document.getElementById("gameMap")); // Draw Map on front end
    });


	socket.on("update map", (gameMapPayload) => {
		({staticMap, unitsMap, playerMap, gameTick} = JSON.parse(gameMapPayload));

		const toStr = mat => mat.map(x => x.join("")).join("\n");
		// console.log("recieved updated gameMap at " + gameTick);
		// console.log(toStr(staticMap));
		// console.log(toStr(unitsMap));
		// console.log(toStr(playerMap));

		updateMap(staticMap, unitsMap, playerMap, rowCnt, colCnt);
	})

	socket.on("init score",playerList => {
		nameList = playerList;
		initScoreBoard(document.getElementById("scoreBoard"),playerList)
		
	})

	socket.on("update score",(playerScores) =>{

		const scores = JSON.parse(playerScores);
		updateScoreBoard(scores);
	})

	socket.on("player killed", result => {
		var {killedID,killerID} = JSON.parse(result);
		killedID = parseInt(killedID);
		killerID = parseInt(killerID);
		console.log("player "+killedID + " get killed by player " + killerID);
	})

	socket.on("end game", players=>{

		let finalScores = {};

		players.forEach(player => {
			let armyScore = parseInt(document.getElementById(`${player}Army`).innerText);
			let landScore = parseInt(document.getElementById(`${player}Land`).innerText);
			let killScore = parseInt(document.getElementById(`${player}Kill`).innerText);
	
			finalScores[player] = {
				army: armyScore,
				land: landScore,
				kill: killScore
			};
		});

		// Sort players by kills, then by land
		let sortedPlayers = Object.keys(finalScores).sort((a, b) => {
			if (finalScores[b].kill === finalScores[a].kill) {
				return finalScores[b].land - finalScores[a].land;
			}
			return finalScores[b].kill - finalScores[a].kill;
		});

		document.getElementById('scoreBoard').style.display= "none";

		initFinalScoreBoard(document.getElementById('final-ranking'), sortedPlayers, finalScores);
		document.getElementById('Gameover-overlay').style.display= "block";
		console.log(finalScores);


		document.getElementById('replay-button').addEventListener('click', function() {
			// Hide the game over overlay
			document.getElementById('Gameover-overlay').style.display = 'none';
		
			// Restart the game
			// TODO: Bring back to waiting room
			start();
		});

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
				//selectedCell = {r: i, c: j, rate: 0.5};
				selectedCell = {r: i, c: j, rate: 1};
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

function initScoreBoard(table,players){

	// Create header
	var headers = ["Player", "Army", "Land", "Kill"];
	var tr = document.createElement("tr");

	headers.forEach(function(header) {
		var th = document.createElement("th");
		th.textContent = header;
		th.style.color = "white"
		th.style.backgroundColor = "black";
		th.style.padding = "10px";
		tr.appendChild(th);
	});

	table.appendChild(tr);

	let count = 1;
	players.forEach(function(player) {
		var tr = document.createElement("tr");
	  
		headers.forEach(function(header) {
			var td = document.createElement("td");
			td.id = player + header; // "example: tonyArmy, stevenLand"

			if (header === "Player") {
				td.style.backgroundColor = PlayerID_to_Color[count++]; 
				td.textContent = player;

			} else {
				td.textContent = "0";
			}
			td.style.border = "1px solid black";
			td.style.textAlign = "center";
			td.style.fontWeight = "bold"; // Makes the text bold
			td.style.fontStyle = "italic"; // Makes the text italic
			td.style.padding = "10px"; // Add padding to all sides
			tr.appendChild(td);
		});
	  
		table.appendChild(tr);
	});

	table.style.borderCollapse = 'collapse';

  
}

function updateScoreBoard(scores){

    // Iterate over the players in the scores dictionary
    for(let player in scores) {
        // Update their score in the table
        document.getElementById(`${nameList[player - 1]}Army`).innerText = scores[player].army;
        document.getElementById(`${nameList[player - 1]}Land`).innerText = scores[player].land;
		let kills = parseInt(document.getElementById(`${nameList[player - 1]}Kill`).innerText);
		document.getElementById(`${nameList[player - 1]}Kill`).innerText = scores[player].kill+kills;
    }    
}

function initFinalScoreBoard(table, players, scores){
    // Create header
    var headers = ["Rank", "Player", "Army", "Land", "Kill"];
    var tr = document.createElement("tr");

    headers.forEach(function(header) {
        var th = document.createElement("th");
        th.textContent = header;
        th.style.color = "white"
        th.style.backgroundColor = "black";
        th.style.padding = "10px";
        tr.appendChild(th);
    });

    table.appendChild(tr);

    players.forEach(function(player, index) {
        var tr = document.createElement("tr");

        headers.forEach(function(header) {
            var td = document.createElement("td");
            td.id = player + header; // "example: tonyArmy, stevenLand"

            if (header === "Rank") {
                td.textContent = index + 1; // index starts at 0, so add 1 for rank
				td.style.background = 'white';

            } else if (header === "Player") {
                td.textContent = player;
				// Calculate lightness based on rank (index)
				// Assume maximum lightness is 70 and minimum is 30
				// lightness decreases as rank increases
				let maxLightness = 70;
				let minLightness = 30;
				let lightness = maxLightness - (index * ((maxLightness - minLightness) / (players.length - 1)));
				
				// Set background color using HSL
				// Hue is set to 50 for golden color, Saturation is 100%
				td.style.backgroundColor = `hsl(50, 100%, ${lightness}%)`;
            } else {
                td.textContent = scores[player][header.toLowerCase()];
				td.style.background = 'white';
            }

            td.style.border = "1px solid black";
            td.style.textAlign = "center";
            td.style.fontWeight = "bold";
            td.style.fontStyle = "italic"; 
            td.style.padding = "10px"; 
            tr.appendChild(td);
        });

        table.appendChild(tr);
    });

    table.style.borderCollapse = 'collapse';
}


const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Populate the avatar selection
        Avatar.populate($("#register-avatar"));

        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    //UserPanel.update(Authentication.getUser());
                    //UserPanel.show();
					
                    //Socket.connect();

					start();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const avatar   = $("#register-avatar").val();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, avatar, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    // This function shows the form
    const show = function() {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();


const GameOver = (function(){

	const displayFinalStatistics = function(){


			
	};
	
	return {displayFinalStatistics};
})();








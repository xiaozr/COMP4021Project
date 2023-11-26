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

const Socket = require("./socket")

function start(){
	let rowCnt, colCnt;
	let staticMap, unitsMap, playerMap, gameTick;
	
	console.log("connecting");
	Socket.connect();
	console.log("success connect");

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
		Socket.addOperation(JSON.stringify(payload));
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

	// Create headers
	var headers = ["Player", "Army", "Land"];
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

	// Create data rows
	//TODO:var players = playerList
	//var players = ["p1","p2","p3"]
	//console.log(players);

	let count = 1;

	players.forEach(function(player) {
		var tr = document.createElement("tr");
	  
		headers.forEach(function(header) {
			var td = document.createElement("td");
			td.id = player + header.charAt(0).toUpperCase() + header.slice(1); // "example: tonyArmy, stevenLand"

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

function updateScoreBoard(table,unitsMap,playerMap,rowCnt,colCnt){
    // Initialize a dictionary to hold the scores
    let scores = {};

    // Iterate over the maps
    for(let i = 0; i < rowCnt; i++) {
        for(let j = 0; j < colCnt; j++) {
            // If a player is present at this cell
            if(playerMap[i][j] !== 0) {
                // If this player is not already in the scores dictionary, add them
                if(!(playerMap[i][j] in scores)) {
                    scores[playerMap[i][j]] = {army: 0, land: 0};
                }

                // Add the land score
                scores[playerMap[i][j]].land += 1;
                
                // Add the army score
                scores[playerMap[i][j]].army += unitsMap[i][j];
            }
        }
    }

    // Iterate over the players in the scores dictionary
    for(let player in scores) {
        // Update their score in the table
        document.getElementById(`${nameList[player - 1]}Army`).innerText = scores[player].army;
        document.getElementById(`${nameList[player - 1]}Land`).innerText = scores[player].land;
    }    
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
					
					WaitingRoom.show();

					start();
					console.log("goood");
					//socket.emit("add player", username);
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

const WaitingRoom = (function() {
	var username;
    // This function initializes the UI
    const initialize = function() {
		$("#waiting-room").hide();

		$("#get-ready").click(function(){
			console.log("ready clicked");
			Socket.addReadyUser(username);
		});
	};

	// This function shows the form
	const show = function(_username) {
		console.log("show");
		username = _username;
		$("#waiting-room").fadeIn(500);
	};
	// socket.emit("add player");
    // This function updates the online users panel
    const update = function(onlineUsers) {
        const onlineUsersArea = $("#online-users-area");

        // Clear the online users area
        onlineUsersArea.empty();

		// Get the current user
        const currentUser = Authentication.getUser();

        // Add the user one-by-one
        for (const username in onlineUsers) {
            if (username != currentUser.username) {
                onlineUsersArea.append(
                    $("<div id='username-" + username + "'></div>")
                        .append(UI.getUserDisplay(onlineUsers[username]))
                );
            }
        }
    };

    // This function adds a user in the panel
	const addUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		console.log("adding user to ready user");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Add the user
		if (userDiv.length == 0) {
			onlineUsersArea.append(
				$("<div id='username-" + user.username + "'></div>")
					.append(UI.getUserDisplay(user))
			);
		}
	};

    // This function removes a user from the panel
	const removeUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
	};

    return { show, initialize, update, addUser, removeUser };
})();




const PlayerID_to_Color2 = {
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

function startConnection(){
	console.log("connecting");
	Socket.connect(username);
	console.log("success connect");

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

		nameList[player] = count;

		var tr = document.createElement("tr");
	  
		headers.forEach(function(header) {
			var td = document.createElement("td");
			td.id = player + header; // "example: tonyArmy, stevenLand"

			if (header === "Player") {
				td.style.backgroundColor = PlayerID_to_Color2[count++]; 
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

	if(nameList){
		// Iterate over the players in the scores dictionary
		for(let player in scores) {
			// Update their score in the table
			document.getElementById(`${nameList[player - 1]}Army`).innerText = scores[player].army;
			document.getElementById(`${nameList[player - 1]}Land`).innerText = scores[player].land;
		let kills = parseInt(document.getElementById(`${nameList[player - 1]}Kill`).innerText);
			document.getElementById(`${nameList[player - 1]}Kill`).innerText = scores[player].kill+kills;
		}    
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

function playMoveSound(){
    console.log("play move sound!");
    var move = new Audio('../audios/move.wav');
    move.play();
}

function playGameoverSound(_win) {
    var win = new Audio('../audios/win.wav');
    var lose = new Audio('../audios/lose.wav');
    if(_win) win.play();
    else lose.play();
}

function playNewUserReadySound() {
    var ready = new Audio('../audios/ready.wav');
    ready.play();
}

function playItemSound(result) {
    if(result.GENERAL)
        (new Audio('../audios/general.wav')).play();
    else if(result.CITY)
        (new Audio('../audios/city.wav')).play();
    else if(result.HOLE)
        (new Audio('../audios/hole.wav')).play();
    else if(result.TRAP)
        (new Audio('../audios/trap.wav')).play();
    else if(result.BONUS)
        (new Audio('../audios/bonus.wav')).play();
}


function showToast(message) {
    var toast = document.getElementById("toast");
    toast.className = "show";
    toast.innerText = message;
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
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
                    Socket.connect(username);;
					WaitingRoom.show();
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
	// TODO: replace with global variable
	var seconds = 3; // Initial countdown value
	const MAX_USER = 8;
    var ifshow = false;

    // This function initializes the UI
    const initialize = function() {
		$("#waiting-room").hide();

        // Clear the online users area
        const readyUsersArea = $("#ready-users-area");
        readyUsersArea.empty();
		readyUsersArea.append($("<div class='caption'>Ready Users</div>"));

		$("#get-ready").click(function(){
			console.log("ready clicked");
			Socket.addReadyUser();
		});

        $("#get-ready").click(function(){
			console.log("ready clicked");
			Socket.addReadyUser();
		});

		$("#waiting-sign-out").click(function(){
			console.log("signout clicked");
			//TODO: sign out
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                    //SignInForm.show();
                }
            );
		});
	};

	// Function to update the countdown display
	function updateReadyUserCountDisplay(number) {
		var countdownElement = document.getElementById("readyusercount");
		countdownElement.textContent = number;
	}
		
	// Function to update the countdown display
	function updateCountdownDisplay(seconds) {
	var countdownElement = document.getElementById("timeleft");
	countdownElement.textContent = seconds + "s";
	}

	// This function shows the form
	const show = function(_username) {
		console.log("show");
		username = _username;
		$("#waiting-room").fadeIn(500);
        ifshow = true;
	};

	const hide = function() {
		$("#waiting-room").fadeOut(500);
        ifshow = false;
	}

    // This function updates the ready users panel
    const update = function(readyUserPayload) {
		const {readyUsers, readyUsersCount} = readyUserPayload;
        const readyUsersArea = $("#ready-users-area");
		console.log(readyUsers, readyUsersCount);

        // Clear the online users area
        readyUsersArea.empty();
		readyUsersArea.append($("<div class='caption'>Ready Users</div>"));

        // Add the user one-by-one
        for (const username in readyUsers) {
			readyUsersArea.append(
				$("<div id='username-" + username + "'></div>")
					.append(UI.getUserDisplay(readyUsers[username]))
			);
        }
		updateReadyUserCountDisplay(readyUsersCount);
    };

    // This function adds a user in the panel
	const addUser = function(user, readyUserSize) {
        const onlineUsersArea = $("#ready-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Add the user
		if (userDiv.length == 0) {
			onlineUsersArea.append(
				$("<div id='username-" + user.username + "'></div>")
					.append(UI.getUserDisplay(user))
			);
		}
		updateReadyUserCountDisplay(readyUserSize);
	};

    // This function removes a user from the panel
	const removeUser = function(user, readyUserSize) {
        console.log("remove user here!", user.username, readyUserSize);
        const onlineUsersArea = $("#ready-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
        console.log(userDiv);
		
		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
        updateReadyUserCountDisplay(readyUserSize);
	};

    function isGameStarted(){
		Socket.ifGameStart();
	}

    function getIfShow(){return ifshow;}

    return { show, hide, initialize, update, addUser, removeUser, updateCountdownDisplay, isGameStarted, getIfShow};
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
		//const {username, avatar, name} = JSON.parse(user);
		//console.log(username, avatar, name);
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-avatar'>" +
			        Avatar.getCode(user.avatar) + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    return { getUserDisplay };
})();



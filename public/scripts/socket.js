const Socket = (function() {
    
    let rowCnt, colCnt;
	let staticMap, unitsMap, playerMap, gameTick;

    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };
	const connect = function() {
        console.log("in connect!");
        socket = io();

        socket.on("connect", () => {
            console.log("websocket connected");
            socket.emit("get player ready");
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

        socket.on("add player ready", (_user, _readyUsersCount) => {
            const {user, readyUsersCount} = JSON.parse(_user, _readyUsersCount);
            console.log("adding ready player", user, readyUsersCount);
            WaitingRoom.addUser(user, readyUsersCount);
        });

        socket.on("update map", (gameMapPayload) => {
            ({staticMap, unitsMap, playerMap, gameTick} = JSON.parse(gameMapPayload));

            // const toStr = mat => mat.map(x => x.join("")).join("\n");
            // console.log("recieved updated gameMap at " + gameTick);
            // console.log(toStr(staticMap));
            // console.log(toStr(unitsMap));
            // console.log(toStr(playerMap));

            updateMap(staticMap, unitsMap, playerMap, rowCnt, colCnt);
        });

        socket.on("init score",playerList => {
            nameList = playerList;
            initScoreBoard(document.getElementById("scoreBoard"),nameList)
            
        });

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
                WaitingRoom.initialize();
            });
    
        })

        socket.on("update player ready", (payload) => {
            payload = JSON.parse(payload);
            console.log("updateplayerready", payload);
            WaitingRoom.update(payload);
        });

        socket.on("start count down", () => {
            console.log("start count down!!!!!");
            socket.emit("trigger count down");
        });

        socket.on("update count down", (seconds) => {
            console.log("update count down!!!!!");
            WaitingRoom.updateCountdownDisplay(seconds);
        });

        socket.on("prepare start game", () => {
            console.log("prepared start game");
            socket.emit("start game");
        });

        socket.on("hide waiting room", () => {
            WaitingRoom.hide();
        });

        document.addEventListener("keydown", event => {

            console.log("key pressed");
            if(!selectedCell)
                return ;

            let {r, c, rate} = selectedCell;
            let dir;
            let cheat;
            
            switch(event.key){
                case 'w': //"w"
                    dir = 0; r -= 1; break;
                case 'a': //"a"
                    dir = 1; c -= 1; break;
                case 's': //"s"
                    dir = 2; r += 1; break;
                case 'd': //"d"
                    dir = 3; c += 1; break;
                case 'c':
                    cheat = true; break;
                default:
                    return ;
            };
    
            
            if(!(r >= 0 && r < rowCnt && c >= 0 && c < colCnt && staticMap[r][c] != '*')){
                return ;
            };

            if(cheat==true){
                let cellToChange = {r1: selectedCell.r, c1: selectedCell.c};
                console.log("Player cheat!")
                Socket.cheat(cellToChange);
                
                const toStr = mat => mat.map(x => x.join("")).join("\n");
                console.log(toStr(playerMap));
                cheat = false;
                return;
            }
    
            console.log("pass");
    
            console.log("selected cell: " + selectedCell);
            const payload = {r1: selectedCell.r, c1: selectedCell.c, dir, rate};
            selectedCell = {r, c, rate:1};
            console.log(payload);
            Socket.addOperation(JSON.stringify(payload));
        })

    };

    const addOperation = function(payload) {
        socket.emit("add operation", payload);
    };

    const addReadyUser = function() {
        if (socket && socket.connected) {
            socket.emit("broadcast add player ready");
        }
    };

    const cheat = function(cellToChange){
        socket.emit("cheat",cellToChange);
    };

    /*const updateReadyUser = function() {
        console.log("updateReadyUser");
        if (socket && socket.connected) {
            console.log("updateReadyUser");
            socket.emit("get player ready");
        }
    };*/

    return { getSocket, connect, addReadyUser, addOperation, cheat};
})();

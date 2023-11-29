
const Socket = (function() {

    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

	const connect = function(_username) {
        console.log("in connect!");
        socket = io();
        let username = _username;

        function getBackWaitingRoom() {
            // Hide the game over overlay
            document.getElementById('Gameover-overlay').style.display = 'none';

            // Restart the game
            // TODO: Bring back to waiting room
            WaitingRoom.initialize();
            WaitingRoom.show();
            socket.emit("get player ready");
        }

        socket.on("connect", () => {
            console.log("websocket connected");
            socket.emit("get player ready");
        
            ifGameStart(); // For come back situation
            //startGame();
        });

        socket.on("init map", gameMapPayload => {
            const {map, players} = JSON.parse(gameMapPayload);
            ({staticMap, unitsMap, playerMap, gameTick} = map);

            
            const toStr = mat => mat.map(x => x.join("")).join("\n");
            console.log("recieved init gameMap, gameTick = " + gameTick);
            console.log(toStr(staticMap));
            console.log(toStr(unitsMap));
            console.log(toStr(playerMap));

            gameMap.initMap(staticMap, players); // Draw Map on front end
            gameMap.renderMap(staticMap, unitsMap, playerMap);
        });

        socket.on("add player ready", (_user, _readyUsersCount) => {
            const {user, readyUsersCount} = JSON.parse(_user, _readyUsersCount);
            console.log("adding ready player", user, readyUsersCount);
            if(user.username!=username) playNewUserReadySound();
            if(!WaitingRoom.getIfShow()) getBackWaitingRoom();
            WaitingRoom.addUser(user, readyUsersCount);
        });

        socket.on("update map", (gameMapPayload) => {
            ({staticMap, unitsMap, playerMap, gameTick} = JSON.parse(gameMapPayload));

            // const toStr = mat => mat.map(x => x.join("")).join("\n");
            // console.log("recieved updated gameMap at " + gameTick);
            // console.log(toStr(staticMap));
            // console.log(toStr(unitsMap));
            // console.log(toStr(playerMap));
            const difference = gameMap.compareMap(staticMap, unitsMap, playerMap);
            gameMap.renderMap(staticMap, unitsMap, playerMap);
            console.log(JSON.stringify(difference));
            playItemSound(difference);
        });

        socket.on("init score",playerList => {
            nameList = playerList;
            initScoreBoard(document.getElementById("scoreBoard"),nameList)
            
        });

        socket.on("update score",(playerScores) =>{

            const scores = JSON.parse(playerScores);
            updateScoreBoard(scores);
        });

        socket.on("player move", (_username) =>{
            console.log("play emit received");
            if(username == _username)
                console.log("to play sound", username);
                playMoveSound();
        });
    
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
            var winner_key = Object.keys(sortedPlayers)[0];
            var winner_username = sortedPlayers[winner_key];
            if(winner_username==username) playGameoverSound(true);
            else playGameoverSound(false);
    
            document.getElementById('replay-button').addEventListener('click', function() {
                getBackWaitingRoom();
            });
    
        })

        socket.on("update player ready", (payload) => {
            payload = JSON.parse(payload);
            console.log("updateplayerready", payload);
            WaitingRoom.update(payload);
        });

        socket.on("remove player ready", (_user, _readyUsersCount) => {
            const {user, readyUsersCount} = JSON.parse(_user, _readyUsersCount);
            console.log("removing player", user, readyUsersCount);
            WaitingRoom.removeUser(user, readyUsersCount);        
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

        socket.on("game started", result =>{
            if(JSON.parse(result))
                socket.emit("start game");
        })

        socket.on("show spectator mode reminder", ()=>{
            document.getElementById('spectator-mode').style.display = "block";
        })

        socket.on("hide spectator mode reminder,", ()=>{
            document.getElementById('spectator-mode').style.display = "none";
        })

        socket.on("illegal operation",()=>{
            showToast("Operation not allowed in spectator mode!")
        })

        socket.on("increase kill",(username)=>{
            //const {username} = socket.request.session.user;
            document.getElementById(`${username}Kill`).innerText = parseInt(document.getElementById(`${username}Kill`).innerText)+1;
        })

        document.addEventListener("keydown", event => {
            console.log("key pressed");
            switch(event.key){
                case 'w': //"w"
                case 'a': //"a"
                case 's': //"s"
                case 'd': //"d"
                    gameMap.move(Key_to_Dir[event.key]); 
                    break;
                case 'c':
                    gameMap.cheat();
                default:
                    return ;
            };
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

    const disconnect = function(){
        socket.emit("disconnect");
    }

    const startGame = function(){
        socket.emit("start game");
    };

    const ifGameStart = function(){
        socket.emit("is game started");
    }
    
    return { getSocket, connect, addReadyUser, addOperation, cheat, startGame, disconnect};
})();

const Socket = (function() {
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

            const toStr = mat => mat.map(x => x.join("")).join("\n");
            console.log("recieved updated gameMap at " + gameTick);
            console.log(toStr(staticMap));
            console.log(toStr(unitsMap));
            console.log(toStr(playerMap));

            updateMap(staticMap, unitsMap, playerMap, rowCnt, colCnt);
        });

        socket.on("init score",playerList => {
            nameList = playerList;
            initScoreBoard(document.getElementById("scoreBoard"),nameList)
            
        });

        socket.on("update score",(gameMapPayload) =>{

            const {unitsMap, playerMap} = JSON.parse(gameMapPayload);
            updateScoreBoard(document.getElementById("scoreBoard"),unitsMap,playerMap,rowCnt,colCnt);
        });

        socket.on("player killed", payload => {
            killedID = parseInt(payload);
            console.log(killedID + "get killed");
        });

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
    };

    const addOperation = function(payload) {
        socket.emit("add operation", payload);
    };

    const addReadyUser = function() {
        if (socket && socket.connected) {
            socket.emit("broadcast add player ready");
        }
    };

    /*const updateReadyUser = function() {
        console.log("updateReadyUser");
        if (socket && socket.connected) {
            console.log("updateReadyUser");
            socket.emit("get player ready");
        }
    };*/

    return { getSocket, connect, addReadyUser, addOperation};
})();

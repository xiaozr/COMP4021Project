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
            //socket.emit("start game");
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

        socket.on("add player ready", (user) => {
            console.log("adding ready player");
            WaitingRoom.addUser(user);
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
    };

    const addOperation = function(payload) {
        socket.emit("add operation", payload);
    };

    // This function disconnects the socket from the server
    const addReadyUser = function(username) {
        console.log("adding player");
        io.emit("add player ready",JSON.stringify(username));
    };

    return { getSocket, connect, addReadyUser, addOperation};
})();

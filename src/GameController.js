const gameMapConstructor = require('./GameMap');

function makeLoop(period, body){
	let timer;
	function f() {
		body();
		timer = setTimeout(f, period);
	}
	return {
		start: () => { timer = setTimeout(f, period); },
		stop: () => { clearTimeout(timer); }
	};
}

function GameController(io){
	let gameMap;
	let playerList = new Map();
	let playerOperationBuffer = new Map();
	let playerIDPool = [1,2,3,4,5,6,7,8];
	let rowCnt = 5, colCnt = 5;
	let mainTimer, gameEndTimeout;

	function gameIteration(){
		//increase units on map
		gameMap.growUnits();

		//execute one operation for each user
		for(const [playerID, operationList] of playerOperationBuffer){
			if(operationList.length > 0){
				const {r1, c1, dir, rate} = operationList.shift();
				if(!gameMap.checkCell(playerID, r1, c1)){
					operationList.length = 0;
					continue;
				}
				console.log("player " + playerID + " moving (" + r1 + ", " + c1 + ")");
				let result = gameMap.moveUnits(r1, c1, dir, rate);
				if(result != 0)
					io.emit("player killed", result);
			}
		}

		io.emit("update map", gameMap.toPayload());
		io.emit("update score", gameMap.toPayload());
	}

	function isStarted(){
		return mainTimer != null;
	}

	function addUser(username, socket){
		if(playerIDPool.length <= 0){
			return false;
		}
		const userPlayerID = playerIDPool.shift();
		playerList.set(username, userPlayerID);
		playerOperationBuffer.set(userPlayerID, []);
		console.log("add " + username + " as player " + userPlayerID);
		console.log("Joined Game users: ["+ [...playerList.keys()] +"]");

		if(isStarted()){
			socket.emit("init map", gameMap.toPayload());
			socket.emit("init score",Array.from(playerList.keys()));
		}
		return true;
	}

	function removeUser(username){
		const userPlayerID = playerList.get(username);
		playerIDPool.push(userPlayerID);
		playerOperationBuffer.delete(userPlayerID);
		playerList.delete(username);
		console.log("remove " + username + " as player " + userPlayerID);
	}

	function startGame(){
		// if(playerList.size <= 1)
		// 	return false;

		console.log("map initialized at " + new Date().toLocaleString());

		gameMap = gameMapConstructor.GameMap(Array.from(playerList.values()));
		//gameMap = gameMapConstructor.GameMap(rowCnt, colCnt, [1,2,3]);
		//gameMap = gameMapConstructor.GameMap([1,2,3,4,5,6,7,8]);

		io.emit("init map", gameMap.toPayload());
		io.emit("init score",Array.from(playerList.keys()));

		const updatePeriod = 500; 
		mainTimer = makeLoop(updatePeriod, gameIteration); // Update game every 0.5 seconds

		mainTimer.start();
		gameEndTimeout = setTimeout(endGame, 300000); // Game Time Limit: 5 minutes
		return true;
	}

	function endGame(){
		console.log("game ended at " + new Date().toLocaleString());

		mainTimer.stop();
		clearTimeout(gameEndTimeout);
		mainTimer = null;
	}

	function addOperation(username, operation){
		console.log("user " + username + " add operation");
		playerOperationBuffer.get(playerList.get(username)).push(operation);
	}

	function clearOperationBuffer(username){
		playerOperationBuffer.get(playerList.get(username)).length = 0;
	}

	function getPlayerList(){
		return playerList;
	}

	return {isStarted, addUser, removeUser, startGame, endGame, addOperation, clearOperationBuffer,getPlayerList};
}

module.exports = {GameController};
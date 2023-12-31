const gameMapConstructor = require('./GameMap');
const updatePeriod = 500;
const sound = require('sound-play')

function makeLoop(period, body){
	let timer;
	function f() {
		body();
		if(timer)
			timer = setTimeout(f, period);
	}
	return {
		start: () => { timer = setTimeout(f, period); },
		stop: () => { clearTimeout(timer); timer = null;}
	};
}

function GameController(io){
	let gameMap;
	let playerList = new Map();
	let playerUsername = new Map();
	let playerOperationBuffer = new Map();
	let playerIDPool = [1,2,3,4,5,6,7,8];
	let mainTimer, gameEndTimeout;
	let gameTime = 210000;
	let playerKilled;
	var playingUsers = {};

	function startCountdown() {
		console.log("starting countdown");
		let seconds = 15;
	  
		// Update countdown display every second
		const countdownInterval = setInterval(function() {
		  seconds--;
		  io.emit("update count down", seconds);
	  
		  if (seconds <= 0) {
			clearInterval(countdownInterval);
			console.log("Countdown finished!");
			io.emit("prepare start game");
		  }
		}, 1000);
	  
		return countdownInterval; // Return the interval ID
	}

	function gameIteration(){
		if(mainTimer==null)
			return;
		//increase units on map
		gameMap.growUnits();

		let Scores = {};
		//execute one operation for each user
		for(const [playerID, operationList] of playerOperationBuffer){			
			if(operationList.length > 0){
				const {r1, c1, dir, rate} = operationList.shift();
				if(!gameMap.checkCell(playerID, r1, c1)){
					operationList.length = 0;
					continue;
				}
				// console.log("player " + playerID + " moving (" + r1 + ", " + c1 + ")");
				let result = gameMap.executeOperation(r1, c1, dir, rate);
				if(result==0)
					io.emit("player move", JSON.stringify(playerUsername[playerID]));
				if(result > 0){
					if(!(playerID in Scores)) {
						Scores[playerID] = {army: 0, land: 0, kill: 0};
					}
					// Update the kill score for the player
					Scores[playerID].kill += 1;
					const data = {
						killedID: result,
						killerID: playerID
					}
					io.emit("player killed", JSON.stringify(data));

				}
			}
		}

		const {staticMap,unitsMap,playerMap} = gameMap.pack();
		rowsCnt = staticMap.length;
		colsCnt = staticMap[0].length;

		//let userList = switchKeyValue(playerList); // userList: {1:Tony, 2:Tom, 3:Jacky}
		// Iterate over the maps to calculate user scores
		for(let i = 0; i < rowsCnt; i++) {
			for(let j = 0; j < colsCnt; j++) {
				// If a player is present at this cell
				if(playerMap[i][j] !== 0) {
					// If this player is not already in the scores dictionary, add them
					if(!(playerMap[i][j] in Scores)) {
						Scores[playerMap[i][j]] = {army: 0, land: 0, kill: 0};
					}
	
					// Add the land score
					Scores[playerMap[i][j]].land += 1;
					
					// Add the army score
					Scores[playerMap[i][j]].army += unitsMap[i][j];
	
				}
			}
		}

		let remainUsers = new Set();
		for(let i = 0; i < rowsCnt; i++) {
		  for(let j = 0; j < colsCnt; j++) {
			if (!remainUsers.has(playerMap[i][j])){
			  remainUsers.add(playerMap[i][j]);
			}
		  }
		}

		io.emit("update map", JSON.stringify(gameMap.pack()));
		io.emit("update score", JSON.stringify(Scores));
		
		if(remainUsers.size==2&&mainTimer)
			endGame();

		//console.log("remain players: "+remainUsers.size);

		return Scores;
	}

	// Helper function: switch key and value
	function switchKeyValue(map) {
		let switchedMap = new Map();
		for (let [key, value] of map.entries()) {
			switchedMap.set(value, key);
		}
		return switchedMap;
	}


	function isStarted(){
		return mainTimer != null;
	}

	function addUser(username, socket){
		if(playerIDPool.length <= 0){
			return false;
		}
		if(!(playerList.has(username))){
			const userPlayerID = playerIDPool.shift();
			playerList.set(username, userPlayerID);
			playerOperationBuffer.set(userPlayerID, []);
			console.log("add " + username + " as player " + userPlayerID);
			console.log("Joined Game users: ["+ [...playerList.keys()] +"]");
		}

		if(isStarted() && !(playerList.has(username))){
			console.log(username + " Come back init");
			socket.emit("init map", JSON.stringify(gameMap.pack()));
			// socket.emit("init score",Array.from(playerList.keys()));
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

		io.emit("init map", JSON.stringify({map: gameMap.pack(), players: Object.fromEntries(playerList)}));
		// io.emit("init score",Array.from(playerList.keys()));

		mainTimer = makeLoop(updatePeriod, gameIteration); // Update game every 0.5 seconds

		mainTimer.start();
		gameEndTimeout = setTimeout(endGame, gameTime); // Game Time Limit: 5 minutes
		return true;
	}

	function endGame(){
		console.log("game ended at " + new Date().toLocaleString());

		mainTimer.stop();
		clearTimeout(gameEndTimeout);
		mainTimer = null;
		for(username in playerList) {
			myMap.forEach((username, _) => {
				removeUser(username);
			  });
		}
		io.emit("end game", Array.from(playerList.keys()));
	}

	function addOperation(username, operation){
		// console.log("user " + username + " add operation");
		// console.log(playerList);
		if(playerList.has(username)){
			playerOperationBuffer.get(playerList.get(username)).push(operation);
			return true;
		}else{
			console.log(username+":Operation not allowed!");
			return false;
		}
			
	}

	function cheatOnCell(username, cellToChange){
		
		const playerID = playerList.get(username);
		gameMap.setPlayerAtCell(playerID, cellToChange);
	}

	function clearOperationBuffer(username){
		playerOperationBuffer.get(playerList.get(username)).length = 0;
	}

	function getPlayerList(){
		return playerList;
	}

	function getGameMapPayLoad(){
		return gameMap.pack();
	}

	function clearHoleIn(payload){
		let loc = JSON.parse(payload);
		let i = Math.floor(loc / 100);
		let j = loc % 100;
		console.log(loc, i, j);
		return gameMap.clearHoleIn(i, j);
	}

	return {isStarted, addUser, removeUser, startGame, endGame, addOperation, clearOperationBuffer,getPlayerList, startCountdown, cheatOnCell,getGameMapPayLoad, clearHoleIn};
}

module.exports = {GameController};
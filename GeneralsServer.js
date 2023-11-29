const con = require('./src/websocketSetup').createWebSocketConnection();

const gameController = require('./src/GameController').GameController(con.io);
let connectionCnt = 0;

const userManger = require('./src/UserManager');
const { createWebSocketConnection } = require('./src/websocketSetup');
const waitingRoom = require('./public/scripts/ui').WaitingRoom;

var onlineUsers = {}
var readyUsers = {}
var playingUsers = new Set();
var readyUsersCount = 0
var countdownInterval = null

con.io.on("connection", socket => {
	
	// const username = "user" + (++connectionCnt);
	// gameController.addUser(username, socket);

	if(socket.request.session && socket.request.session.user){

		const {username,avatar,name} = socket.request.session.user;
		
		onlineUsers[username] = {avatar,name};
		console.log("Online users: [" + Object.keys(onlineUsers) + "]");
		
		//gameController.addUser(username, socket);

	}


	function startGame() {
		// 1. game started and user is playing
		const {username, avatar, name} = socket.request.session.user;
		//console.log(gameController.getPlayerList());

		if(gameController.isStarted()&&(gameController.getPlayerList().has(username))&&(!playingUsers.has(username))){

			//console.log("pass....");
			//console.log("Player " + username + " joined");
			//gameController.resumeGame();
			socket.emit("hide waiting room");
			//gameController.addUser(username,socket);
			socket.emit("init map", JSON.stringify({map: gameController.getGameMapPayLoad(), players: Object.fromEntries(gameController.getPlayerList())}));
			socket.emit("init score",Array.from(gameController.getPlayerList().keys()));

		} 
		else if(gameController.isStarted()&&(!gameController.getPlayerList().has(username))) { // 2. game started and user is not playing
			//TODO: Watching mode
			//con.io.emit("hide waiting room");
			//gameController.startGame();
			//gameController.addUser(username, socket);
			console.log(username+":Enter spectator mode");
			socket.emit("show spectator mode reminder");
		}
		// 3. game is not started 
		else if (readyUsersCount>=2 && !gameController.isStarted()) {
			for (user in readyUsers) {
				gameController.addUser(user,socket);
				playingUsers.add(user);
			}
			con.io.emit("update count down", JSON.stringify(15));
			con.io.emit("hide waiting room");
			gameController.startGame();
		} else {
			console.log(username+":FAIL TO START GAME (Game already started)");
			con.io.emit("update count down", JSON.stringify(15));
			readyUsers = {};
			readyUsersCount = 0;
			con.io.emit("update player ready", JSON.stringify({readyUsers: readyUsers,
				readyUsersCount: readyUsersCount}));
		}

	}

	socket.on("broadcast add player ready", () => {
		const {username,avatar,name} = socket.request.session.user;
		if (username in readyUsers) return;
		if(readyUsersCount==0) socket.emit("start count down");
		readyUsers[username] = {avatar, name};
		readyUsersCount++;
		if(readyUsersCount>=8) startGame();
		con.io.emit("add player ready", JSON.stringify({user: socket.request.session.user,
			readyUsersCount: readyUsersCount}));
	})

	socket.on("get player ready", () => {
		//console.log("Ready users:", readyUsers, readyUsersCount);
		socket.emit("update player ready", JSON.stringify({readyUsers: readyUsers,
			readyUsersCount: readyUsersCount}));
	})

	socket.on("disconnect", () => {
		console.log("Disconnect");
		if (socket.request.session.user){
			const {username, avatar, name} = socket.request.session.user;
			//gameController.removeUser(username);
			delete onlineUsers[username];
			playingUsers.delete(username);
			console.log(username+" disconnected with server");
			// if(username in readyUsers) {
			// 	console.log("remove player", username);
			// 	readyUsersCount--;
			// 	if(readyUsersCount==0 && countdownInterval!=null){
			// 		clearTimeout(countdownInterval);
			// 		countdownInterval=null;
			// 		con.io.emit("update count down", JSON.stringify(15));
			// 	}
			// 	con.io.emit("remove player ready", JSON.stringify({user: socket.request.session.user,
			// 		readyUsersCount: readyUsersCount}));
			// 	delete readyUsers[username];
			
		}
	})

	socket.on("start game", () => {
		startGame();
	});

	socket.on("add operation", payload => {
		const {username} = socket.request.session.user;
		if(!gameController.addOperation(username, JSON.parse(payload))){
			socket.emit("illegal operation");
		}
			
	})

	socket.on("trigger count down", () => {
		countdownInterval = gameController.startCountdown();
		console.log("User triggered countdown:", readyUsers, readyUsersCount);
	})

	socket.on("cheat", cell=>{
		const {username} = socket.request.session.user;
		gameController.cheatOnCell(username,cell);
	})

	socket.on("is game started", ()=>{
		if(gameController.isStarted())	
			socket.emit("game started", JSON.stringify(true));
		else
			socket.emit("game started", JSON.stringify(false))
	})
});

con.httpServer.listen(8000, () => {
	console.log("The game server has started...");
})

userManger.initUserManager(con.app,con.fs,con.bcrypt,onlineUsers);

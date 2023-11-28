const con = require('./src/websocketSetup').createWebSocketConnection();

const gameController = require('./src/GameController').GameController(con.io);
let connectionCnt = 0;

const userManger = require('./src/UserManager');
const { createWebSocketConnection } = require('./src/websocketSetup');
const waitingRoom = require('./public/scripts/ui').WaitingRoom;

var onlineUsers = {}
var readyUsers = {}
var readyUsersCount = 0

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
		if(gameController.isStarted()) {
			return ;
		}
		// else
		// 	gameController.startGame();
		else if (readyUsersCount>=2) {
			for (user in readyUsers) {
				gameController.addUser(user);
			}
			con.io.emit("update count down", JSON.stringify(15));
			con.io.emit("hide waiting room");
			gameController.startGame();
		} else {
			console.log("FAIL TO START GAME: LESS THAN TWO PLAYER");
			con.io.emit("update count down", JSON.stringify(15));
		}
		readyUsers = {};
		readyUsersCount = 0;
		con.io.emit("update player ready", JSON.stringify({readyUsers: readyUsers,
			readyUsersCount: readyUsersCount}));
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
		console.log("got player ready", readyUsers, readyUsersCount);
		socket.emit("update player ready", JSON.stringify({readyUsers: readyUsers,
			readyUsersCount: readyUsersCount}));
	})

	socket.on("disconnect", () => {
		console.log("Disconnect");
		if (socket.request.session.user){
			const {username, avatar, name} = socket.request.session.user;
			//gameController.removeUser(username);

			delete onlineUsers[username];
			if(username in readyUsers) {
				console.log("remove player", username);
				readyUsersCount--;
				con.io.emit("remove player ready", JSON.stringify({user: socket.request.session.user,
					readyUsersCount: readyUsersCount}));
				delete readyUsers[username];
			}
		}
	})

	socket.on("start game", () => {
		startGame();
	});

	socket.on("add operation", payload => {
		const {username} = socket.request.session.user;
		gameController.addOperation(username, JSON.parse(payload));
	})

	socket.on("trigger count down", () => {
		gameController.startCountdown();
	})

	socket.on("cheat", cell=>{
		const {username} = socket.request.session.user;
		gameController.cheatOnCell(username,cell);
	})
});

con.httpServer.listen(8000, () => {
	console.log("The game server has started...");
})

userManger.initUserManager(con.app,con.fs,con.bcrypt,onlineUsers);

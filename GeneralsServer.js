// import {GameMap} from './src/GameMap.js';
// import {createWebSocketConnection} from './src/websocketSetup.js'

const con = require('./src/websocketSetup').createWebSocketConnection();

const gameController = require('./src/GameController').GameController(con.io);
let connectionCnt = 0;

const userManger = require('./src/UserManager')

var onlineUsers = {}

con.io.on("connection", socket => {
	
	// const username = "user" + (++connectionCnt);
	// gameController.addUser(username, socket);

	if(socket.request.session && socket.request.session.user){

		const {username,avatar,name} = socket.request.session.user;
		
		onlineUsers[username] = {avatar,name};
		console.log("Online users: [" + Object.keys(onlineUsers) + "]");
		//io.emit("add user",JSON.stringify(user));
		
	gameController.addUser(username, socket);

}
	

	socket.on("disconnect", () => {
		console.log("Refresh");
		if (socket.request.session.user){
		const {username} = socket.request.session.user;
		gameController.removeUser(username);

		delete onlineUsers[username];}
	})

	socket.on("start game", () => {

		if(gameController.isStarted()) {
			return ;
		}
		// else
		// 	gameController.startGame();
		else if (gameController.getPlayerList().size>=2) {

			gameController.startGame();
		
		}
	});

	socket.on("add operation", payload => {
		const {username} = socket.request.session.user
		gameController.addOperation(username, JSON.parse(payload));
	})
});

con.httpServer.listen(8000, () => {
	console.log("The game server has started...");
})

userManger.initUserManager(con.app,con.fs,con.bcrypt,onlineUsers);

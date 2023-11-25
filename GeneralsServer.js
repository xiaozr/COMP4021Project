const con = require('./src/websocketSetup').createWebSocketConnection();

const gameController = require('./src/GameController').GameController(con.io);
let connectionCnt = 0;

con.io.on("connection", socket => {
	const username = "user" + (++connectionCnt);
	gameController.addUser(username, socket);

	socket.on("disconnect", () => {
		gameController.removeUser(username);
	})

	socket.on("start game", () => {
		if(gameController.isStarted()) {
			return ;
		}
		else
			gameController.startGame();
	});

	socket.on("add operation", payload => {
		gameController.addOperation(username, JSON.parse(payload));
	})
});

con.httpServer.listen(8000, () => {
	console.log("The game server has started...");
})
// import {GameMap} from './src/GameMap.js';
// import {createWebSocketConnection} from './src/websocketSetup.js'

const gameMap = require('./src/GameMap').GameMap(5, 5, [1,2,3]);

const con = require('./src/websocketSetup').createWebSocketConnection();

con.io.on("connection", socket => {
	con.io.emit("init map", JSON.stringify({
		staticMap: gameMap.staticMap,
		unitsMap: gameMap.unitsMap,
		playerMap: gameMap.playerMap
	}));
});

con.httpServer.listen(8000, () => {
	console.log("The game server has started...");
	console.log(require('./src/utils').charMatrix2Str(gameMap.staticMap));
})
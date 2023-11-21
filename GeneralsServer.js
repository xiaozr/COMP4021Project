// import {GameMap} from './src/GameMap.js';
// import {createWebSocketConnection} from './src/websocketSetup.js'

const gameMap = require('./src/GameMap').GameMap(10, 10, [1,2,3]);

const con = require('./src/websocketSetup').createWebSocketConnection();


con.httpServer.listen(8000, () => {
	console.log("The game server has started...");
	console.log(require('./src/utils').charMatrix2Str(gameMap.staticMap));
})
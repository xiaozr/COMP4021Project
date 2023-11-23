// import {GameMap} from './src/GameMap.js';
// import {createWebSocketConnection} from './src/websocketSetup.js'

const gameMapConstructor = require('./src/GameMap');
const updatePeriod = 1000;

const con = require('./src/websocketSetup').createWebSocketConnection();
let mainTimer, stopTimeout;
let gameMap;

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

con.io.on("connection", socket => {
	socket.on("disconnect", () => {
		mainTimer.stop();
		clearTimeout(stopTimeout);
		gameMap = null;
	})

	socket.on("start game", () => {
		
		gameMap = gameMapConstructor.GameMap(5, 5, [1,2,3]);
		con.io.emit("init map", gameMap.toPayload());
		
		console.log("map initialized at " + new Date().toLocaleString());

		mainTimer = makeLoop(updatePeriod, () => {
			gameMap.growUnits();
			con.io.emit("update map", gameMap.toPayload());
		});


		mainTimer.start();
		stopTimeout = setTimeout(() => {
			mainTimer.stop();
			console.log("timer stopped");
		}, 300000);
	});

	socket.on("add operation", payload => {
		let {r1, c1, dir, rate} = JSON.parse(payload);
		console.log(`recieved ${r1},${c1}, ${dir},${rate}`)
		let result = gameMap.moveUnits(r1, c1, dir, rate);
		if(result != 0)
			con.io.emit("player killed", result);
	})
});

con.httpServer.listen(8000, () => {
	console.log("The game server has started...");
})
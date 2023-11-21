function createWebSocketConnection(){
	const express = require("express");

	const bcrypt = require("bcrypt");
	const fs = require("fs");
	const session = require("express-session");

	// Create the Express app
	const app = express();

	// Use the 'public' folder to serve static files
	app.use(express.static("public"));

	// Use the json middleware to parse JSON data
	app.use(express.json());

	// Use the session middleware to maintain sessions
	const gameSession = session({
		secret: "game",
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: { maxAge: 300000 }
	});
	app.use(gameSession);

	const { createServer } = require("http");
	const { Server } = require("socket.io");
	const httpServer = createServer(app);
	const io = new Server(httpServer);

	io.use((socket, next) => {
		gameSession(socket.request, {}, next);
	});

	return {io, httpServer, app};
}

module.exports = { createWebSocketConnection };
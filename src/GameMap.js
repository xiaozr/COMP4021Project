const utils = require('./utils');
const MapValueEnum = {
	EMPTY: '.',
	MOUNTAIN: '*',
	GENERAL: '$',
	CITY: '#'
};

function GameMap(rowsCnt, colsCnt, playerList){
	// private functions
	function fillRandomEmptyCell(map, value){
		let x, y;
		do{
			x = Math.floor(Math.random() * rowsCnt);
			y = Math.floor(Math.random() * colsCnt);
		} while(map[x][y] != MapValueEnum.EMPTY);
		map[x][y] = value;
		return {x, y};
	}

	// variables & initialization

	const staticMap = utils.generateMatrix(rowsCnt, colsCnt, MapValueEnum.EMPTY);
	const unitsMap = utils.generateMatrix(rowsCnt, colsCnt, 0);
	const playerMap = utils.generateMatrix(rowsCnt, colsCnt, 0);
	
	for(let i = 0;i < rowsCnt * colsCnt / 5; i++) {
		fillRandomEmptyCell(staticMap, MapValueEnum.MOUNTAIN);
	}

	for(let i = 0;i < playerList.length;i ++) {
		let {x ,y} = fillRandomEmptyCell(staticMap, MapValueEnum.GENERAL);
		unitsMap[x][y] = 1;
		playerMap[x][y] = playerList[i];
	}

	// public functions

	return {staticMap, unitsMap, playerMap};
}

module.exports = {GameMap}
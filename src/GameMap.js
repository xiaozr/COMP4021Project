const utils = require('./utils');
const MapValueEnum = {
	EMPTY: '.',
	MOUNTAIN: '*',
	GENERAL: '$',
	CITY: '#'
};
const unitGrowthRatio = 10;

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

	// letiables & initialization

	const staticMap = utils.generateMatrix(rowsCnt, colsCnt, MapValueEnum.EMPTY);
	const unitsMap = utils.generateMatrix(rowsCnt, colsCnt, 0);
	const playerMap = utils.generateMatrix(rowsCnt, colsCnt, 0);
	
	let gameTick = 0;
	
	for(let i = 0;i < rowsCnt * colsCnt / 5; i++) {
		fillRandomEmptyCell(staticMap, MapValueEnum.MOUNTAIN);
	}

	for(let i = 0;i < playerList.length;i ++) {
		let {x ,y} = fillRandomEmptyCell(staticMap, MapValueEnum.GENERAL);
		unitsMap[x][y] = 1;
		playerMap[x][y] = playerList[i];
	}

	// public functions

	function growUnits(){
		gameTick ++;
		for(let i = 0;i < rowsCnt;i ++)
			for(let j = 0;j < colsCnt;j ++){
				if(playerMap[i][j]){
					if(staticMap[i][j] == MapValueEnum.GENERAL || staticMap[i][j] == MapValueEnum.CITY)
						unitsMap[i][j] ++;
					else if(gameTick % unitGrowthRatio == 0 && staticMap[i][j] == MapValueEnum.EMPTY)
						unitsMap[i][j] ++;
				}
			}
	}

	function removePlayer(playerID, killerID){
		for(let i = 0;i < rowsCnt;i ++)
			for(let j = 0;j < colsCnt;j ++)
				if(playerMap[i][j] == playerID){
					playerMap[i][j] = killerID;
				}
	}

	/**
	 * 
	 * @param {Number} r1 row of source cell
	 * @param {Number} c1 column of source cell
	 * @param {Number} dir direction of movement, either 1,2,3,4
	 * @param {Number} rate rate of units moved.
	 * @returns 0 if no player is killed, otherwise return that player's ID
	 */
	function moveUnits(r1, c1, dir, rate){
		let r2, c2;
		switch(dir) {
			case 0:	r2 = r1-1;	c2 = c1;	break;	//UP
			case 1:	r2 = r1; 	c2 = c1-1;	break;	//LEFT
			case 2:	r2 = r1+1; 	c2 = c1;	break;	//DOWN
			case 3:	r2 = r1; 	c2 = c1+1;	break;	//RIGHT
		}
		if(!(r2 >= 0 && r2 < rowsCnt && c2 >= 0 && c2 < colsCnt &&
			staticMap[r2][c2] != MapValueEnum.MOUNTAIN)){
			console.log("move rejected: unitsmap=" + unitsMap[r1][c1]);
			return 0;
		}
		let amount = Math.ceil((unitsMap[r1][c1]-1)*rate);
		if(amount <= 0)
			return 0; 
		unitsMap[r1][c1] -= amount;
		
		if(playerMap[r2][c2] == playerMap[r1][c1]) {	//moving inside player's land
			unitsMap[r2][c2] += amount;
			return 0;
		}
														//else: occupying new land
		unitsMap[r2][c2] = amount - unitsMap[r2][c2];
		
		if(unitsMap[r2][c2] < 0) {					//occupation not succeed
			unitsMap[r2][c2] = -unitsMap[r2][c2];
			return 0;
		}

		if(staticMap[r2][c2] == MapValueEnum.GENERAL){
			let re = playerMap[r2][c2];
			removePlayer(playerMap[r2][c2], playerMap[r1][c1]);
			staticMap[r2][c2] = MapValueEnum.CITY;
			return re;
		}
		else{
			playerMap[r2][c2] = playerMap[r1][c1];
			return 0;
		}
	}

	function toPayload(){
		return JSON.stringify({
			staticMap,
			unitsMap,
			playerMap,
			gameTick
		})
	}

	return {gameTick, toPayload, growUnits, moveUnits};
}

module.exports = {GameMap}
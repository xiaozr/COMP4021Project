const utils = require('./utils');
const MapValueEnum = {
	EMPTY: '.',
	MOUNTAIN: '*',
	GENERAL: '$',
	CITY: '#',
	UNKNOWN: ' '
};
const unitGrowthRatioLow = 20, unitGrowthRatioHigh = 2;

function GameMap(playerList){
	// private functions
	function fillRandomEmptyCell(map, empty, value){
		let x, y;
		do{
			x = Math.floor(Math.random() * rowsCnt);
			y = Math.floor(Math.random() * colsCnt);
		} while(map[x][y] != empty);
		map[x][y] = value;
		return {x, y};
	}

	// letiables & initialization
	const rowsCnt = 4 + playerList.length, colsCnt = 4 + playerList.length;
	const staticMap = utils.generateMatrix(rowsCnt, colsCnt, MapValueEnum.UNKNOWN);
	const unitsMap = utils.generateMatrix(rowsCnt, colsCnt, 0);
	const playerMap = utils.generateMatrix(rowsCnt, colsCnt, 0);
	let gameTick = 0;
	
	//generate random map: ensuring generals are all connected.
	function generateMap(minDistance){
		function randInt(l, r){
			return Math.floor(Math.random() * (r-l)) + l;
		} 
		// fill a Path from (stR, stC) to (edR, edC) with EMPTY cell
		function fillPath(stR, stC, edR, edC){
			const stepR = stR < edR ? 1 : -1;
			const stepC = stC < edC ? 1 : -1;
			let crtR = stR, crtC = stC;
			while(crtR != edR || crtC != edC){
				if(staticMap[crtR][crtC] == MapValueEnum.UNKNOWN)
					staticMap[crtR][crtC] = MapValueEnum.EMPTY;
				if(crtR != edR && crtC != edC){
					Math.random() < 0.5 ? (crtR += stepR) : (crtC += stepC);
				}
				else if(crtR != edR)
					crtR += stepR;
				else
					crtC += stepC;
			}
			if(staticMap[crtR][crtC] == MapValueEnum.UNKNOWN)
				staticMap[crtR][crtC] = MapValueEnum.EMPTY;
		}

		// randomly generate position of generals, 
		// ensuring the Manhattan distance between any two generals are greater than minDistance
		let generalsPosition = [];
		for(let playerID of playerList){
			let x, y;
			do {
				x = randInt(0, rowsCnt);
				y = randInt(0, colsCnt);
			}while(!generalsPosition.every(pos => (Math.abs(pos.x - x) + Math.abs(pos.y - y) > minDistance)));
			generalsPosition.push({x, y});
			staticMap[x][y] = MapValueEnum.GENERAL;
			unitsMap[x][y] = 1;
			playerMap[x][y] = playerID;
		}

		// connect the generals together
		for(let i = 1; i < generalsPosition.length;i ++){
			fillPath(generalsPosition[i-1].x, generalsPosition[i-1].y, generalsPosition[i].x, generalsPosition[i].y);
		}

		// generate montains on not-decided-cells
		for(let i = 0;i < rowsCnt * colsCnt / 5; i++) {
			fillRandomEmptyCell(staticMap, MapValueEnum.UNKNOWN, MapValueEnum.MOUNTAIN);
		}

		// fill the rest of the map with empty cell
		for(let i = 0;i < rowsCnt;i ++)
			for(let j = 0;j < colsCnt; j++)
				if(staticMap[i][j] == MapValueEnum.UNKNOWN)
					staticMap[i][j] = MapValueEnum.EMPTY;
	}
	
	generateMap(3);

	// public functions

	function growUnits(){
		gameTick ++;
		for(let i = 0;i < rowsCnt;i ++)
			for(let j = 0;j < colsCnt;j ++){
				if(playerMap[i][j]){
					if(gameTick % unitGrowthRatioHigh == 0 && // General, City: (1unit/second)
						(staticMap[i][j] == MapValueEnum.GENERAL || staticMap[i][j] == MapValueEnum.CITY))
						unitsMap[i][j] ++;
					else if(gameTick % unitGrowthRatioLow == 0 && staticMap[i][j] == MapValueEnum.EMPTY)
						unitsMap[i][j] ++; // Normal: 1unit/10second
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
			return -1;
		}
		let amount = Math.ceil((unitsMap[r1][c1]-1)*rate); // Moving unit amount
		if(amount <= 0) // Unit=1 cell
			return 0; 
		
		unitsMap[r1][c1] -= amount; // Decrease units from original cell
		
		if(playerMap[r2][c2] == playerMap[r1][c1]) {	//moving inside player's land
			unitsMap[r2][c2] += amount;
			return 0;
		}
														//else: occupying new land
		unitsMap[r2][c2] = amount - unitsMap[r2][c2];
		
		if(unitsMap[r2][c2] < 0) {					//occupation not succeed
			unitsMap[r2][c2] = -unitsMap[r2][c2];
			return -1;
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

	function checkCell(playerID, r, c){
		return playerMap[r][c] == playerID;
	}

	return {gameTick, toPayload, growUnits, moveUnits, checkCell};
}

module.exports = {GameMap};
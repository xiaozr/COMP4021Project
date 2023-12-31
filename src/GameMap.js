const utils = require('./utils');
const {MapValueEnum, Dir_to_diff} = require("../public/shared/conventions")

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
	const rowsCnt = 5 + playerList.length, colsCnt = 5 + playerList.length;
	const staticMap = utils.generateMatrix(rowsCnt, colsCnt, MapValueEnum.UNKNOWN);
	const unitsMap = utils.generateMatrix(rowsCnt, colsCnt, 0);
	const playerMap = utils.generateMatrix(rowsCnt, colsCnt, 0);
	const wormHolePos = [];
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
		
		for(let i = 0;i < playerList.length;i ++){
			fillRandomEmptyCell(staticMap, MapValueEnum.EMPTY, MapValueEnum.BONUS);
			fillRandomEmptyCell(staticMap, MapValueEnum.EMPTY, MapValueEnum.TRAP);
			wormHolePos.push(fillRandomEmptyCell(staticMap, MapValueEnum.EMPTY, MapValueEnum.HOLE));
		}
		let {x, y} = fillRandomEmptyCell(staticMap, MapValueEnum.EMPTY, MapValueEnum.CITY);
		unitsMap[x][y] = 60;
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

	function moveUnits(r1, c1, r2, c2, amount, is2ndJump){
		unitsMap[r1][c1] -= amount; // Decrease units from original cell
		
		if(playerMap[r2][c2] == playerMap[r1][c1]) {	//moving inside player's land
			unitsMap[r2][c2] += amount;
		}
		else {											//else: occupying new land
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
			}
		}
		if(unitsMap[r2][c2] == 0){
			return 0;
		}
		if(staticMap[r2][c2] == MapValueEnum.BONUS){
			unitsMap[r2][c2] *= 2;
			staticMap[r2][c2] = MapValueEnum.EMPTY;
			return 0;
		}
		else if(staticMap[r2][c2] == MapValueEnum.TRAP){
			unitsMap[r2][c2] = Math.floor(unitsMap[r2][c2]/2);
			staticMap[r2][c2] = MapValueEnum.EMPTY;
			return 0;
		}
		else if(staticMap[r2][c2] == MapValueEnum.HOLE && !is2ndJump){
			const otherHoles = wormHolePos.filter(pos => (pos.x != r2 || pos.y != c2));
			const idx = Math.floor(Math.random() * otherHoles.length);
			console.log("i become hole in");
			staticMap[r2][c2] = MapValueEnum.HOLE_IN;
			return moveUnits(r2, c2, otherHoles[idx].x, otherHoles[idx].y, unitsMap[r2][c2], true);
		}
		else return 0;
	}

	/**
	 * @param {Number} r1 row of source cell
	 * @param {Number} c1 column of source cell
	 * @param {Number} dir direction of movement, either 1,2,3,4
	 * @param {Number} rate rate of units moved.
	 * @returns 0 if move success and no player is killed, otherwise return that player's ID
	 */
	function executeOperation(r1, c1, dir, rate){
		const [diff_r, diff_c] = Dir_to_diff[dir];
		let r2 = r1 + diff_r, c2 = c1 + diff_c;
		if(!(r2 >= 0 && r2 < rowsCnt && c2 >= 0 && c2 < colsCnt &&
			staticMap[r2][c2] != MapValueEnum.MOUNTAIN)){
			console.log("move rejected: unitsmap=" + unitsMap[r1][c1]);
			return 0;
		}
		let amount = Math.ceil((unitsMap[r1][c1]-1)*rate); // Moving unit amount
		if(amount <= 0) // Unit=1 cell
			return 0; 
		return moveUnits(r1, c1, r2, c2, amount, false);
	}

	function pack(){
		return {
			staticMap,
			unitsMap,
			playerMap,
			gameTick
		};
	}

	function checkCell(playerID, r, c){
		return playerMap[r][c] == playerID;
	}

	function setPlayerAtCell(player, cell) {
            playerMap[cell.r1][cell.c1] = player;
			unitsMap[cell.r1][cell.c1] = 100;
			staticMap[cell.r1][cell.c1] = MapValueEnum.CITY;
    }

	function clearHoleIn(i, j) {
		staticMap[i][j] = MapValueEnum.HOLE;
	}

	return {gameTick, pack, growUnits, executeOperation, checkCell, setPlayerAtCell, clearHoleIn};
}

module.exports = {GameMap};
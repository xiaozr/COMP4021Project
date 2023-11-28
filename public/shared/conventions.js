const MapValueEnum = {
	MOUNTAIN: '*',
	GENERAL: '$',
	CITY: '#',
	EMPTY: '.',
	UNKNOWN: ' ', 				//only used inside the map generating procedure
	BONUS: 'B',
	TRAP: 'T',
	HOLE: 'H'
}

const MapValueEnum_to_image = {
	'*': "imgs/mountain.svg", 	
	'$': "imgs/general.svg", 	
	'#': "imgs/city.svg", 		
	'.': "imgs/empty.svg",		
	'B': "imgs/bonus.svg", 		
	'T': "imgs/trap.svg", 		
	'H': "imgs/hole.svg", 		
};

const Key_to_Dir = {
	'w': 0,
	'a': 1,
	's': 2,
	'd': 3
};

const Dir_to_diff = {		//[diff_in_row, diff_in_col]
	0: [-1, 0],
	1: [0, -1],
	2: [1, 0],
	3: [0, 1]
};

if (typeof process === 'object') { // Detect when this is nodejs
    // only exports in backend
    module.exports = {MapValueEnum, MapValueEnum_to_image, Key_to_Dir, Dir_to_diff};
}

function generateMatrix(rowsCnt, colsCnt, value) {
	const ret = [];
	for(let i = 0;i < rowsCnt; i++) {
		const row = [];
		for(let j = 0;j < colsCnt;j ++){
			row.push(value);
		}
		ret.push(row);
	}
	return ret;
}

function charMatrix2Str(mat) {
	return mat.map(x => x.join("")).join("\n");
}

module.exports = {generateMatrix, charMatrix2Str};
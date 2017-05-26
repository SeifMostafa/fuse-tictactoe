var Observable = require("FuseJS/Observable")

/* The grid will be 3x3 but we just flatten it here into an array of 9. */
var numRows = 3
var numCols = 3
var numCells = numRows * numCols

/* An enum of the cell states */
var cellState = {
	None: 0,
	O: 1,
	X: 2,
}

/* Records the position and state of the cells in the grid */
function Cell( x, y ) {
	var _this = this
	this.x = x
	this.y = y
	this.state = Observable(cellState.None)
	
	this.reset = function() {
		_this.state.value = cellState.None
	}
}


var curTurn = Observable(cellState.O)
var grid = Observable()

/* Initialize the game state */
function initialize() {
	for (var y=0; y < numRows; ++y ) {
		for (var x=0; x <numCols ; ++x ) {
			grid.add( new Cell(x,y) )
		}
	}
}

/* Reset the game to the starting state */
function reset() {
	for (var i=0; i < grid.length; ++i) {
		grid.getAt(i).reset()
	}
	
	curTurn = cellState.O
}

/* The user has clicked on one of the cells */
function cellClicked(args) {
	var data = args.data
	if (data.state.value != cellState.None) {
		return
	}
	
	data.state.value = curTurn.value
	endTurn();
}

function endTurn() {
	curTurn.value = curTurn.value == cellState.O ? cellState.X : cellState.O
}

initialize()

module.exports = {
	numRows: numRows,
	numCols: numCols,
	grid: grid,
	cellClicked: cellClicked,
	curTurn: curTurn,
}
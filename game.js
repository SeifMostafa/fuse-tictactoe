var Observable = require("FuseJS/Observable")

/* An enum of the cell states */
var cellState = {
	None: "",
	O: "o",
	X: "x",
}

/* An enum of win conditions */
var winHow = {
	None: 0,
	Row: 1,
	Col: 2,
	Diagonal: 3,
	Tie: 4,
}

/* Records the position and state of the cells in the grid */
function Cell( x, y ) {
	var _this = this
	//the position of the cell (cell in "grid" must be rowmajor order for the display)
	this.x = x
	this.y = y
	//who's marked the cell
	this.state = Observable(cellState.None)
	//true if this cell is part of the winning cells
	this.win = Observable(false)
	
	this.reset = function() {
		_this.state.value = cellState.None
		_this.win.value = false
	}
}

/* Contains the game state and functons to progress the game */
var game = new function() {
	var _game = this
	this.curTurn = Observable(cellState.O)
	this.grid = Observable()
	/* The grid will be 3x3 but we just flatten it here into an array of 9. */
	this.size = 3
	this.used = 0
	this.gameOver = Observable(false)
	this.winner = Observable("")

	for (var y=0; y < _game.size; ++y ) {
		for (var x=0; x < _game.size ; ++x ) {
			_game.grid.add( new Cell(x,y) )
		}
	}
	
	/* Restore the game to the starting state */
	this.reset = function() {
		for (var i=0; i < game.grid.length; ++i) {
			_game.grid.getAt(i).reset()
		}
		
		_game.used = 0
		_game.curTurn.value = cellState.O
		_game.gameOver.value = false
	}
	
	this.getCell = function(x,y) {
		return _game.grid.getAt(x + y * _game.size)
	}
	
	/* The current player is attempting to mark this cell */
	this.cellClicked = function(cell) {
		if (cell.state.value != cellState.None) {
			return
		}
	
		cell.state.value = _game.curTurn.value
		_game.used++
		_game.endTurn();
	}
	
	/* The turn of the current player is over */
	this.endTurn = function() {
		_game.curTurn.value = _game.curTurn.value == cellState.O ? cellState.X : cellState.O
		_game.checkEnd()
	}
	
	/* Check if the game is over, due to win or tie */
	this.checkEnd = function() {
		var win = _game.checkWin()
		//no win, but no cells left, thus a tie
		if (win.how == winHow.None && _game.used == (_game.size * _game.size)) {
			win = { how: winHow.Tied }
		}
		
		if (win.how != winHow.None) {
			_game.gameOver.value = true
			_game.markWin(win)
			_game.winner.value = win.winner
		}
	}
	
	/* Check if a row, column or diagonal is all in one state (it wins) */
	this.checkWin = function() {
		for (var y=0; y < _game.size; ++y) {
			var state = _game.getCell(0,y).state.value
			if (state == cellState.None) {
				continue;
			}
			
			var okay = true
			for (var x =1; x < _game.size; ++x) {
				okay = okay && _game.getCell(x,y).state.value == state
			}
			if (okay) { 
				return { how: winHow.Row, y: y, x: 0, winner: state }
			}
		}
		
		for (var x = 0; x < _game.size; ++x) { 
			var state = _game.getCell(x,0).state.value
			if (state == cellState.None) {
				continue;
			}
			
			var okay = true
			for (var y = 1; y < _game.size; ++y) {
				okay = okay && _game.getCell(x,y).state.value == state
			}
			if (okay) {
				return { how: winHow.Col, x: x, y: 0, winner: state }
			}
		}
		
		return { how: winHow.None }
	}
	
	/* set Cell.win = true on those cells in the winning selection */
	this.markWin = function(win) {
		if (win.how == winHow.Col ) {
			for (var y=0; y < _game.size; ++y) {
				_game.getCell(win.x, y).win.value = true
			}
		} else if (win.how == winHow.Row) {
			for (var x=0; x < _game.size; ++x) {
				_game.getCell(x,win.y).win.value = true
			}
		}
	}
}


function cellClicked(args) {
	game.cellClicked(args.data)
}

function restart() {
	game.reset()
}

module.exports = {
	game: game,
	cellClicked: cellClicked,
	restart: restart,
}
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
	DiagDown: 3,
	DiagUp: 4,
	Tie: 5,
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
		if (game.gameOver.value) {
			return
		}
		
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
			win = { how: winHow.Tied, winner: cellState.None }
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
			var winner = _game.checkWinLine(0,y, 1,0)
			if (winner != cellState.None) {
				return { how: winHow.Row, y: y, x: 0, winner: winner }
			}
		}
		
		for (var x = 0; x < _game.size; ++x) { 
			var winner = _game.checkWinLine(x,0, 0,1)
			if (winner != cellState.None) {
				return { how: winHow.Col, y: 0, x: x, winner: winner }
			}
		}
		
		var winner = _game.checkWinLine(0,0, 1,1)
		if (winner != cellState.None) {
			return { how: winHow.DiagDown, y:0, x:0, winner: winner }
		}
		
		winner = _game.checkWinLine(0,_game.size-1, 1,-1)
		if (winner != cellState.None) {
			return { how: winHow.DiagUp, x:0, y:_game.size-1, winner: winner }
		}
		
		return { how: winHow.None }
	}
	
	/** 
		Check if the position at (x0,y0) along line (stepX,stepY) wins 
		Returns the winner as a cellState
	*/
	this.checkWinLine = function(x0,y0, stepX, stepY) {
		var state = _game.getCell(x0,y0).state.value
		var okay = true
		for (var s = 1; s < _game.size; ++s) {
			okay = okay && _game.getCell( x0 + stepX * s, y0 + stepY * s).state.value == state
		}
		return okay ? state : cellState.None
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
		} else if (win.how == winHow.DiagDown) {
			for (var s=0; s < _game.size; ++s) {
				_game.getCell(win.x+s,win.y+s).win.value = true
			}
		} else if (win.how == winHow.DiagUp) {
			for (var s=0; s < _game.size; ++s) {
				_game.getCell(win.x+s,win.y-s).win.value = true
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
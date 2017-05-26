var Observable = require("FuseJS/Observable")

/* An enum of the cell states */
var cellState = {
	None: 0,
	O: 1,
	X: 2,
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
	this.x = x
	this.y = y
	this.state = Observable(cellState.None)
	this.win = Observable(false)
	
	this.reset = function() {
		_this.state.value = cellState.None
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

	for (var y=0; y < _game.size; ++y ) {
		for (var x=0; x < _game.size ; ++x ) {
			_game.grid.add( new Cell(x,y) )
		}
	}
	
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
	
	this.cellClicked = function(cell) {
		if (cell.state.value != cellState.None) {
			return
		}
	
		cell.state.value = _game.curTurn.value
		_game.used++
		_game.endTurn();
	}
	
	this.endTurn = function() {
		_game.curTurn.value = _game.curTurn.value == cellState.O ? cellState.X : cellState.O
		_game.checkEnd()
	}
	
	this.checkEnd = function() {
		var win = _game.checkWin()
		if (win.how == winHow.None && _game.used == (_game.size * _game.size)) {
			win = { how: winHow.Tied }
		}
		
		if (win.how != winHow.None) {
			_game.gameOver.value = true
		}
	}
	
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
				return { how: winHow.Row, y: y, x: 0 }
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
				return { how: winHow.Col, x: x, y: 0 }
			}
		}
		
		return { how: winHow.None }
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
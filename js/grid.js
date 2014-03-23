function Grid(size, previousState) {
	this.size = size;
	this.startTiles = 2;
	this.cells = previousState ? this.fromState(previousState) : this.empty();
}

Grid.prototype.print = function() {
	
	var pad = function(str,len,pv) {
		s = str;
		for(i=0;i<(len-str.length);++i) {
			s = pv + s;
		}
		return s;
	};
	
	for(var y=0;y<this.size;++y) {
	
		var s = "";
		for(var x=0;x<this.size;++x) {
			var tile = this.cells[x][y];
			s += tile == null ? pad("0",5," ") : pad(""+tile.value,5," ");
		}
		console.log(s);
	}
	
};

Grid.prototype.copy = function(grid) {
	this.size = grid.size;
	
	var self = this;
	grid.eachCell(function(x,y,tile) {
		if(tile) {
			self.cells[x][y] = new Tile(null,null,tile);
		}
	});
};

// Save all tile positions and remove merger info
Grid.prototype.prepareTiles = function() {
	this.eachCell(function(x, y, tile) {
		if (tile) {
			tile.mergedFrom = null;
			tile.savePosition();
		}
	});
};


//Get the vector representing the chosen direction
Grid.prototype.getVector = function (direction) {
	// Vectors representing tile movement
	var map = {
		0: { x: 0,  y: -1 }, // Up
		1: { x: 1,  y: 0 },  // Right
		2: { x: 0,  y: 1 },  // Down
		3: { x: -1, y: 0 }   // Left
	};

	return map[direction];
};

// Check for available matches between tiles (more expensive check)
Grid.prototype.tileMatchesAvailable = function() {
	var self = this;

	var tile;

	for (var x = 0; x < this.size; x++) {
		for (var y = 0; y < this.size; y++) {
			tile = this.cellContent({
				x : x,
				y : y
			});

			if (tile) {
				for (var direction = 0; direction < 4; direction++) {
					var vector = self.getVector(direction);
					var cell = {
						x : x + vector.x,
						y : y + vector.y
					};

					var other = self.cellContent(cell);

					if (other && other.value === tile.value) {
						return true; // These two tiles can be merged
					}
				}
			}
		}
	}

	return false;
};

Grid.prototype.positionsEqual = function (first, second) {
	return first.x === second.x && first.y === second.y;
};

// Build a list of positions to traverse in the right order
Grid.prototype.buildTraversals = function(vector) {
	var traversals = {
		x : [],
		y : []
	};

	for (var pos = 0; pos < this.size; pos++) {
		traversals.x.push(pos);
		traversals.y.push(pos);
	}

	// Always traverse from the farthest cell in the chosen direction
	if (vector.x === 1)
		traversals.x = traversals.x.reverse();
	if (vector.y === 1)
		traversals.y = traversals.y.reverse();

	return traversals;
};

Grid.prototype.movesAvailable = function () {
	return this.cellsAvailable() || this.tileMatchesAvailable();
};

// Set up the initial tiles to start the game with
Grid.prototype.addStartTiles = function() {
	for (var i = 0; i < this.startTiles; i++) {
		this.addRandomTile();
	}
};

// Adds a tile in a random position
Grid.prototype.addRandomTile = function() {
	if (this.cellsAvailable()) {
		var value = Math.random() < 0.9 ? 2 : 4;
		var tile = new Tile(this.randomAvailableCell(), value);

		this.insertTile(tile);
	}
};

// Move a tile and its representation
Grid.prototype.moveTile = function(tile, cell) {
	this.cells[tile.x][tile.y] = null;
	this.cells[cell.x][cell.y] = tile;
	tile.updatePosition(cell);
};

Grid.prototype.findFarthestPosition = function (cell, vector) {
	  var previous;

	// Progress towards the vector direction until an obstacle is found
	do {
		previous = cell;
		cell = {
			x : previous.x + vector.x,
			y : previous.y + vector.y
		};
	} while (this.withinBounds(cell) && this.cellAvailable(cell));

	return {
		farthest : previous,
		next : cell
	// Used to check if a merge is required
	};
};

// Build a grid of the specified size
Grid.prototype.empty = function() {
	
	var cells = [];

	for (var x = 0; x < this.size; x++) {
		var row = cells[x] = [];

		for (var y = 0; y < this.size; y++) {
			row.push(null);
		}
	}

	return cells;
};

Grid.prototype.fromState = function(state) {
	var cells = [];

	for (var x = 0; x < this.size; x++) {
		var row = cells[x] = [];

		for (var y = 0; y < this.size; y++) {
			var tile = state[x][y];
			row.push(tile ? new Tile(tile.position, tile.value) : null);
		}
	}

	return cells;
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function() {
	var cells = this.availableCells();

	if (cells.length) {
		return cells[Math.floor(Math.random() * cells.length)];
	}
};

Grid.prototype.availableCells = function() {
	var cells = [];

	this.eachCell(function(x, y, tile) {
		if (!tile) {
			cells.push({
				x : x,
				y : y
			});
		}
	});

	return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function(callback) {
	for (var x = 0; x < this.size; x++) {
		for (var y = 0; y < this.size; y++) {
			callback(x, y, this.cells[x][y]);
		}
	}
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function() {
	return !!this.availableCells().length;
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function(cell) {
	return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function(cell) {
	return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function(cell) {
	if (this.withinBounds(cell)) {
		return this.cells[cell.x][cell.y];
	} else {
		return null;
	}
};

// Inserts a tile at its position
Grid.prototype.insertTile = function(tile) {
	this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.removeTile = function(tile) {
	this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function(position) {
	return position.x >= 0 && position.x < this.size && position.y >= 0
			&& position.y < this.size;
};

Grid.prototype.serialize = function() {
	var cellState = [];

	for (var x = 0; x < this.size; x++) {
		var row = cellState[x] = [];

		for (var y = 0; y < this.size; y++) {
			row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
		}
	}

	return {
		size : this.size,
		cells : cellState
	};
};

Grid.prototype.move = function(direction) {

	// 0: up, 1: right, 2: down, 3: left
	var self = this;

	var cell, tile;

	var vector = this.getVector(direction);
	var traversals = this.buildTraversals(vector);
	var moved = false;

	// Save the current tile positions and remove merger information
	this.prepareTiles();
	
	var update = {
		score: 0,
		won: false,
		moved: false
	};

	// Traverse the grid in the right direction and move tiles
	traversals.x.forEach(function(x) {
		traversals.y.forEach(function(y) {
			cell = {
				x : x,
				y : y
			};
			tile = self.cellContent(cell);

			if (tile) {
				var positions = self.findFarthestPosition(cell, vector);
				var next = self.cellContent(positions.next);

				// Only one merger per row traversal?
				if (next && next.value === tile.value && !next.mergedFrom) {
					var merged = new Tile(positions.next, tile.value * 2);
					merged.mergedFrom = [ tile, next ];

					self.insertTile(merged);
					self.removeTile(tile);

					// Converge the two tiles' positions
					tile.updatePosition(positions.next);

					// Update the score
					update.score += merged.value;

					// The mighty 2048 tile
					if (merged.value === 2048)
						update.won = true;
				} else {
					self.moveTile(tile, positions.farthest);
				}

				if (!self.positionsEqual(cell, tile)) {
					update.moved = true; // The tile moved from its original cell!
				}
			}
		});
	});
	return update;
};


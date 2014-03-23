function Tile(position, value,tile) {
	if(tile) {
		this.x = tile.x;
		this.y = tile.y;
		this.value = tile.value;
		this.previousPosition = tile.previousPosition;
		this.mergedFrom = tile.mergedFrom;
	} else {
		this.x = position.x;
		this.y = position.y;
		this.value = value || 2;

		this.previousPosition = null;
		this.mergedFrom = null; // Tracks tiles that merged together
	}
}

Tile.prototype.savePosition = function() {
	this.previousPosition = {
		x : this.x,
		y : this.y
	};
};

Tile.prototype.updatePosition = function(position) {
	this.x = position.x;
	this.y = position.y;
};

Tile.prototype.serialize = function() {
	return {
		position : {
			x : this.x,
			y : this.y
		},
		value : this.value
	};
};

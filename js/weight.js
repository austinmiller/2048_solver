
prop = {
	gridWeights : [
		[   0,   0,   0,   0 ],
		[   4,   3,   2,   1 ],
		[   8,  16,  32,  64 ],
		[1024, 512, 256, 128 ]
	],
	nullWeights : [
   		[   0,   0,   0,   0 ],
   		[   0,   0,   0,   0 ],
   		[   0,   0,  10,  20 ],
   		[1024,  50,  40,  30 ]
   	],
	hangTime: 10
};

Grid.prototype.value = function() {
	var rv = {
		gw: 0,
		nw: 0,
		mult: 1
	};
	
	this.eachCell(function(x,y,tile){
		if(tile) {
			rv.gw += tile.value*prop.gridWeights[y][x];
		} else {
			rv.nw -= prop.nullWeights[y][x];
		}
	});
	
	var m = 5 - Math.min(5,this.cellsAvailable());
	rv.mult = 1- (m/10);
	return rv;
};

var pad = function(str,len,pv) {
	var s = str;
	
	var m = Math.max(0,len-str.length);
	for(i=0;i<m;++i) {
		s = pv + s;
	}
	return s;
};

Grid.prototype.bestMove = function(movesLeft,grid) {
	
	var s = pad("",3-movesLeft,"  ");
	
	var rv = {
		values: { total: 0 },
		move: -1
	};
	
	if(--movesLeft == 0) return rv;
	
	for(var fff =0;fff<4;++fff) {
		var tg = new Grid(4);
		tg.copy(grid);
		var update = tg.move(fff);
		if(update.moved === false) continue;
		
		var v = tg.value();
		
		v.subtotal = +(v.gw + v.nw)*v.mult*(movesLeft*0.50);
		var bm = tg.bestMove(movesLeft,tg);
		v.total = v.subtotal + bm.values.total;
		
		if(v.total > rv.values.total || rv.move == -1) {
			rv.values = v;
			rv.move = fff;
			rv.bm = bm;
		}
	}
	return rv;
};


function wmove() {
	var m = window.gm.grid.bestMove(3,window.gm.grid);
	console.log(m);
	window.gm.move(m.move);
};

function autoplay() {
	if(window.gm.isGameTerminated()) {
		return;
	}

	setTimeout(function () { autoplay(); },prop.hangTime);
	wmove();
};


class AutopPointsPath {
	constructor(points, rect_offset) {
		this.points = [];
		this.grid = new Phaser.Structs.Map();
		this.rtree = new Phaser.Structs.RTree();
		if(points !== undefined && typeof points === 'object' && points.hasOwnProperty(0)) this.setPoints(points);		
		if(rect_offset) this.makeRtree(rect_offset);
	}

	setPoints(points) {
		this.points = points;
	}
	
	getCurveLengths() {
		return [this.points.length];
	}
	
	getPointsRects(offset, grid_size, rwh) {	
		let out = [];
		let next_grid_x_, next_grid_x = false;
		for(let i = 0; i < this.points.length; i++) {			
			if(grid_size) {
				next_grid_x_ = next_grid_x;
				if(next_grid_x) {
					if(rwh) {
						if(this.points[i].y < next_grid_x) next_grid_x_ -= grid_size;
					} else {
						if(this.points[i].x > next_grid_x) next_grid_x_ += grid_size;
					}
				} else {
					next_grid_x_ = Phaser.Math.Snap[rwh? 'Ceil' : 'Floor'](this.points[i][rwh ? 'y' : 'x'], grid_size);
				}
				if(next_grid_x !== next_grid_x_) {					
					next_grid_x = next_grid_x_;
					let _ar = rwh ? [Phaser.Math.Snap.Floor(this.points[i].x, grid_size), next_grid_x] : [next_grid_x, Phaser.Math.Snap.Floor(this.points[i].y, grid_size)];
					this.grid.set(i, _ar.join('_'));					
				}
			}
			let offset2 = offset * 2;
			let _d = 0;
			let offsets = {minX: offset, minY: offset, maxX: offset, maxY: offset};
			if(i > 0) {				
				['x', 'y'].forEach((xy) => {
					_d = Math.abs(this.points[i][xy] - this.points[i - 1][xy]);
					if(_d > offset2) {
						let _k = this.points[i][xy] > this.points[i - 1][xy] ? ('min'+xy.toUpperCase()) : ('max'+xy.toUpperCase());
						offsets[_k] = Math.ceil(_d) - offset + 2;
					}
				});				
			}
			out.push({minX: this.points[i].x - offsets.minX, minY: this.points[i].y - offsets.minY,
			maxX: this.points[i].x + offsets.maxX, maxY: this.points[i].y + offsets.maxY});
		}
		return out;
	}
	
	makeRtree(offset, grid_size, rwh) {
		if(grid_size === undefined) grid_size = 0;
		this.rtree.load(this.getPointsRects(offset, grid_size, rwh));
	}
	
	getPoints() {
		return this.points;
	}
	
	getPointsSubSet(interval) {
		let i = 0;
		let out = [];
		let l = this.points.length - 1;
		while(true) {
			if(i >= l) {
				out.push(this.points[l]);
				return out;
			}
			out.push(this.points[i]);
			i += interval;
		}
	}		
	
	movePoints(x, y) {
		let out = [];
		for(let i = 0; i < this.points.length; i++) {
			out.push(new Phaser.Math.Vector2(this.points[i].x + x, this.points[i].y + y));
		}
		return out;
	}
	
	movePointsToZero() {
		return this.movePoints(-this.points[0].x, -this.points[0].y);
	}

	movePointsToZeroX() {
		return this.movePoints(-this.points[0].x, 0);
	}
	
	movePointsToZeroY() {
		return this.movePoints(-this.points[0].y, 0);
	}	
	
	getZeroX() {
		return this.points[0].x;
	}

	getZeroY() {
		return this.points[0].y;
	}
	
	findExtrem() {		
		let bounds = Phaser.Geom.Rectangle.FromPoints(this.points);
		return {
			min_x : bounds.x,
			max_x : bounds.x + bounds.width,
			min_y : bounds.y,
			max_y : bounds.y + bounds.height
		};
	}
	
	addPoint(p) {
		this.points.push(p);
	}
	
	getStartPoint(out) {
		if (out === undefined) { out = new Phaser.Math.Vector2(); }
		return out.copy(this.points[0]);		
	}
	
	getEndPoint(out) {
		if (out === undefined) { out = new Phaser.Math.Vector2(); }		
		return out.copy(this.points[this.points.length - 1]);
	}
	
	getPoint(i, out) {		
		if (out === undefined) { out = new Phaser.Math.Vector2(); }
		if(i === 0) return out.copy(this.points[0]);
		if(i < 1) i = this.points.length * i;
		i = Math.round(i);
		if(i >= this.points.length) i = this.points.length - 1;					
		return out.copy(this.points[i]);
	}
	
	getLengthX() {
		return Math.abs(this.points[this.points.length - 1].x - this.points[0].x);
	}
	
	getLengthY() {
		return Math.abs(this.points[this.points.length - 1].y - this.points[0].y);
	}
	
}

export default AutopPointsPath
import AutopRand from '../util/autoprand';

class AutopGenObs {

	constructor(cfg) {
		this.cfg;
		this.setConfig(cfg);
	}
	
	setConfig(cfg) {
		this.cfg = cfg;
	}

	generate(path_objects) {		
		return this._gen(this.cfg.gen_obs.type, path_objects, this.cfg.gen_obs);
	}
	
	_gen(type, path_objects, opts) {
		//tmp
		//rects -> rects, squares, important, small rects, real obs hit areas
	
		if(!(path_objects instanceof Array)) path_objects = [path_objects];
		let out = new Phaser.Structs.Map();
		let _pcoords = [];
		path_objects.forEach((po) => {_pcoords.push(po.points.grid.values());});
		let polen = path_objects.length;

		let _added = 0;
		let min_x = parseInt(_pcoords[0][0].split('_')[0]) + this.cfg.grid;
		let max_x = parseInt(_pcoords[0][_pcoords[0].length - 1].split('_')[0]);
		let min_y = 0;
		let max_y = Phaser.Math.Snap.Floor(this.cfg.heightField, this.cfg.grid);
		let prev_collided = 0;
		for(let x = min_x; x < (max_x - this.cfg.grid); x += this.cfg.grid) {
			for(let y = min_y; y < max_y; y += this.cfg.grid) {
				let __collided = false;
				for(let i = 0; i < polen; i++ ) {
					if(_pcoords[i].indexOf([x, y].join('_')) != -1) {
						__collided = true;
						break;
					}
				}
				if(!__collided) {
					for(let i = 0; i < polen; i++ ) {
						if(path_objects[i].points.rtree.collides({minX: x, maxX: x + this.cfg.grid, minY: y, maxY: y + this.cfg.grid})) {
							__collided = true;
							break;
						}
					}
				}
				if(__collided) {
					prev_collided = 0;
					continue;
				}
				if(!opts.include_all && prev_collided < opts.prev_collide_limit) prev_collided++;
				if(opts.include_all || prev_collided < 2 || AutopRand.chanceOneIn(prev_collided * opts.chance_multiplier)) {
					let rect = new Phaser.Geom.Rectangle(x, y, this.cfg.grid, this.cfg.grid);
					_added++;
					if(!out.has(x)) {
						out.set(x, [rect]);
					} else {
						out.get(x).push(rect);
					}
				}
			}
		}		
		if(!_added) return false;
		return out;
	}


}

export default AutopGenObs;
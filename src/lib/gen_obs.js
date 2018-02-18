import AutopRand from '../util/autoprand';
import AutopSet from '../util/set';
import {AutopMap, AutopMapOfSets} from '../util/map';

class AutopGenObs {

	constructor(cfg) {
		this.cfg;
		this.setConfig(cfg);
		this.cfggrid2 = this.cfg.grid * 2;
		this.cfggrid3 = this.cfg.grid * 3;		
	}
	
	setConfig(cfg) {
		this.cfg = cfg;
	}

	generate(path_objects) {		
		//return this._gen(this.cfg.gen_obs.type, path_objects, this.cfg.gen_obs);
		var type = this.cfg.gen_obs.type;
		var opts = this.cfg.gen_obs;
		
		//tmp
		//rects -> rects, x4/9/16, important, small rects to generate wrong paths, real obs hit areas for collision
	
		if(!(path_objects instanceof Array)) path_objects = [path_objects];
		
		let tmpdata = this._empty_struct();
		let _pcoords = [];
		path_objects.forEach((po) => {_pcoords.push(po.points.grid.values());});
		let polen = path_objects.length;
		
		let min_x = parseInt(_pcoords[0][0].split('_')[0]) + this.cfg.grid;
		let max_x = parseInt(_pcoords[0][_pcoords[0].length - 1].split('_')[0]);
		let min_y = 0;
		let max_y = Phaser.Math.Snap.Floor(this.cfg.heightField, this.cfg.grid);
		let counter_x = -1;		
		let prev_xy = false;		
		let just_collided = false;
		
		for(let x = min_x; x < (max_x - this.cfg.grid); x += this.cfg.grid) {
			counter_x++;
			let counter_y = -1;
			for(let y = min_y; y < max_y; y += this.cfg.grid) {
				counter_y++;
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
					just_collided = [x, y];
					if(prev_xy) {
						if(prev_xy[1] < y) tmpdata.important.set(prev_xy[2]);
						prev_xy = false;
					}
					continue;
				}
				
				prev_xy = [x, y, [x, y].join('_')];
				tmpdata.x1.set(prev_xy[2]);				
				if(just_collided) {
					if(just_collided[1] < y) tmpdata.important.set(prev_xy[2]);
					just_collided = false;
				} else if(opts.use_combined_cells && counter_x > 0 && counter_y > 0) {
					this._find_combined_cells(tmpdata, counter_x, counter_y, x, y);
				}
			}
		}	
		//console.log(tmpdata);//tmp to delete
		if(type === 'img') {
			return this._gen_img(tmpdata, opts);
		} else {
			return this._gen_square(tmpdata, opts);
		}		
	}
	
	_gen_square(tmpdata, opts) {
		let _added = 0;
		let out = new AutopMap();
		tmpdata.x1.each((x_y) => {
			if(opts.include_all || tmpdata.important.contains(x_y) || AutopRand.chanceOneIn(opts.chance_multiplier)) {
				_added++;
				let _xy = x_y.split('_').map((_x) => parseInt(_x));
				out.append(_xy[0], new Phaser.Geom.Rectangle(_xy[0], _xy[1], this.cfg.grid, this.cfg.grid));
			}
		});
		
		return (_added ? out : false);
	}
	
	_gen_img(tmpdata, opts) {
		let _added = 0;
		let out = new AutopMap();
		
		return (_added ? out : false);		
	}	

	_empty_struct() {
		return {
			x1: (new AutopSet()),
			important: (new AutopSet()),
			x2: (new AutopMapOfSets()),
			x3: (new AutopMapOfSets()),
			x4: (new AutopMapOfSets())
		};
	}
	
	_find_combined_cells(tmpdata, counter_x, counter_y, x, y) {
		let _2check = [
			[x - this.cfg.grid, y - this.cfg.grid].join('_'),
			[x - this.cfg.grid, y].join('_'),						
			[x, y - this.cfg.grid].join('_')
		];
		if(tmpdata.x1.containsArray(_2check)) {
			_2check.push([x, y].join('_'));
			tmpdata.x2.addset(_2check[0], _2check);
			if(counter_x > 1 && counter_y > 1) {
				let _3check = [[x - this.cfggrid2, y].join('_'), [x, y - this.cfggrid2].join('_')];
				let _3key = [x - this.cfggrid2, y - this.cfggrid2].join('_');
				if(tmpdata.x2.has(_3key) && tmpdata.x1.containsArray(_3check)) {
					tmpdata.x3.set(_3key, tmpdata.x2.get(_2check[0]).union(tmpdata.x2.get(_3key)).set(_3check[0]).set(_3check[1]));
					if(counter_x > 2 && counter_y > 2) {
						let _4check = [[x - this.cfggrid3, y].join('_'), [x, y - this.cfggrid3].join('_')];
						let _4key = [x - this.cfggrid3, y - this.cfggrid3].join('_');
						if(tmpdata.x3.has(_4key) && tmpdata.x1.containsArray(_4check)) tmpdata.x4.set(_4key, tmpdata.x3.get(_3key).union(tmpdata.x3.get(_4key)).set(_4check[0]).set(_4check[1]));
					}
				}
			}
		}	
	}
	
}

export default AutopGenObs;

/* //tmp to delete old gen_obs
	generate(path_objects) {		
		//return this._gen(this.cfg.gen_obs.type, path_objects, this.cfg.gen_obs);
		var type = this.cfg.gen_obs.type;
		var opts = this.cfg.gen_obs;
		
		//tmp
		//rects -> rects, x4/9/16, important, small rects to generate wrong paths, real obs hit areas for collision
	
		if(!(path_objects instanceof Array)) path_objects = [path_objects];
		let out = new AutopMap();
		let tmpdata = this._empty_struct();
		let _pcoords = [];
		path_objects.forEach((po) => {_pcoords.push(po.points.grid.values());});
		let polen = path_objects.length;

		let _added = 0;
		let min_x = parseInt(_pcoords[0][0].split('_')[0]) + this.cfg.grid;
		let max_x = parseInt(_pcoords[0][_pcoords[0].length - 1].split('_')[0]);
		let min_y = 0;
		let max_y = Phaser.Math.Snap.Floor(this.cfg.heightField, this.cfg.grid);
		let prev_collided = 0;
		let counter_x = -1;
		let prev = false;
		let prev_xy = false;		
		let just_collided = false;
		for(let x = min_x; x < (max_x - this.cfg.grid); x += this.cfg.grid) {
			counter_x++;
			let counter_y = -1;
			for(let y = min_y; y < max_y; y += this.cfg.grid) {
				counter_y++;
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
					just_collided = [x, y];
					prev_collided = 0;
					if(prev) {
						_added++;
						out.append(...prev);
						prev = false;
					}
					if(prev_xy) {
						if(prev_xy[1] < y) tmpdata.important.set(prev_xy[2]);
						prev_xy = false;
					}
					continue;
				}
				
				prev_xy = [x, y, [x, y].join('_')];
				tmpdata.x1.set(prev_xy[2]);				
				if(just_collided) {
					if(just_collided[1] < y) tmpdata.important.set(prev_xy[2]);
					just_collided = false;
				} else if(opts.use_combined_cells && counter_x > 0 && counter_y > 0) {
					this._find_combined_cells(tmpdata, counter_x, counter_y, x, y);
				}
				
				if(prev) prev = false;
				if(!opts.include_all && prev_collided < opts.prev_collide_limit) prev_collided++;
				let rect = new Phaser.Geom.Rectangle(x, y, this.cfg.grid, this.cfg.grid);				
				if(opts.include_all || prev_collided < 2 || AutopRand.chanceOneIn(prev_collided * opts.chance_multiplier)) {
					_added++;
					out.append(x, rect);
				} else {
					prev = [x, rect];
				}
			}
		}	
		//console.log(tmpdata);//tmp to delete
		//if(!_added) return false; //tmp to delete
		//return out;//tmp to delete
		if(type === 'img') {
			return this._gen_img(tmpdata, opts);
		} else {
			return this._gen_square(tmpdata, opts);
		}		
	}
*/
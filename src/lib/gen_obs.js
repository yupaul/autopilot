import AutopRand from '../util/autoprand';
import AutopSet from '../util/set';
import {AutopMap, AutopMapOfSets} from '../util/map';

class Obstacle {
	constructor(type, texture_data, shape_data) {
		this.image = false;
		this.type = type === 'rect' ? 'rect' : 'circle';
		this.texture_key = texture_data.key;
		this.texture_origin = texture_data.origin;				
		this.texture_scale = texture_data.hasOwnProperty('scale') ? texture_data.scale : false;

		this.shape_data = shape_data; //[[x, y, radius_or_width, height_optional]]
		
		if(this.type === 'rect') {
			if(this.shape_data.length < 4) this.shape_data.push(this.shape_data[2]);
			this.shape = new Phaser.Geom.Rectangle(...this.shape_data);
			this.min_x = this.shape.x;
			this.max_x = this.min_x + this.shape.width;
		} else {
			this.shape = new Phaser.Geom.Circle(...this.shape_data);
			let radius = this.shape.radius;
			this.min_x =  this.shape.x - radius;
			this.max_x =  this.shape.x + radius;
		}		
	}
	
	add_image(scene) {
		if(!this.image) {
			this.image = scene.add.image(0, 0, ...this.texture_key).setOrigin(0).setPosition(...this.texture_origin);
			if(this.texture_scale) this.image.setScale(...this.texture_scale);
		}
	}
	
	has_x(x) {
		return (x >= this.min_x && x >= this.max_x);
	}
	
	random_y(x) {
		if(this.type === 'rect') {
			return (this.shape.y + this.shape.height * Math.random());
		} else {
			return this._random_circle_y(x, this.shape);
		}
	}
	
	contains(x, y) {
		return this.shape.contains(x, y);
	}
	
	_random_circle_y(x, circle) {
		let _y = circle.radius * (2 * Math.random() - 1);
		for(let i = 0; i < 3; i++) {
			let y = circle.y + _y;
			if(circle.contains(x, y)) return y;
			_y *= 0.5;
		}
		return circle.y;
		/* //tmp to delete
		let _x = (x - circle.x) / circle.radius;		
		if(Math.abs(_x) > 1) return false;
		let r = Math.random();
		//X = R * Math.cos(t);
		let t = Phaser.Math.PI2 - Math.acos(_x / r);
		let y = r * Math.sin(t);
		console.log(_x, r, t, y);
		return circle.y + (y * circle.radius);
		*/
	}
}

class AutopGenObs {

	constructor(cfg, scene) {
		this.cfg;
		this.setConfig(cfg);
		this.cfggrid2;
		this.cfggrid3;		
		this.sc = scene;
	}
	
	setConfig(cfg) {
		this.cfg = cfg;
	}

	generate(path_objects) {		
		this.cfggrid2 = this.cfg.grid * 2;
		this.cfggrid3 = this.cfg.grid * 3;	
		//return this._gen(this.cfg.gen_obs.type, path_objects, this.cfg.gen_obs);
//		var type = this.cfg.gen_obs.type;
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
		let use_combined_cells = Math.max(...this.cfg.gridCellScales) > 1;
		
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
						if(prev_xy[1] < y) tmpdata.imp.set(prev_xy[2]);
						prev_xy = false;
					}
					continue;
				}
				
				prev_xy = [x, y, [x, y].join('_')];
				tmpdata.x1.set(prev_xy[2]);				
				if(just_collided) {
					if(just_collided[1] < y) tmpdata.imp.set(prev_xy[2]);
					just_collided = false;
				} else if(use_combined_cells && counter_x > 0 && counter_y > 0) {
					this._find_combined_cells(tmpdata, counter_x, counter_y, x, y);
				}
			}
		}
		
		tmpdata.notimp = tmpdata.x1.difference(tmpdata.imp);
		tmpdata.imp.shuffle();
		tmpdata.notimp.shuffle();
		//console.log(tmpdata);//tmp to delete
		return this._gen(tmpdata, opts);
	}
	
	_gen(tmpdata, opts) {
		//% of total cells occupied
		//% of occupied by x1, x2, x3, x4
		//important probability
		let coord2;
		let cells;
		let _added = 0;		
		let out = new AutopMap();
		let occupied = new AutopSet();
		let totalNumCells = tmpdata.x1.size;
		let to_occupy = Math.round(totalNumCells * opts.to_occupy);
		let stats = {};
		opts.gridCellScales.forEach((_v) => {
			stats['x'+_v[0]] = [Math.ceil((to_occupy * _v[1]) / (_v[0] * _v[0])), 0];
		});
		
		let multipliers = opts.gridCellScales.map((_x) => _x[0]);
		
		let imp_size = Math.round(tmpdata.imp.size * opts.imp_probability);		

		['imp', 'notimp'].forEach((_imp) => {
		tmpdata[_imp].iterate((coord) => {
			if(_imp === 'imp' && occupied.intersect(tmpdata.imp).size >= imp_size) return false;
			if(multipliers.length < 1) return false;
			if(occupied.contains(coord)) {
				this._gen_cleanup_cell(tmpdata, coord);
				return true;		
			}
			let m_changed = false;
			let m = Phaser.Math.RND.pick(multipliers);			
			
			if(m > 1 && !tmpdata._all.hasOwnProperty(coord)) {
				m_changed = true;
				m = 1;
			}
			
			if(m > 1) {				
				let _ms = [m];
				multipliers.forEach((_x) => {
					if(_x !== m) _ms.push(_x);
				});
				coord2 = cells = false;
				for(let i = 0; i < _ms.length; i++ ) {
					let _m = _ms[i];
					if(tmpdata._all[coord].hasOwnProperty('x'+_m)) {
						let _cc = this._gen_select_cells(tmpdata, coord, _m, occupied);								
						if(_cc) {
							m = _m;
							coord2 = _cc[0];
							cells = _cc[1];
							break;
						}					
					}
				}
				if(coord2 === false) {
					m_changed = true;
					m = 1;
				}
			}
			//m coord2 cells			
			
			if(m < 2) {
				if(m_changed && multipliers.indexOf(1) === -1) return true;
				occupied.set(coord);
			} else {
				occupied = occupied.union(cells);
			}
			this._gen_cleanup_cell(tmpdata, coord);
			stats['x'+m][1]++;
			if(stats['x'+m][1] >= stats['x'+m][0] && multipliers.indexOf(m) > -1) multipliers.splice(multipliers.indexOf(m), 1);
			let _coord = m > 1 ? coord2 : coord;
			_coord = _coord.split('_').map((_x) => parseInt(_x));
			this._gen_add_obstacle(..._coord, m, out);
			_added++;
			if(multipliers.length < 1) return false;
		});
		});
		
		/*tmpdata.x1.each((x_y) => {
			if(opts.include_all || tmpdata.imp.contains(x_y) || AutopRand.chanceOneIn(opts.chance_multiplier)) {
				_added++;
				let _xy = x_y.split('_').map((_x) => parseInt(_x));
				out.append(_xy[0], new Phaser.Geom.Rectangle(_xy[0], _xy[1], this.cfg.grid, this.cfg.grid));
			}
		});*/
		
		return (_added ? out : false);
	}
	
	_gen_add_obstacle(x, y, multiplier, out) {
		let texture_key;
		let origin;		
		let cdata_func;
		let texture_keys = this.sc.registry.get('obstacle_textures')['x'+multiplier];
		if(Array.isArray(texture_keys)) {
			texture_key = Phaser.Math.RND.pick(texture_keys);
		} else {
			texture_key = texture_keys;
		}
		if(this.cfg.gen_obs.texture_selector !== 'texture' && this.cfg.gen_obs.texture_root !== undefined) {
			texture_key = [this.cfg.gen_obs.texture_root, texture_key];
			cdata_func = 'getFrame';			
		} else {			
			texture_key = [texture_key];
			cdata_func = 'get';			
		}		
		let cdata = this.sc.textures[cdata_func](...texture_key).customData;
		
		let shape_data = cdata.shape_data.concat([]);
		let scale = cdata.hasOwnProperty('scale') ? cdata.scale : false;
		origin = [x, y];
		if(!this.cfg.gridFullCells) {
			if(cdata.offset_x) origin[0] += Math.round(Math.random() * cdata.offset_x);
			if(cdata.offset_y) origin[0] += Math.round(Math.random() * cdata.offset_y);
		}
		shape_data[0] += origin[0];
		shape_data[1] += origin[1];		
		
		let texture_data = {		
			key: texture_key,
			origin: origin,
			scale: scale
		};
		let o = new Obstacle(cdata.type, texture_data, shape_data);		
		for(let i = 1; i <= multiplier; i++) {
			out.append(x + this.cfg.grid * (i - 1), o);			
		}			
	}	
	
	_gen_cleanup_cell(tmpdata, coord) {
		if(!tmpdata._all.hasOwnProperty(coord)) return;		
		for(let _k in tmpdata._all[coord]) {		
			tmpdata._all[coord][_k].forEach((_coord) => {
				if(tmpdata[_k].has(_coord)) tmpdata[_k].delete(_coord);
			});
		}
		delete tmpdata._all[coord];
	}	
	
	_gen_select_cells(tmpdata, coord, multiplier, occupied) {
		let coord2 = false;
		let cells = false;
		while(true) {
			coord2 = Phaser.Math.RND.pick(tmpdata._all[coord]['x'+multiplier]);
			if(tmpdata['x'+multiplier].has(coord2)) {				
				cells = tmpdata['x'+multiplier].get(coord2);
				if(!cells.intersects(occupied)) {
					break;				
				} else {
					tmpdata['x'+multiplier].delete(coord2);
				}
			}
			
			if(tmpdata._all[coord].hasOwnProperty('x'+multiplier)) {
				if(tmpdata._all[coord]['x'+multiplier].indexOf(coord2) > -1) tmpdata._all[coord]['x'+multiplier].splice(tmpdata._all[coord]['x'+multiplier].indexOf(coord2), 1);
			} else {
				coord2 = false;
				break;
			}
			coord2 = false;
			if(!tmpdata._all[coord]['x'+multiplier].length) {
				delete tmpdata._all[coord]['x'+multiplier];
				break;
			}			
		}
		if(!coord2) return false;
		if(tmpdata._all[coord2]['x'+multiplier].indexOf(coord2) > -1) tmpdata._all[coord2]['x'+multiplier].splice(tmpdata._all[coord2]['x'+multiplier].indexOf(coord2), 1);
		tmpdata['x'+multiplier].delete(coord2);
		return [coord2, cells];
	}

	_empty_struct() {
		let out =  {
			x1: (new AutopSet()),
			imp: (new AutopSet()),
			x2: (new AutopMapOfSets()),
			x3: (new AutopMapOfSets()),
			x4: (new AutopMapOfSets()),
			_all: {},
			addall: function(coord, multiplier, coords) {
				coords.forEach((__coord) => {
					if(!this._all.hasOwnProperty(__coord)) this._all[__coord] = {};
					if(!this._all[__coord].hasOwnProperty(multiplier)) this._all[__coord][multiplier] = [];				
					this._all[__coord][multiplier].push(coord);
				});				
			}
		};
		out.addall.bind(out);
		return out;		
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
			tmpdata.addall(_2check[0], 'x2', _2check); 
			if(counter_x > 1 && counter_y > 1) {
				let _3check = [[x - this.cfggrid2, y].join('_'), [x, y - this.cfggrid2].join('_')];
				let _3key = [x - this.cfggrid2, y - this.cfggrid2].join('_');
				if(tmpdata.x2.has(_3key) && tmpdata.x1.containsArray(_3check)) {
					tmpdata.x3.set(_3key, tmpdata.x2.get(_2check[0]).union(tmpdata.x2.get(_3key)).set(_3check[0]).set(_3check[1]));
					tmpdata.addall(_3key, 'x3', tmpdata.x3.get(_3key).getArray()); 
					if(counter_x > 2 && counter_y > 2) {
						let _4check = [[x - this.cfggrid3, y].join('_'), [x, y - this.cfggrid3].join('_')];
						let _4key = [x - this.cfggrid3, y - this.cfggrid3].join('_');
						if(tmpdata.x3.has(_4key) && tmpdata.x1.containsArray(_4check)) {
							tmpdata.x4.set(_4key, tmpdata.x3.get(_3key).union(tmpdata.x3.get(_4key)).set(_4check[0]).set(_4check[1]));
							tmpdata.addall(_4key, 'x4', tmpdata.x4.get(_4key).getArray()); 
						}
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
				} else if(use_combined_cells && counter_x > 0 && counter_y > 0) {
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
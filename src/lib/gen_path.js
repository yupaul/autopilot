import AutopRand from '../util/autoprand';
import AutopPointsPath from './points_path';

class AutopGenPath {

	constructor(cfg) {					
		this.cfg;
		this.generate_path_config;
		this.setConfig(cfg);		
		this.setGpConfig();
	}
	
	setConfig(cfg) {
		this.cfg = cfg;		
		return this;
	}
	
	setGpConfig(config) {		
		if(Phaser.Utils.Objects.IsPlainObject(config)) {
			this.generate_path_config = Phaser.Utils.Objects.Merge(Phaser.Utils.Objects.Extend(true, {}, config), this.cfg.gen_path);
		} else {
			this.generate_path_config = this.cfg.gen_path;
		}
		return this;
	}
}


export class AutopGenPathW extends AutopGenPath {

	constructor(cfg) {
		super(cfg);
	}
	
	_gp_prepare_random(start, path, prev_tail, first_x, path_x_length, is_first) {
		var max_x, next_y_section, avg_x, softmax_parts, next_x;			
		let cfg = this.generate_path_config;
		let sections = [];		
		let last_xy = is_first ? path[path.length - 1] : start[start.length - 1];
		
		if(!path_x_length) {			
			path_x_length = AutopRand.randint(cfg.min_path_x_length, cfg.max_path_x_length);		
		}			
				
		let num_segments = AutopRand.randint(...cfg.min_max_segments);		
		if(is_first) --num_segments;			
		
		max_x = first_x + path_x_length;
		
		if(cfg.next_x_method === 'softmax') {
			avg_x = Math.round(path_x_length / num_segments);
			softmax_parts = AutopRand.softmax(num_segments);
		}		
		
		let current_y_section = Math.floor(last_xy[1] / cfg.scale_y_length);		
		
		for(let _i = 0; _i < num_segments; _i++) {
			sections.push(current_y_section);
			let section_jump = AutopRand.randint(0, AutopRand.chanceOneIn(cfg.big_jump_probability) ? cfg.scale_y : Math.round(cfg.scale_y * cfg.small_jump_coeff));

			next_y_section = false;
			if(section_jump > 0) {
				let _avail_jump_plus = cfg.scale_y - current_y_section;
				if(current_y_section >= section_jump) {
					if(_avail_jump_plus >= section_jump && AutopRand.coinflip()) {
						next_y_section = current_y_section + section_jump;
					} else {
						next_y_section = current_y_section - section_jump;
					}
				}
				if(next_y_section === false && _avail_jump_plus >= section_jump) next_y_section = current_y_section + section_jump;				
				if(next_y_section === false) next_y_section = AutopRand.coinflip() ? 0 : cfg.scale_y;
			} else {
				next_y_section = current_y_section;
			}
			let next_y = cfg.scale_y_length_r * next_y_section + AutopRand.randint(0, cfg.scale_y_length_r) + cfg.min_y;
			
			if(_i === (num_segments - 1)) {
				next_x = max_x;
			} else {
				let _min_x = 0;
				let __y_diff = Math.abs(next_y - last_xy[1]);			
				if(__y_diff < cfg.min_segment_length) _min_x = Math.round(Math.sqrt(cfg.min_segment_length_sq  - __y_diff * __y_diff));						

				if(cfg.next_x_method !== 'softmax') avg_x = Math.round(Math.abs(path_x_length - last_xy[0] + first_x) / (num_segments - _i));

				if(avg_x < _min_x) {
					next_x = last_xy[0] + _min_x;
				} else {
					if(cfg.next_x_method === 'softmax') {
						next_x = last_xy[0] + path_x_length * softmax_parts[_i];
					} else if(cfg.next_x_method === 'minmax') {
						next_x = last_xy[0] + (Math.random() * (cfg.minmax_method_min_max[1] - cfg.minmax_method_min_max[0]) + cfg.minmax_method_min_max[0]) * avg_x;					
					} else {
						next_x = last_xy[0] + AutopRand.randint(_min_x, avg_x * (AutopRand.chanceOneIn(cfg.long_short_probability) ? cfg.long_multiplier : 1));
					}
				}
				if(next_x > (max_x - cfg.min_segment_length)) {
					if((max_x - last_xy[0]) > (cfg.min_segment_length * 2)) {
						next_x = Math.round(last_xy[0] + (max_x - last_xy[0]) / (num_segments - _i));
					} else {
						next_x = max_x;
					}
				}
			}
			next_x = Math.round(next_x);			
			next_y = Math.round(next_y);
			path.push([next_x, next_y]);			
			last_xy = [next_x, next_y];
			current_y_section = next_y_section;		
			if(next_x >= max_x) break;
		}		
	
		return {
			path_x_length: path_x_length,
			path: path,
			sections: sections
		}
	}

	_gp_prepare_same(pathobj) {		
		return {
			path_x_length: pathobj.path_x_length,
			path: pathobj.path.concat([]),
			sections: pathobj.sections.concat([])			
		}	
	}
	
	_gp_prepare_similar(start, pathobj, sim_degree) {		
		let next_y_section;
		let path = [];
		let prev_tail = pathobj.prev_tail;
		let path_x_length = pathobj.path_x_length;
		let first_x = start[start.length - 1][0];
		let last_xy = start[start.length - 1];
		let cfg = this.generate_path_config;
		let sections = [];				
		
		let num_segments = pathobj.sections.length;
		let max_x = first_x + path_x_length;		
		let current_y_section = Math.floor(last_xy[1] / cfg.scale_y_length);		
		
		let x_sub = pathobj.path[0][0];
		let xs = pathobj.path.map((__x) => {return (__x[0] - first_x);});
		//Phaser.Utils.Array.Shuffle(xs);//tmp

		for(let _i = 0; _i < num_segments; _i++) {
			sections.push(current_y_section);
			if((_i + 1) < num_segments) {
				let _next_section_o = pathobj.sections[_i + 1];				
				if(_next_section_o == current_y_section) {
					let _range = [];
					for(let _i2 = 1; _i2 <= cfg.scale_y; _i2++) {
						if(_i2 !== current_y_section) _range.push(_i2);
					}
					Phaser.Utils.Array.Shuffle(_range);
					next_y_section = _range[0];
				} else {					
					next_y_section = Math.min(Math.max(current_y_section - _next_section_o, 1), cfg.scale_y);
				}
				
			}
			let next_y = Math.round(cfg.scale_y_length_r * next_y_section + AutopRand.randint(0, cfg.scale_y_length_r) + cfg.min_y);						
			let next_x = Math.round(last_xy[0] + xs[_i]);			
			
			path.push([next_x, next_y]);			
			last_xy = [next_x, next_y];
			current_y_section = next_y_section;		
			if(next_x >= max_x) break;
		}				
		
		return {
			path_x_length: path_x_length,
			path: path,
			sections: sections
		}		
	}	
	
	generate_path(start, obstacles, path_x_length, config, similar) {
		//path prev_tail first_x sections
		//obstacles start new_path_x_length path_x_length
		//args: _start path prev_tail first_x path_x_length
		//return path, sections
		
		var path, prev_tail, first_x, _pathobj;		
		
		if(config) this.setGpConfig(config);
		let cfg = this.generate_path_config;			
		
		var _start = start === undefined ? false : start;	
		var is_first = !_start;		
		var new_path_x_length = !path_x_length;
		
		if(!is_first) {		
			if(!similar || !Phaser.Utils.Objects.IsPlainObject(similar) || !similar.hasOwnProperty('value') || similar.value === 0.5) similar = false;	
			path = [];
			prev_tail = _start;						
			first_x = _start[_start.length - 1][0];			
		} else {
			similar = false;
			let __line_length = AutopRand.randint(...cfg.first_line_length);
			_start = [[cfg.start_x, cfg.start_y], [cfg.start_x + Math.round(__line_length * 0.5), cfg.start_y], [cfg.start_x + __line_length, cfg.start_y]];
			path = _start;
			prev_tail = false;			
			first_x = _start[0][0];			
		}		
		
		if(similar) {
			if(similar.value >= 1) {
				_pathobj = this._gp_prepare_same(similar.path);
			} else {				
				_pathobj = this._gp_prepare_similar(_start, similar.path, similar.value);
			}
		} else {
			_pathobj = this._gp_prepare_random(_start, path, prev_tail, first_x, path_x_length, is_first);
		}
		path = _pathobj.path;
		let sections = _pathobj.sections;
		if(_pathobj.hasOwnProperty('path_x_length')) path_x_length = _pathobj.path_x_length;		
		
		if(obstacles && !this._gp_intersect_obstacles(path, obstacles)) return this.generate_path(start, obstacles, (new_path_x_length ? false : path_x_length))
		
		let points = this._gp_add_points(path, prev_tail, first_x, path_x_length);
		if(!points) return this.generate_path(start, obstacles, (new_path_x_length ? false : path_x_length));
		
		return {
			path: path,
			path_x_length: path_x_length,
			tail: [path[path.length - 3], path[path.length - 2], path[path.length - 1]],
			prev_tail: prev_tail,
			sections: sections,
			points: points,
			is_correct: !obstacles
		}
	} 	
	
	_gp_add_points(path, prev_tail, first_x, path_x_length) {
		let _prev_tail = prev_tail === false ? [] : prev_tail;
		let spline = new Phaser.Curves.Spline(_prev_tail.concat(path));
		spline.arcLengthDivisions = path_x_length;		
		let _length = Math.floor(spline.getLength());
		let spoints = this.generate_path_config.spaced_points ? spline.getSpacedPoints(_length) : spline.getPoints(_length);
		
		let points = new AutopPointsPath();		
		let _adding = false;
		for(let i = 0; i < spoints.length; i++) {
			let _p = spoints[i];
			if(_adding) {
				if(_p.y < 0 || _p.y > this.cfg.heightField) return false;
				points.addPoint(_p);
			} else {
				if(_p.x > first_x) {
					_adding = true;	
					if(_p.y < 0 || _p.y > this.cfg.heightField) return false;
					points.addPoint(_p);
				}
			}
		}			
		points.makeRtree(this.cfg.rtreeOffset, this.cfg.grid);
		return points;
	}
	
	_gp_intersect_obstacles(path, obstacles) {
		let intersected_wo = false;
		for(let i = (path.length - 1); i >= 0; i--) {
			let p = path[i];
			let _x = Phaser.Math.Snap.Floor(p[0], this.cfg.grid);
			let _ys = obstacles.get(_x);
				
			if(_ys) {			
				for(let i2 = 0; i2 < _ys.length; i2++) {
					if(_ys[i2].contains(p[0], p[1])) {
						intersected_wo = true;
						break;
					}
				}				
			}
			if(intersected_wo) break;
		}		
		if(!intersected_wo) {
		for(let _m = 1; _m <= this.generate_path_config.scale_y; _m++) {
			let _min_y = new Phaser.Structs.Map();
			for(let i = (path.length - 1); i >= 0; i--) {
				let p = path[i];
				let _x = Phaser.Math.Snap.Floor(p[0], this.cfg.grid);
				let _ys = obstacles.get(_x);				
				if(_ys) {						
					for(let i2 = 0; i2 < _ys.length; i2++) {
						if(!_ys[i2].full_cell && !_ys[i2].has_x(p[0])) continue;
						let oy = _ys[i2].random_y(p[0]);
						let _d = Math.abs(p[1] - oy);
						if(_d <= this.generate_path_config.scale_y_length_r * _m) {
							if(!_min_y.has(i)) {
								_min_y.set(i, [i2, _d, oy]);
							} else if(_d < _min_y.get(i)[1]) {
								_min_y.get(i)[0] = i2;
								_min_y.get(i)[1] = _d;
								_min_y.get(i)[2] = oy;
							}
						}
					}				
				}
			}			
			let _min_y_i = _min_y.keys();			
			if(_min_y_i.length > 0) {
				Phaser.Utils.Array.Shuffle(_min_y_i);
				let i = _min_y_i[0];
				//path[i][1] = _min_y.get(i)[2] + AutopRand.randint(1, this.cfg.grid);
				path[i][1] = _min_y.get(i)[2];
				intersected_wo = true;
				break;
			}			
		}
		}
		return intersected_wo;
	}

	minipath(minipath, points, btn, texture_name, styles_add, scene) {
		let minipath_xy, coeff_y;
		let min_xy = points.findExtrem().min_y;
		let _points = points.movePoints(-points.getZeroX(), -min_xy);
		let _bounds = Phaser.Geom.Rectangle.FromPoints(_points);
		minipath.strokePoints(_points);		
		if(styles_add) {
			styles_add.forEach((_style) => {
				minipath.lineStyle(..._style);	
				minipath.strokePoints(_points);
			});
		}
		let minipath_wh = [Math.ceil(_bounds.width), Math.ceil(_bounds.height)];
		minipath.generateTexture(texture_name, ...minipath_wh);

		let __bounds = btn.bounds_internal ? btn.bounds_internal : btn.bounds;
		let coeff_xy = (__bounds.x2 - __bounds.x1 - this.cfg.gen_path.minipath_offset * 2) / minipath_wh[0];	
		min_xy = Math.max(min_xy, 0);
		
		let __height = (min_xy + minipath_wh[1]) * coeff_xy;
		let __max_xy = __bounds.y2 - __bounds.y1 - this.cfg.gen_path.minipath_offset * 2;
		if(__height > __max_xy) {
//			coeff_y = __max_xy / (min_xy + minipath_wh[1]);
			coeff_y = coeff_xy * (__max_xy / __height);
		} else {
			coeff_y = coeff_xy;			
		}
		/*//tmp to delete
		let c = {min_xy: min_xy, __height: __height, minipath_wh: minipath_wh, coeff_xy:coeff_xy, __max_xy: __max_xy, coeff_y: coeff_y, minipath_xy: min_xy * coeff_y}
		for(let __k in c) {
			console.log(__k+': '+c[__k]);
		}
		//tmp end */
		let coeff_x = coeff_xy;
		minipath_xy = min_xy * coeff_y;
		return scene.add.image(0, 0, texture_name).setScale(coeff_x, coeff_y).setOrigin(0).setPosition(__bounds.x1 + this.cfg.gen_path.minipath_offset, __bounds.y1 + Math.max(minipath_xy, this.cfg.gen_path.minipath_offset));
	}


}


export class AutopGenPathH extends AutopGenPath {

	constructor(cfg) {
		super(cfg);
	}

	minipath(minipath, points, btn, texture_name, styles_add, scene) {
		let minipath_xy, coeff_x;
		let min_xy = points.findExtrem().min_x;
		let _points = points.movePoints(-min_xy, -points.getZeroY());
		let _bounds = Phaser.Geom.Rectangle.FromPoints(_points);
		minipath.strokePoints(_points);		
		let minipath_wh = [Math.ceil(_bounds.width), Math.ceil(_bounds.height)];
		minipath.generateTexture(texture_name, ...minipath_wh);

		let __bounds = btn.bounds;
		let coeff_xy = (__bounds.y2 - __bounds.y1 - this.cfg.gen_path.minipath_offset * 2) / minipath_wh[1];	
		min_xy = Math.max(min_xy, 0);
		
		let __height = (min_xy + minipath_wh[0]) * coeff_xy;
		let __max_xy = __bounds.x2 - __bounds.x1 - this.cfg.gen_path.minipath_offset * 2;
		if(__height > __max_xy) {
			coeff_x = __max_xy / (min_xy + minipath_wh[0]);
		} else {
			coeff_x = coeff_xy;			
		}
		let coeff_y = coeff_xy;
		minipath_xy = min_xy * coeff_x;
		return scene.add.image(0, 0, texture_name).setScale(coeff_x, coeff_y).setOrigin(0).setPosition(__bounds.x1 + Math.max(minipath_xy, this.cfg.gen_path.minipath_offset), __bounds.y1 + this.cfg.gen_path.minipath_offset);
	}

}


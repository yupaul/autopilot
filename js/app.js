var AutopCFG = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'game_div',
    scene: {
        preload: preload,
        create: create,
		update: update
    },
	//other
	custom: {
		revertWidthHeight: false,
		playerFillStyle: 0x0000ff,
		playerTrianglePoints: [0,0,0,30,15,15],
		playerWidthHeight: [30, 30],		
		playerNumBodyParts: 150,
		playerBodyEaSteps: 11,
		speed: 105,
		speedUp: 5,
		cameraOffset: 0.2,
		start_x: 10,
		heightControlsRate: 0.2,
		pathLength: 0.5,
		gridCellLineStyle: [1, 0xffffff, 1],
		gridCellFillStyle: 0x000000,
		gridCellTextureName: 'grid_cell',
		
		showPathStyle: [1, 0x919191, 0.05],		
		showPathSubSet: 15,
		showPathRadius: 5,
		showPaths: true,//tmp
		
		randomizeButtons: true, //tmp
		gameOver: true, //tmp
		wallWidth: 15,
		wallStyle: 0xAB2121,
		wallOpenAlpha: 0.1,
		wallTextureName: 'wall',
		buttonEnableDelay: [600, 1000],
		rtreeCoeff: 1.2,
		gen_path: {
			path_x_spread: 0.1,
			scale_y: 6,
			long_short_probability: 3,			
			long_multiplier: 2,
			big_jump_probability: 7,
			small_jump_coeff: 0.35,
			min_max_segments: [4, 6],
			first_line_length: [60, 120],
			next_x_method: 'longshort', //'softmax', 'minmax', 'longshort'
			minmax_method_min_max: [0.35, 1.75]
		},
		controls: {
			separator_line_style: [3, 0xff0000, 1],
			button_bounds_style: [4, 0x890021, 1],
			button_path_style: [20, 0xff0000, 1],
			button_height: 0.9,
			button_gap: 50,
			button_disabled_alpha: 0.25
		}
	}
};

///////////////////////////////////

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
	
	getPointsRects(offset, grid_size) {		
		let out = [];
		let next_grid_x_, next_grid_x = false;
		for(let i = 0; i < this.points.length; i++) {			
			if(grid_size) {
				next_grid_x_ = next_grid_x;
				if(next_grid_x) {
					if(this.points[i].x > next_grid_x) next_grid_x_ += grid_size;
				} else {
					next_grid_x_ = Phaser.Math.Snap.Floor(this.points[i].x, grid_size);
				}
				if(next_grid_x !== next_grid_x_) {					
					next_grid_x = next_grid_x_;
					this.grid.set(i, [next_grid_x, Phaser.Math.Snap.Floor(this.points[i].y, grid_size)].join('_'));					
				}
			}
			let offset2 = offset * 2;
			let _d = 0;
			let offsets = {minX: offset, minY: offset,
			maxX: offset, maxY: offset};
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
	
	makeRtree(offset, grid_size) {
		if(grid_size === undefined) grid_size = 0;
		this.rtree.load(this.getPointsRects(offset, grid_size));
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
	
	addPoint(p) {
		//p.x = Math.round(p.x);
		//p.y = Math.round(p.y);
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
}

var AutopLIB = {
	sc: false,
	cfg: AutopCFG.custom,
	config_preprocess: function(rwh, _w, _h) {
		this.cfg._cameraOffset = Math.round(this.sc.game.config[_w] * this.cfg.cameraOffset);
		this.cfg.heightControls = Math.round(this.sc.game.config.height * this.cfg.heightControlsRate);
		this.cfg.heightField = this.sc.game.config.height - this.cfg.heightControls;
	
		this.cfg.grid = (this.cfg.playerWidthHeight[0] + this.cfg.playerWidthHeight[1]);
		this.cfg.rtreeOffset = Math.round((this.cfg.playerWidthHeight[0] + this.cfg.playerWidthHeight[1]) * this.cfg.rtreeCoeff);
		
		this.cfg.gen_path.start_x = this.cfg.start_x;
		this.cfg.gen_path.min_y = this.cfg.playerWidthHeight[1];
		this.cfg.gen_path.start_y = Math.round(this.cfg.heightField * 0.5 + this.cfg.gen_path.min_y);		
		this.cfg.gen_path.max_y = (rwh ? this.sc.game.config[_h] : this.cfg.heightField) - this.cfg.gen_path.min_y;
		this.cfg.gen_path.scale_y_length = (this.cfg.gen_path.max_y - this.cfg.gen_path.min_y) / (this.cfg.gen_path.scale_y + 1);
		this.cfg.gen_path.min_path_x_length = Math.round(this.sc.game.config[_w] * 0.5 - this.sc.game.config[_w] * this.cfg.gen_path.path_x_spread);
		this.cfg.gen_path.max_path_x_length = Math.round(this.sc.game.config[_w] * 0.5 + this.sc.game.config[_w] * this.cfg.gen_path.path_x_spread);
		this.cfg.gen_path.min_segment_length = this.cfg.playerWidthHeight[0] + this.cfg.playerWidthHeight[1];
		this.cfg.gen_path.rwh = rwh;
		this.cfg.gen_path.screen_length = this.sc.game.config[_w];
	},
	
	camera_follow(player) {
		if(!this.cfg.revertWidthHeight) {
			if(player.x > this.cfg._cameraOffset) {
				let _p = Math.round(player.x) - this.cfg._cameraOffset;
				if(_p > this.sc.cameras.main.scrollX) this.sc.cameras.main.setScroll(_p, 0);
			}
		} else {
			if(player.y > (this.sc.game.config.height - this.cfg._cameraOffset)) {
				let _p = Math.round(player.y) + this.cfg._cameraOffset;
				if(_p < this.sc.cameras.main.scrollY) this.sc.cameras.main.setScroll(0, _p);
			}	
		}
	},
	
	player_update(player) {
		let _k = Phaser.Math.Snap.Floor(player.x, this.cfg.grid);
		let _rects = this.sc.registry.get('obstacles').get(_k);
		if(_rects && _rects.length > 0) {
			for(let _i = 0; _i < _rects.length; _i++) {
				if(_rects[_i].contains(player.x, player.y)) {
					player.stop();
					this.gameover();
					return false;
				}
			}
		}
		
		if(!this.sc.registry.has('player_xy')) {
			this.sc.registry.set('player_xy', [player.x, player.y]);
		} else if(player.x !== this.sc.registry.get('player_xy')[0] || player.y !== this.sc.registry.get('player_xy')[1]) {		
			Phaser.Actions.ShiftPosition(this.sc.registry.get('player_body_group').getChildren(), ...this.sc.registry.get('player_xy'));
			this.sc.registry.get('player_xy')[0] = player.x;
			this.sc.registry.get('player_xy')[1] = player.y;
		}
		return true;
	},
	
	show_path(path_object) {
		if(!this.cfg.showPaths) return;
		let gr = this.sc.add.graphics();
		
		//gr.lineStyle(...this.cfg.showPathStyle);
		//gr.strokePoints(path_object.points.getPoints());
		/*let points1 = path_object.points.movePoints(0, this.cfg.playerWidthHeight[1]);
		let points2 = path_object.points.movePoints(0, -this.cfg.playerWidthHeight[1]);
		gr.strokePoints(points1);
		gr.strokePoints(points2);*/
		gr.fillStyle(this.cfg.showPathStyle[1], this.cfg.showPathStyle[2]);
		let points = path_object.points.getPointsSubSet(this.cfg.showPathSubSet);
		for(let i = 0; i < points.length; i++) {
			gr.fillCircle(points[i].x, points[i].y, this.cfg.showPathRadius);
		}
	},
	
	
multipath_follower: function(config, texture) {	
	let _p = this.sc.registry.get('paths').shift();
	let _clen0 = _p.getCurveLengths();
	config.duration = Math.round((_clen0[_clen0.length - 1] / this.cfg.speed) * 1000);
    let _player = this.sc.add.follower(_p, 0, 0, texture);		
	
	config.onComplete = () => {
			let _path = this.sc.registry.get('paths').shift();			
			if(_path === undefined) {
				this.gameover();
				return;
			}
			let _clen = _path.getCurveLengths();
			config.duration = Math.round((_clen[_clen.length - 1] / this.cfg.speed) * 1000);
			_player.setPath(_path, config);
			_player.setRotateToPath(true, config.rotationOffset, config.verticalAdjust);	
			if(this.cfg.speedUp) this.cfg.speed += this.cfg.speedUp;	
			if(!this.cfg._buttons_enabled && this.cfg._correct_selected) this.controls_buttons_enable();
		},
	config.onCompleteScope = this.sc;	
	
    _player.start(config);
	_player.setRotateToPath(true, config.rotationOffset, config.verticalAdjust);	
	this.cfg._pause_scheduled = true;	
	return _player;	
},

	controls_make_buttons : function() {		
		let button_width = Math.round(this.sc.game.config.width * this.cfg.heightControlsRate * this.cfg.pathLength * this.cfg.controls.button_height);
		let button_height = Math.round(this.sc.game.config.height * (1 - this.cfg.heightControlsRate) * this.cfg.heightControlsRate * this.cfg.controls.button_height);
		
		let position = [
			Math.round(this.sc.game.config.width * 0.5 - this.cfg.controls.button_gap - button_width * 0.5), 
			Math.round(this.sc.game.config.height - this.cfg.heightControls * 0.5)
		];
		
		var grs_rect = this.sc.make.graphics();
		grs_rect.lineStyle(...this.cfg.controls.button_bounds_style);
		grs_rect.strokeRect(0, 0, button_width, button_height).generateTexture('button_bounds', button_width, button_height); 
		this.sc.registry.get('buttons').push({button: this.sc.add.image(0, 0, 'button_bounds').setPosition(...position).setInteractive()});
		position[0] = Math.round(this.sc.game.config.width * 0.5 + this.cfg.controls.button_gap + button_width * 0.5);
		this.sc.registry.get('buttons').push({button: this.sc.add.image(0, 0, 'button_bounds').setPosition(...position).setInteractive().setVisible(false)});	
		
		for(let i = 0; i < this.sc.registry.get('buttons').length; i++) {
			let __bounds = this.sc.registry.get('buttons')[i].button.getBounds();
			this.sc.registry.get('buttons')[i].bounds = {
				x1 : __bounds.x,
				x2 : __bounds.x + __bounds.width,
				y1 : __bounds.y,
				y2 : __bounds.y + __bounds.height,
			};		
		}		
	},
	
	controls_make: function() {		
		var gr_separator_line = this.sc.add.graphics();
		gr_separator_line.lineStyle(...this.cfg.controls.separator_line_style);	
		let _l = new Phaser.Curves.Line([0, this.cfg.heightField + 1, this.sc.game.config.width + 1, this.cfg.heightField + 1]);
		_l.draw(gr_separator_line, this.sc.game.config.width + 1);		
	},
	
	grid_cell_make: function() {
		var grs_rect = this.sc.make.graphics();
		grs_rect.lineStyle(...this.cfg.gridCellLineStyle);1, 0xffffff, 1
		grs_rect.fillStyle(this.cfg.gridCellFillStyle);
		grs_rect.fillRect(0, 0, this.cfg.grid, this.cfg.grid).strokeRect(0, 0, this.cfg.grid, this.cfg.grid).generateTexture(this.cfg.gridCellTextureName, this.cfg.grid, this.cfg.grid); 
	},

	wall_make: function() {
		var grs_rect = this.sc.make.graphics();		
		grs_rect.fillStyle(this.cfg.wallStyle);
		grs_rect.fillRect(0, 0, this.cfg.wallWidth, this.cfg.heightField).generateTexture(this.cfg.wallTextureName, this.cfg.wallWidth, this.cfg.heightField); 
	},	
	
	controls_buttons_enable: function() {
		let _this = this;
		this.sc.time.addEvent({delay: AutopRand.randint(...this.cfg.buttonEnableDelay), callback: function() {
			_this.cfg._buttons_enabled = true;
			let _pos = _this.sc.registry.get('path_objects')[0];
			let btn_order = [0, 1];
			if(_this.cfg.randomizeButtons && AutopRand.coinflip()) btn_order.reverse();
			for(let _i = 0; _i < _pos.length; _i++) {
				_this.controls_set_path(_pos[_i].points, btn_order[_i], !_i);
			}
		}, callbackScope: this});		
	},
	
	controls_on_click: function(event) {
		if(!this.cfg._buttons_enabled) return;
		let buttons = this.sc.registry.get('buttons');		
		for(let i = 0; i < buttons.length; i++) {
			if(!buttons[i].button.visible) continue;
			if(event.x > buttons[i].bounds.x1 && event.y > buttons[i].bounds.y1 && event.x < buttons[i].bounds.x2 && event.y < buttons[i].bounds.y2) {
				let player = this.sc.registry.get('player');
				if(!player.isFollowing()) player.resume();
				if(this.cfg._just_started) {
					this.cfg._just_started = false;
					this.cfg._correct_selected = true;
					for(let i2 = 0; i2 < buttons.length; i2++) {
						if(!buttons[i2].button.visible) buttons[i2].button.visible = true;
					}					
					this.controls_buttons_enable();
				} else {
					this.cfg._correct_selected = buttons[i].is_correct;
					let _all_pos = this.sc.registry.get('path_objects');
					let _pos = _all_pos.shift();						
					let _pos_i = this.cfg._correct_selected ? 0 : 1;
					let _wall = this.sc.registry.get('walls').shift();
					if(_wall) _wall.setAlpha(this.cfg.wallOpenAlpha);
					if(_pos[_pos_i].wall !== undefined) this.sc.registry.get('walls').push(_pos[_pos_i].wall);
					this.sc.registry.get('paths').push(_pos[_pos_i].points);
					AutopLIB.show_path(_pos[_pos_i]);
					
					if(this.cfg._correct_selected) {						
						let prev_tail = _all_pos[_all_pos.length - 1][0].tail;
						let pobj_correct = AutopLIB.generate_path(prev_tail);		
						pobj_correct.wall = this.sc.add.image(Math.round(pobj_correct.points.getEndPoint().x), 0, this.cfg.wallTextureName).setOrigin(0);
						let obs = AutopLIB.generate_obstacles(pobj_correct);
						let pobj_wrong;
						while(true) {
							pobj_wrong = AutopLIB.generate_path(prev_tail, obs);
							if(pobj_wrong !== false) break;
						}
						this.sc.registry.get('obstacles').merge(obs, true);
						this.sc.registry.get('path_objects').push([pobj_correct, pobj_wrong]);							
					}
				}				
				for(let _i2 = 0; _i2 < buttons.length; ++_i2) {
					if(buttons[_i2].path !== undefined) buttons[_i2].path.setAlpha(this.cfg.controls.button_disabled_alpha);		
				}				
				this.cfg._buttons_enabled = false;				
			}
		}		
		
	},
	
	controls_set_path(points, button_index, is_correct) {
		if(is_correct === undefined) {
			is_correct = false;
		} else {
			is_correct = !!is_correct;
		}
		var texture_name;
		var grs = this.sc.make.graphics();
		while(true) {
			texture_name = '_grs'+((Math.random() * 1000000) | 0);
			if(!this.sc.sys.textures.exists(texture_name)) break;
		}
		grs.lineStyle(...this.cfg.controls.button_path_style);	
		grs.strokePoints(points.movePointsToZeroX());		
		grs.generateTexture(texture_name);
		let _plen = points.getLengthX();
		let btn = this.sc.registry.get('buttons')[button_index];
		if(btn.path !== undefined && btn.path instanceof Phaser.GameObjects.Image && btn.path.active) btn.path.destroy();
		let __bounds = btn.bounds;
		let __coeff = (__bounds.x2 - __bounds.x1 - 8) / _plen;	
		btn.path = this.sc.add.image(0, 0, texture_name).setScale(__coeff).setOrigin(0).setPosition(__bounds.x1 + 2, __bounds.y1);		
		btn.is_correct = is_correct;
	},
	
	player_make: function() {		
		var _player_graphics = this.sc.make.graphics();
		_player_graphics.fillStyle(this.cfg.playerFillStyle).fillTriangle(...this.cfg.playerTrianglePoints).generateTexture('player', ...this.cfg.playerWidthHeight);
	},
	
	player_body_make: function() {		
		var gr = this.sc.make.graphics();
		let radius = Math.round(this.cfg.playerWidthHeight[0] * 0.5);
		gr.fillStyle(this.cfg.playerFillStyle).fillCircle(0, 0, radius).generateTexture('player_body', radius, radius);
		let g = this.sc.add.group({key: 'player_body', frameQuantity: this.cfg.playerNumBodyParts });
		for(let i = 0; i < g.getChildren().length; i++) {
			g.getChildren()[i].setAlpha(Phaser.Math.Easing.Stepped(i / g.getChildren().length, this.cfg.playerBodyEaSteps)); 
		}
		this.sc.registry.set('player_body_group', g);
	},	
	
	generate_obstacles: function(path_object) {
		let out = new Phaser.Structs.Map();
		let _pcoords = path_object.points.grid.values();
		let min_x = parseInt(_pcoords[0].split('_')[0]);
		let max_x = parseInt(_pcoords[_pcoords.length - 1].split('_')[0]);
		let min_y = 0;
		let max_y = Phaser.Math.Snap.Floor(this.cfg.heightField, this.cfg.grid);
		for(let x = min_x; x < (max_x - this.cfg.grid); x += this.cfg.grid) {
			for(let y = min_y; y < max_y; y += this.cfg.grid) {
				if(_pcoords.indexOf([x, y].join('_')) == -1 && !path_object.points.rtree.collides({minX: x, maxX: x + this.cfg.grid, minY: y, maxY: y + this.cfg.grid})) {
					this.sc.add.image(0, 0, this.cfg.gridCellTextureName).setOrigin(0).setPosition(x, y);
					let rect = new Phaser.Geom.Rectangle(x, y, this.cfg.grid, this.cfg.grid);
					if(!out.has(x)) {
						out.set(x, [rect]);
					} else {
						out.get(x).push(rect);
					}
				}
			}
		}
		return out;
	},
	
	generate_path: function(start, obstacles) {
		let cfg = this.cfg.gen_path;
		var is_first, path, first_xy, max_x, last_xy, next_y_section, avg_x, softmax_parts;
		
		var scale_y_length_r = Math.round(cfg.scale_y_length);
		var min_segment_length_sq = cfg.min_segment_length * cfg.min_segment_length;
		
		var path, prev_tail, sections = [], tail = [];
		var intersected_wo = false;
		var points = new AutopPointsPath();		
		
		if(start === undefined || !start) {
			is_first = true;
			let __line_length = AutopRand.randint(...cfg.first_line_length);
			start = [[cfg.start_x, cfg.start_y], [cfg.start_x + Math.round(__line_length * 0.5), cfg.start_y], [cfg.start_x + __line_length, cfg.start_y]];
			path = start;
			prev_tail = false;
		} else {
			is_first = false;
			path = [];
			prev_tail = start;
		}
		let num_segments = AutopRand.randint(...cfg.min_max_segments);
		let path_x_length = AutopRand.randint(cfg.min_path_x_length, cfg.max_path_x_length);		
		
		if(path.length > 0) { //is_first
			--num_segments;			
			last_xy = path[path.length - 1];			
			first_xy = start[0];
		} else {			
			last_xy = start[start.length - 1];
			first_xy = [last_xy[0], last_xy[1]];
		}
		max_x = first_xy[0] + path_x_length;
		
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
			let next_y = scale_y_length_r * next_y_section + AutopRand.randint(0, scale_y_length_r) + cfg.min_y;
			
			if(_i === (num_segments - 1)) {
				next_x = max_x;
			} else {
				let _min_x = 0;
				let __y_diff = Math.abs(next_y - last_xy[1]);			
				if(__y_diff < cfg.min_segment_length) _min_x = Math.round(Math.sqrt(min_segment_length_sq  - __y_diff * __y_diff));						

				if(cfg.next_x_method !== 'softmax') avg_x = Math.round(Math.abs(path_x_length - last_xy[0] + first_xy[0]) / (num_segments - _i));

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
				if(next_x > max_x) {
					if((max_x - last_xy[0]) > cfg.min_segment_length) {
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
		
		if(obstacles) {
			for(let i = (path.length - 1); i >= 0; i--) {
				let p = path[i];
				let _x = Phaser.Math.Snap.Floor(p[0], this.cfg.grid);
				let _ys = obstacles.get(_x);
				
				if(_ys) {			
					for(i2 = 0; i2 < _ys.length; i2++) {
						if(_ys[i2].contains(p[0], p[1])) {
							intersected_wo = true;
							break;
						}
					}				
				}
				if(intersected_wo) break;
			}			
			if(!intersected_wo) {				
				let _min_y = new Phaser.Structs.Map();
				for(let i = (path.length - 1); i >= 0; i--) {
					let p = path[i];
					let _x = Phaser.Math.Snap.Floor(p[0], this.cfg.grid);
					let _ys = obstacles.get(_x);
					if(_ys) {						
						for(i2 = 0; i2 < _ys.length; i2++) {
							let _d = Math.abs(p[1] - _ys[i2].y);
							if(_d <= scale_y_length_r) {
								if(!_min_y.has(i)) {
									_min_y.set(i, [i2, _d, _ys[i2].y]);
								} else if(_d < _min_y.get(i)[1]) {
									_min_y.get(i)[0] = i2;
									_min_y.get(i)[1] = _d;
									_min_y.get(i)[2] = _ys[i2].y;
								}
							}
						}				
					}
				}
				let _min_y_i = _min_y.keys();
				if(_min_y_i.length > 0) {
					_min_y_i = Phaser.Utils.Array.Shuffle(_min_y_i);
					let i = _min_y_i[0];
					path[i][1] = _min_y.get(i)[2] + AutopRand.randint(1, this.cfg.grid);
					intersected_wo = true;
				}			
			}			
			if(!intersected_wo) return false;
		}		
		
		let _prev_tail = prev_tail === false ? [] : prev_tail;
		let spline = new Phaser.Curves.Spline(_prev_tail.concat(path));
		
		let _length = Math.floor(spline.getLength());
		let _adding = false;
		let prev_point = false;
		for(let i = 0; i < _length; i++) {
			let _p = spline.getPoint(i / _length);			
			if(_adding) {
				points.addPoint(_p);
			} else {
				if(_p.x > first_xy[0]) {
					_adding = true;
					if(_prev_point) points.addPoint(_prev_point);
					points.addPoint(_p);
				} else {
					_prev_point = _p;
				}
			}
		}		
		points.makeRtree(this.cfg.rtreeOffset, this.cfg.grid);
		tail = [path[path.length - 3], path[path.length - 2], path[path.length - 1]];
		return {
			path: path,
			tail: tail,
			prev_tail: prev_tail,
			sections: sections,
			points: points
		}
	}, 
	
	gameover: function() {
		if(!this.cfg.gameOver || this.cfg._do_gameover !== undefined) return;
		this.cfg._do_gameover = true;
		this.sc.cameras.cameras.forEach(function(c) {c.fade(1200);});
		this.sc.time.addEvent({delay: 1100, callback: function() {
			document.getElementById(AutopCFG.parent).innerHTML = '<div style="vertical-align:middle;padding-top:30px"><h1 style="font-size:40px;text-align:center">Game Over<br /><a href="javascript:;" onclick="javascript:document.location.reload();">Restart</a></h1></div>'
		}});
	}
	
}

function preload ()
{
	AutopLIB.sc = this;
}

function create ()
{
	
	let cfg = AutopCFG.custom;
	var rwh = cfg.revertWidthHeight;
	var _w = rwh ? 'height' : 'width';
	var _h = rwh ? 'width' : 'height';
	
	this.registry.set('buttons', []);
	this.registry.set('paths', []);
	this.registry.set('path_objects', []);
	this.registry.set('walls', []);
	this.registry.set('obstacles', (new Phaser.Structs.Map()));

	AutopLIB.config_preprocess(rwh, _w, _h);
	
	this.cameras.main.setSize(this.cameras.main.width, cfg.heightField);
	this.cameras.add(0, cfg.heightField, this.cameras.main.width, cfg.heightControls).setBounds(0, cfg.heightField, this.cameras.main.width, cfg.heightControls);
	
	AutopLIB.controls_make();
	AutopLIB.controls_make_buttons();
	AutopLIB.player_make();
	AutopLIB.player_body_make();
	AutopLIB.grid_cell_make();
	AutopLIB.wall_make();
	
	let pobj = AutopLIB.generate_path();	
	pobj.wall = this.add.image(Math.round(pobj.points.getEndPoint().x), 0, cfg.wallTextureName).setOrigin(0);
	
	let prev_tail = pobj.tail;
	this.registry.get('paths').push(pobj.points);
	this.registry.get('walls').push(pobj.wall);	
	AutopLIB.show_path(pobj);	
	AutopLIB.generate_obstacles(pobj);
	
	for(let i = 0; i < 3; i++) {		
		let pobj_wrong;
		let pobj_correct = AutopLIB.generate_path(prev_tail);
		pobj_correct.wall = this.add.image(Math.round(pobj_correct.points.getEndPoint().x), 0, cfg.wallTextureName).setOrigin(0);
		let obs = AutopLIB.generate_obstacles(pobj_correct);
		while(true) {
			pobj_wrong = AutopLIB.generate_path(prev_tail, obs);
			if(pobj_wrong !== false) break;
		}
		this.registry.get('obstacles').merge(obs, true);
		prev_tail = pobj_correct.tail;
		this.registry.get('path_objects').push([pobj_correct, pobj_wrong]);		
	}
	
	AutopLIB.controls_set_path(this.registry.get('paths')[0], 0, true);
	
	this.registry.set('player', AutopLIB.multipath_follower({
			positionOnPath: true,        
			repeat: 0,
			rotateToPath: false,
			rotationOffset: 0,
			verticalAdjust: true,
			//ease: 'Circ.easeInOut'
		}, 'player'));
	this.registry.get('player').setDepth(-100);
	
	this.input.events.on('POINTER_DOWN_EVENT', function (event) {
		AutopLIB.controls_on_click(event);
	});
	cfg._just_started = true;
	cfg._buttons_enabled = true;
	cfg._correct_selected = true;
}

function update() {	
	if(!this.registry.has('player')) return;
	let player = this.registry.get('player');
	if(AutopCFG.custom._pause_scheduled !== undefined && AutopCFG.custom._pause_scheduled && player.isFollowing()) {
		player.pause();
		AutopCFG.custom._pause_scheduled = false;
		return;
	}
	
	if(!AutopLIB.player_update(player)) return;
	AutopLIB.camera_follow(player);
}

var game = new Phaser.Game(AutopCFG);
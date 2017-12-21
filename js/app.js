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
		speed: 100,
		cameraOffset: 0.3,
		start_x: 10,
		heightControlsRate: 0.2,
		pathLength: 0.5,
		gen_path: {
			path_x_spread: 0.1,
			scale_y: 5,
			line_probability: 3,
			long_short_probability: 3,			
			min_max_segments: [3, 6],
			first_line_length: [60, 120]
		},
		controls: {
			separator_line_style: [3, 0xff0000, 1],
			button_bounds_style: [4, 0x890021, 1],
			button_path_style: [20, 0xff0000, 1],
			button_height: 0.9,
			button_gap: 50
		}
	}
};

///////////////////////////////////

class AutopPointsPath {
	constructor(points) {
		this.points = [];
		if(points !== undefined && typeof points === 'object' && points.hasOwnProperty(0)) this.setPoints(points);		
	}

	setPoints(points) {
		this.points = points;
	}
	
	getCurveLengths() {
		return [this.points.length];
	}
	
	getPoints() {
		return this.points;
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
	
		this.cfg.gen_path.start_x = this.cfg.start_x;
		this.cfg.gen_path.start_y = Math.round(this.cfg.heightField * 0.5);
		this.cfg.gen_path.min_y = this.cfg.playerWidthHeight[1];
		this.cfg.gen_path.max_y = (rwh ? this.sc.game.config[_h] : this.cfg.heightField) - this.cfg.gen_path.min_y;
		this.cfg.gen_path.scale_y_length = (this.cfg.gen_path.max_y - this.cfg.gen_path.min_y) / (this.cfg.gen_path.scale_y + 1);
		this.cfg.gen_path.min_path_x_length = Math.round(this.sc.game.config[_w] * 0.5 - this.sc.game.config[_w] * this.cfg.gen_path.path_x_spread);
		this.cfg.gen_path.max_path_x_length = Math.round(this.sc.game.config[_w] * 0.5 + this.sc.game.config[_w] * this.cfg.gen_path.path_x_spread);
		this.cfg.gen_path.min_segment_length = this.cfg.playerWidthHeight[0] + this.cfg.playerWidthHeight[1];
		this.cfg.gen_path.rwh = rwh;
		this.cfg.gen_path.screen_length = this.sc.game.config[_w];
	},
	
multipath_follower: function(config, texture) {	
	let _p = this.sc.registry.get('paths').shift();
	let _clen0 = _p.getCurveLengths();
	config.duration = Math.round((_clen0[_clen0.length - 1] / this.cfg.speed) * 1000);
    let _player = this.sc.add.follower(_p, 0, 0, texture);		
	
	config.onComplete = () => {
			let _path = this.sc.registry.get('paths').shift();
			if(_path === undefined) return;
			let _clen = _path.getCurveLengths();
			config.duration = Math.round((_clen[_clen.length - 1] / this.cfg.speed) * 1000);
			_player.setPath(_path, config);
			_player.setRotateToPath(true, config.rotationOffset, config.verticalAdjust);
		},
	config.onCompleteScope = this.sc;	
	
    _player.start(config);
	_player.setRotateToPath(true, config.rotationOffset, config.verticalAdjust);	
	this.cfg._pause_scheduled = true;
	return _player;	
},

	controls_make_buttons : function() {		
		let button_width = Math.round(this.sc.game.config.width * this.cfg.heightControlsRate * this.cfg.pathLength * this.cfg.controls.button_height);
		let button_height = Math.round(this.sc.game.config.height * this.cfg.heightControlsRate * this.cfg.controls.button_height);
		
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
	
	controls_on_click: function(event) {
		let buttons = this.sc.registry.get('buttons');		
		for(let i = 0; i < buttons.length; i++) {
			if(!buttons[i].button.visible) continue;
			if(event.x > buttons[i].bounds.x1 && event.y > buttons[i].bounds.y1 && event.x < buttons[i].bounds.x2 && event.y < buttons[i].bounds.y2) {
				let player = this.sc.registry.get('player');
				if(!player.isFollowing()) player.resume();
				break;
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
		grs.strokePoints(points.getPoints());		
		grs.generateTexture(texture_name);
		let _plen = points.getLengthX();
		let btn = this.sc.registry.get('buttons')[button_index];
		if(btn.path !== undefined && btn.path instanceof Phaser.GameObjects.Image && btn.path.active) btn.path.destroy();
		let __bounds = btn.bounds;
		let __coeff = (__bounds.x2 - __bounds.x1 - 8) / _plen;	
		btn.path = this.sc.add.image(0, 0, texture_name).setScale(__coeff).setOrigin(0).setPosition(__bounds.x1 + 1, __bounds.y1);		
		btn.is_correct = is_correct;
	},
	
	player_make: function() {		
		var _player_graphics = this.sc.make.graphics();
		_player_graphics.fillStyle(this.cfg.playerFillStyle).fillTriangle(...this.cfg.playerTrianglePoints).generateTexture('player', ...this.cfg.playerWidthHeight);
	},
	
	generate_path: function(start) {
		let cfg = this.cfg.gen_path;
		var is_first, path, first_xy, max_x, last_xy, next_y_section;
		
		var scale_y_length_r = Math.round(cfg.scale_y_length);
		var min_segment_length_sq = cfg.min_segment_length * cfg.min_segment_length;
		
		var path, prev_tail, sections = [], tail = [];
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
		
		let current_y_section = Math.ceil(last_xy[1] / cfg.scale_y_length);		
		
		for(let _i = 0; _i < num_segments; _i++) {
			sections.push(current_y_section);
			let section_jump = AutopRand.randint(0, AutopRand.chanceOneIn(cfg.long_short_probability) ? cfg.scale_y : Math.round(cfg.scale_y * 0.5));

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
			let next_y = scale_y_length_r * next_y_section + AutopRand.randint(0, scale_y_length_r);
			
			if(_i === (num_segments - 1)) {
				next_x = max_x;
			} else {
				let _min_x = 0;
				let __y_diff = Math.abs(next_y - last_xy[1]);			
				if(__y_diff < cfg.min_segment_length) _min_x = Math.round(Math.sqrt(min_segment_length_sq  - __y_diff * __y_diff));			
			
				let _avg_x = Math.round(path_x_length / (num_segments - _i));
				if(_avg_x < _min_x) {
					next_x = last_xy[0] + _min_x;
				} else {
					next_x = last_xy[0] + AutopRand.randint(_min_x, _avg_x * (AutopRand.chanceOneIn(cfg.long_short_probability) ? 2 : 1));
				}
				if(next_x > max_x) next_x = Math.round(last_xy[0] + (max_x - last_xy[0]) / (num_segments - _i));
			}
			path.push([next_x, next_y]);			
			last_xy = [next_x, next_y];
			current_y_section = next_y_section;		
			if(next_x >= max_x) break;
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
		//min_segment_length
		/* scale_y: 5,
		   line_probability: 3,
		   long_short_probability: 3,	*/	
		tail = [path[path.length - 3], path[path.length - 2], path[path.length - 1]];
		return {
			path: path,
			tail: tail,
			prev_tail: prev_tail,
			sections: sections,
			points: points
		}
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

	AutopLIB.config_preprocess(rwh, _w, _h);
	
	this.cameras.main.setSize(this.cameras.main.width, cfg.heightField);
	this.cameras.add(0, cfg.heightField, this.cameras.main.width, cfg.heightControls).setBounds(0, cfg.heightField, this.cameras.main.width, cfg.heightControls);
	
	AutopLIB.controls_make();
	AutopLIB.controls_make_buttons();
	AutopLIB.player_make();
	
	var gr = this.add.graphics();//tmp
	gr.lineStyle(1, 0xffffff, 1);//tmp
	
	let prev_tail = false;
	for(let i = 0; i < 10; i++) {
		let pobj = AutopLIB.generate_path(prev_tail);
		prev_tail = pobj.tail;
		this.registry.get('path_objects').push(pobj);
		this.registry.get('paths').push(pobj.points);
		gr.strokePoints(pobj.points.getPoints());//tmp
	}

	
	AutopLIB.controls_set_path(this.registry.get('paths')[0], 0, true);
	
	this.registry.set('player', AutopLIB.multipath_follower({
			positionOnPath: true,        
			repeat: 0,
			rotateToPath: false,
			rotationOffset: 0,
			verticalAdjust: true
		}, 'player'));
	
	this.input.events.on('POINTER_DOWN_EVENT', function (event) {
		AutopLIB.controls_on_click(event);
	});
	
}

function update() {	
	if(!this.registry.has('player')) return;
	let player = this.registry.get('player');
	if(AutopCFG.custom._pause_scheduled !== undefined && AutopCFG.custom._pause_scheduled && player.isFollowing()) {
		player.pause();
		AutopCFG.custom._pause_scheduled = false;
		return;
	}
	if(!AutopCFG.custom.revertWidthHeight) {
		if(player.x > AutopCFG.custom._cameraOffset) {
			let _p = Math.round(player.x) - AutopCFG.custom._cameraOffset;
			if(_p > this.cameras.main.scrollX) this.cameras.main.setScroll(_p, 0);
		}
	} else {
		if(player.y > (AutopCFG.height - AutopCFG.custom._cameraOffset)) {
			let _p = Math.round(player.y) + AutopCFG.custom._cameraOffset	
			if(_p < this.cameras.main.scrollY) this.cameras.main.setScroll(0, _p);
		}
	}
}

var game = new Phaser.Game(AutopCFG);
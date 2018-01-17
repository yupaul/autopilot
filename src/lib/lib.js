import AutopRand from '../util/autoprand';
import {AutopGenPathW, AutopGenPathH} from './gen_path';

class AutopLIB {
	
	constructor(sc) {
		this.sc = sc;
		this.cfg = this.sc.cfg;
		this.rwh = this.cfg.revertWidthHeight;
		this.gen_path = this.rwh ? (new AutopGenPathH(sc)) : (new AutopGenPathW(sc));
	}
	
	camera_follow(player) {
		if(!this.rwh) {
			if(player.x > this.cfg._cameraOffset) {
				let _p = Math.round(player.x) - this.cfg._cameraOffset;
				if(_p > this.sc.cameras.main.scrollX) this.sc.cameras.main.setScroll(_p, 0);
			}
		} else {
			if(player.y < this.cfg._cameraOffset) {
				let _p = Math.round(player.y) - this.cfg._cameraOffset;
				if(_p < this.sc.cameras.main.scrollY) this.sc.cameras.main.setScroll(0, _p);
			}	
		}
	}
	
	create() {
		this.show_path_make();
		this.controls_make();
		this.controls_make_buttons();
		this.player_make();
		this.player_body_make();
		this.grid_cell_make();
		this.wall_make();		
		this.section_counter_make();
	}
	
	player_update(player) {
		let _k = Phaser.Math.Snap[this.rwh ? 'Ceil' : 'Floor'](player[this.rwh ? 'y' : 'x'], this.cfg.grid);
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
			if(!this.sc.registry.get('player_body_group').visible) this.sc.registry.get('player_body_group').visible = 1;
			Phaser.Actions.ShiftPosition(this.sc.registry.get('player_body_group').getChildren(), ...this.sc.registry.get('player_xy'));
			this.sc.registry.get('player_xy')[0] = player.x;
			this.sc.registry.get('player_xy')[1] = player.y;
		}
		return true;
	}

	show_path_make() {
		if(!this.cfg.showPaths) return;
		let gr = this.sc.make.graphics();
		gr.fillStyle(this.cfg.showPathStyle[1], this.cfg.showPathStyle[2]);
		gr.fillCircle(this.cfg.showPathRadius, this.cfg.showPathRadius, this.cfg.showPathRadius).generateTexture(this.cfg.showPathTextureName, this.cfg.showPathRadius * 2, this.cfg.showPathRadius * 2);		
	}
	
	show_path(path_object) {
		if(!this.cfg.showPaths) return;		
		
		//gr.lineStyle(...this.cfg.showPathStyle);
		//gr.strokePoints(path_object.points.getPoints());
		/*let points1 = path_object.points.movePoints(0, this.cfg.playerWidthHeight[1]);
		let points2 = path_object.points.movePoints(0, -this.cfg.playerWidthHeight[1]);
		gr.strokePoints(points1);
		gr.strokePoints(points2);*/
		//gr.fillStyle(this.cfg.showPathStyle[1], this.cfg.showPathStyle[2]);
		let points = path_object.points.getPointsSubSet(this.cfg.showPathSubSet);
		if(this.sc.registry.get('show_path_last_point')) {
			let _lp = this.sc.registry.get('show_path_last_point');
			if(_lp.distance(points[1]) > points[1].distance(points[2]) * 1.5) {
				let _fp = new Phaser.Math.Vector2((_lp.x + points[1].x) * 0.5, (_lp.y + points[1].y) * 0.5);
				this.sc.add.image(0, 0, this.cfg.showPathTextureName).setPosition(_fp.x, _fp.y).setDepth(-101);
			}
		}
		for(let i = 1; i < (points.length - 1); i++) {
			this.sc.add.image(0, 0, this.cfg.showPathTextureName).setPosition(points[i].x, points[i].y).setDepth(-101);
			if(i === (points.length - 2)) this.sc.registry.set('show_path_last_point', points[i]);
			//gr.fillCircle(points[i].x, points[i].y, this.cfg.showPathRadius);
		}
	}	
	
	multipath_follower(config, texture) {
		let _p = this.sc.registry.get('paths').shift();
		let _start_point = _p.getStartPoint();
		let _clen0 = _p.getCurveLengths();

		config.duration = Math.round((_clen0[_clen0.length - 1] / this.cfg.speed) * this.cfg.speedMult);
		let _player = this.sc.add.follower(_p, _start_point.x, _start_point.y, texture);		
	
		config.onComplete = () => {this.path_continue(config, _player);};
		config.onCompleteScope = this.sc;	
	
		_player.start(config);
		_player.setRotateToPath(true, config.rotationOffset, config.verticalAdjust);	
		this.cfg._pause_scheduled = true;	
		return _player;	
	}

	path_continue(config, player) {
		let _path = this.sc.registry.get('paths').shift();			
		if(_path === undefined) {
			this.gameover();
			return;
		}
//		console.log('!!!!!', Math.random());//tmp debug to fix start / end 2 frame delay
		let _clen = _path.getCurveLengths();
		config.duration = Math.round((_clen[_clen.length - 1] / this.cfg.speed) * this.cfg.speedMult);
		player.setPath(_path, config);
		player.setRotateToPath(true, config.rotationOffset, config.verticalAdjust);	
		if(this.cfg.speedUp) this.cfg.speed += this.cfg.speedUp;	
		if(!this.cfg._buttons_enabled && this.cfg._correct_selected) this.controls_buttons_enable();
		this.add_to_update_queue('update_section_counter', 5);
	}

	controls_make_buttons() {
		let _tmp = [this.cfg.pathLength,  (1 - this.cfg.heightControlsRate)];
		if(this.rwh) _tmp.reverse();
		let button_width = Math.round(this.sc.game.config.width * _tmp[0] * this.cfg.heightControlsRate * this.cfg.controls.button_height);
		let button_height = Math.round(this.sc.game.config.height * _tmp[1] * this.cfg.heightControlsRate * this.cfg.controls.button_height);	
		
		var grs_rect = this.sc.make.graphics();
		grs_rect.lineStyle(...this.cfg.controls.button_bounds_style);
		grs_rect.strokeRect(0, 0, button_width, button_height).generateTexture('button_bounds', button_width, button_height); 
		for(let i = 0; i < this.cfg.maxNumPaths; i++) {
			this.sc.registry.get('buttons').push({button: this.sc.add.image(0, 0, 'button_bounds').setInteractive().setVisible(false)});
		}
		this.activate_path_buttons(2);//tmp
		this.sc.registry.get('buttons')[1].button.setVisible(false);//tmp
	}
	
	activate_path_buttons(num) {
		let x;		
		let _tmp = [this.cfg.pathLength,  (1 - this.cfg.heightControlsRate)];
		if(this.rwh) _tmp.reverse();
		let button_width = Math.round(this.sc.game.config.width * _tmp[0] * this.cfg.heightControlsRate * this.cfg.controls.button_height);
		if((num % 2) === 0) {
			x = Math.round((this.sc.game.config.width - this.cfg.controls.button_gap * num - button_width * (num - 1)) * 0.5);
		} else {
			x = Math.round((this.sc.game.config.width - this.cfg.controls.button_gap * (num - 1) - button_width * num) * 0.5);
		}
		let y = Math.round(this.sc.game.config.height - this.cfg.heightControls * 0.5);
		for(let i = 0; i < this.sc.registry.get('buttons').length; i++) {
			if(i >= num) {
				if(this.sc.registry.get('buttons')[i].path && this.sc.registry.get('buttons')[i].path.destroy) {
					this.sc.registry.get('buttons')[i].path.destroy();
					this.sc.registry.get('buttons')[i].path = false;
				}
				this.sc.registry.get('buttons')[i].button.setVisible(false);
			} else {
				this.sc.registry.get('buttons')[i].button.setPosition(x + (button_width + this.cfg.controls.button_gap) * i, y).setVisible(true);
				this._set_button_bounds('buttons', i);
			}
		}

	}

	_set_button_bounds(k, i) {
		let btn = i !== undefined ? this.sc.registry.get(k)[i] : this.sc.registry.get(k);
		let __pbounds = btn.button.getBounds();
		btn.bounds = {
			x1 : __pbounds.x,
			x2 : __pbounds.x + __pbounds.width,
			y1 : __pbounds.y,
			y2 : __pbounds.y + __pbounds.height,
		};			
	}
	
	controls_make() {
		this.sc.registry.set('button_pause', {button: this.sc.add.image(Math.round(this.sc.game.config.width * this.cfg.controls.pause_button_x_position), Math.round(this.sc.game.config.height - this.cfg.heightControls * 0.5), 'pause').setInteractive()});
		this._set_button_bounds('button_pause');
		var gr_separator_line = this.sc.add.graphics();
		gr_separator_line.lineStyle(...this.cfg.controls.separator_line_style);	
		let _l = new Phaser.Curves.Line([0, this.cfg.heightField + 1, this.sc.game.config.width + 1, this.cfg.heightField + 1]);
		_l.draw(gr_separator_line, this.sc.game.config.width + 1);		
	}
	
	grid_cell_make() {
		var grs_rect = this.sc.make.graphics();
		grs_rect.fillStyle(this.cfg.gridCellFillStyle);
		grs_rect.fillRect(0, 0, this.cfg.grid, this.cfg.grid);
		if(this.cfg.gridCellLineStyle) {
			grs_rect.lineStyle(...this.cfg.gridCellLineStyle);1, 0xffffff, 1		
			grs_rect.strokeRect(0, 0, this.cfg.grid, this.cfg.grid);
		}
		grs_rect.generateTexture(this.cfg.gridCellTextureName, this.cfg.grid, this.cfg.grid); 
	}

	wall_make() {
		var grs_rect = this.sc.make.graphics();		
		grs_rect.fillStyle(this.cfg.wallStyle);
		let _wh = [this.cfg.wallWidth, this.cfg.heightField];
		if(this.rwh) _wh.reverse();
		grs_rect.fillRect(0, 0, ..._wh).generateTexture(this.cfg.wallTextureName, ..._wh); 
	}	

	wall_show(x) {
		let _x = x.wall_coords !== undefined ? x.wall_coords : x;
		this.sc.registry.get('walls').push(this.sc.add.image(_x, 0, this.cfg.wallTextureName).setOrigin(0));
	}

	section_counter_make() {
		this.sc.registry.set(this.cfg.sectionCounterName, this.sc.add.text(50, this.cfg.heightField + this.cfg.heightControls * 0.5 - 20, '0', this.cfg.sectionCounterStyle));
	}

	update_section_counter() {
		let current = parseInt(this.sc.registry.get(this.cfg.sectionCounterName).text);
		this.sc.registry.get(this.cfg.sectionCounterName).setText((current + 1) + '');
	}
	
	controls_buttons_enable() {
		let _this = this;
		let delay_multiplier = 1 - this.cfg.speedUp / this.cfg.speed;
		this.sc.time.addEvent({delay: AutopRand.randint(...this.cfg.buttonEnableDelay.map((_x) => {return Math.round(_x * delay_multiplier);})), callback: function() {
			_this.cfg._buttons_enabled = true;
			let _pos = _this.sc.registry.get('path_objects')[0];
			let btn_order = [...Array(_pos.length).keys()];
			if(_this.cfg.randomizeButtons) Phaser.Utils.Array.Shuffle(btn_order);
			this.activate_path_buttons(_pos.length);
			for(let _i = 0; _i < _pos.length; _i++) {
				_this.controls_set_path(_pos[_i].points, btn_order[_i], _pos[_i].is_correct, _i);
			}
		}, callbackScope: this});		
	}

	click_just_started() {
		this.cfg._just_started = false;
		this.cfg._correct_selected = true;
		this.sc.registry.get('buttons')[1].button.setVisible(true);
		this.controls_buttons_enable();
	}

	click_path_button(button) {
		this.cfg._correct_selected = button.is_correct;
		let _all_pos = this.sc.registry.get('path_objects');
		let _pos = _all_pos.shift();						
					
		let _pos_i = button.path_index;
		let _wall = this.sc.registry.get('walls').shift();
		if(_wall) _wall.setAlpha(this.cfg.wallOpenAlpha);
					
		if(_pos[_pos_i].nxt && _pos[_pos_i].nxt[0].wall_coords) this.wall_show(_pos[_pos_i].nxt[0]);					

		this.sc.registry.get('paths').push(_pos[_pos_i].points);
		this.show_path(_pos[_pos_i]);					
					
		if(this.cfg._correct_selected) {
			if(_pos[_pos_i].nxt) this.sc.registry.get('path_objects').push(_pos[_pos_i].nxt);
			if(_pos[_pos_i].obs) {
				this.draw_obstacles(_pos[_pos_i].obs);
				this.sc.registry.get('obstacles').merge(_pos[_pos_i].obs, true);
			}
			this.add_to_update_queue('generate_new', AutopRand.randint(3,8));
		}
	}
	
	controls_on_click(event) {
		let button_pause = this.sc.registry.get('button_pause');
		if(event.x > button_pause.bounds.x1 && event.y > button_pause.bounds.y1 && event.x < button_pause.bounds.x2 && event.y < button_pause.bounds.y2) return this.pause();
		if(!this.cfg._buttons_enabled) return;
		let buttons = this.sc.registry.get('buttons');		
		for(let i = 0; i < buttons.length; i++) { // tmp
			if(!buttons[i].button.visible) continue;
			if(event.x > buttons[i].bounds.x1 && event.y > buttons[i].bounds.y1 && event.x < buttons[i].bounds.x2 && event.y < buttons[i].bounds.y2) {
				let player = this.sc.registry.get('player');
				if(!player.isFollowing()) player.resume();
				if(this.cfg._just_started) {
					this.click_just_started();
				} else {
					this.click_path_button(buttons[i]);
				}				
				for(let _i2 = 0; _i2 < buttons.length; ++_i2) {
					if(buttons[_i2].button.visible && buttons[_i2].path !== undefined) buttons[_i2].path.setAlpha(this.cfg.controls.button_disabled_alpha);
				}				
				this.cfg._buttons_enabled = false;				
				break;
			}
		}		
	}
	
	add_to_update_queue(method, num_delay_frames, args) {
		if(args !== undefined && !(args instanceof Array)) args = [args];
		this.sc.time.addEvent({delay: num_delay_frames * 20, callback: () => {args ? this[method](...args) : this[method]();}, callbackScope: this});
	}
	
	find_last_paths(pos) {
		let out = [];
		
		for(let i = 0; i < pos.length; i++) {
			if(!pos[i].is_correct) continue;
			if(!pos[i].nxt) {
				out.push(pos[i]);
			} else {
				let _out = this.find_last_paths(pos[i].nxt);
				if(_out.length > 0) out = out.concat(_out);
			}
		}
		return out;
	}
	
	generate_new() {
		let _all_pos = this.sc.registry.get('path_objects');
		let _pos = this.find_last_paths(_all_pos[_all_pos.length - 1]);
		for(let i = 0; i < _pos.length; i++) {
			let prev_tail = _pos[i].tail;
			let pobj_correct = [this.gen_path.generate_path(prev_tail)];	
			if(AutopRand.chanceOneIn(this.cfg.twoCorrectChance)) pobj_correct.push(this.gen_path.generate_path(prev_tail, false, pobj_correct[0].path_x_length));
			this.generate_wall(pobj_correct[0]);
			this.add_to_update_queue('generate_new_step3', AutopRand.randint(2,6), [pobj_correct, _pos[i]]);
		}
	}
	
	generate_wall(pobj_correct) {
		pobj_correct.wall_coords = Math.round(pobj_correct.points.getEndPoint().x);
	}
	
	generate_new_step3(pobj_correct, prev_obj) {
		let obs = this.generate_obstacles(pobj_correct);
		this.add_to_update_queue('generate_new_step4', AutopRand.randint(2,6), [pobj_correct, prev_obj, obs]);
	}

	generate_new_step4(pobj_correct, prev_obj, obs) {
		let prev_tail = prev_obj.tail;
		let pobj_wrong = this.gen_path.generate_path(prev_tail, obs);
		prev_obj.nxt = [...pobj_correct, pobj_wrong];
		prev_obj.obs = obs;
		
		if(this.cfg.maxNumPaths > (pobj_correct.length + 1) && AutopRand.chanceOneIn(this.cfg.fourPathsChance)) {
			let _to_gen = this.cfg.maxNumPaths - pobj_correct.length - 1;
			if(_to_gen > 1) _to_gen = AutopRand.randint(1, _to_gen);
			for(let i = 0; i < _to_gen; i++) {
				this.add_to_update_queue('generate_new_step4_2', AutopRand.randint(2,6), [prev_obj, obs]); //tmp
			}
		}
	}

	generate_new_step4_2(prev_obj, obs) {
		let prev_tail = prev_obj.tail;
		let pobj_wrong = this.gen_path.generate_path(prev_tail, obs);
		if(!prev_obj.nxt) prev_obj.nxt = [];
		prev_obj.nxt.push(pobj_wrong);		
	}

	
	controls_set_path(points, button_index, is_correct, path_index) {
		if(is_correct === undefined) {
			is_correct = false;
		} else {
			is_correct = !!is_correct;
		}
		var texture_name;
		var minipath = this.sc.make.graphics();
		while(true) {
			texture_name = '_grs'+((Math.random() * 1000000) | 0);
			if(!this.sc.sys.textures.exists(texture_name)) break;
		}
		let btn = this.sc.registry.get('buttons')[button_index];
		if(btn.path !== undefined && btn.path instanceof Phaser.GameObjects.Image && btn.path.active) btn.path.destroy();		
		minipath.lineStyle(...this.cfg.controls.button_path_style);	
		btn.path = this.gen_path.minipath(minipath, points, btn, texture_name);
		btn.path_index = path_index;
		btn.is_correct = is_correct;
		if(this.cfg.dbg) btn.button.setAlpha(is_correct ? 1 : 0.25);//tmp
	}
	
	player_make() {
		var _player_graphics = this.sc.make.graphics();
		_player_graphics.fillStyle(this.cfg.playerFillStyle).fillTriangle(...this.cfg.playerTrianglePoints).generateTexture('player', ...this.cfg.playerWidthHeight);
	}
	
	player_body_make() {
		var gr = this.sc.make.graphics();
		let radius = Math.round(this.cfg.playerWidthHeight[0] * 0.5);
		gr.fillStyle(this.cfg.playerFillStyle).fillCircle(0, 0, radius).generateTexture('player_body', radius, radius);
		let g = this.sc.add.group({key: 'player_body', frameQuantity: this.cfg.playerNumBodyParts });
		g.visible = 0;
		for(let i = 0; i < g.getChildren().length; i++) {
			//g.getChildren()[i].setAlpha(Phaser.Math.Easing.Stepped(i / g.getChildren().length, this.cfg.playerBodyEaSteps)); 
			g.getChildren()[i].setAlpha(Phaser.Math.Easing.Sine.Out(i / g.getChildren().length) * 0.75);
		}
		this.sc.registry.set('player_body_group', g);
	}	
	
	generate_obstacles(path_objects) {
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
				if(prev_collided < 4) prev_collided++;
				if(prev_collided < 2 || AutopRand.chanceOneIn(prev_collided * 3)) {
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
		//console.log(_added);//tmp to delete
		if(!_added) return false;
		return out;
	}

	draw_obstacles(obs) {
		obs.each((_, rects) => {
			for(let i = 0; i < rects.length; i++) {
				this.sc.add.image(0, 0, this.cfg.gridCellTextureName).setOrigin(0).setPosition(rects[i].x, rects[i].y);				
			}
			return true;
		});					
	}
	
	pause() {
		//console.log('pause');//tmp to delete
		if(!this.cfg.dbg) {
			this.sc.scene.launch('Menu');
			this.sc.scene.bringToTop('Menu');
			this.sc.scene.sleep('PlayMain');
		} else {		
			var p = this.sc.registry.get('player');
			if(p.pathTween.isPlaying()) {
				p.pause();
			} else {
				p.resume();
			}
		}
		return true;
	}
	
	gameover() {
		if(!this.cfg.gameOver) return;
		this.sc.game.registry.set('_do_gameover', true);
		this.sc.cameras.cameras.forEach((c) => {c.fade(this.cfg.gameOverFade);});
		var _this = this;
		this.sc.time.addEvent({delay: Math.round(this.cfg.gameOverFade * 0.9), callback: function() {	                         				
			_this.sc.scene.stop('PlayMain');
			_this.cfg.speed = _this.cfg.speed_initial;
			_this.sc.scene.start('Menu');
		
		}});
	}
	
}

export default AutopLIB

/* //tmp to delete
create() {
controls_make() {
wall_make() {
grid_cell_make() {
wall_show(x) {
player_make() {
player_body_make() {
show_path_make() {
controls_make_buttons() {

camera_follow(player) {
show_path(path_object) {
player_update(player) {

multipath_follower(config, texture) {
path_continue(config, player) {
activate_path_buttons(num) {
controls_buttons_enable() {
controls_set_path(points, button_index, is_correct, path_index) {
_set_button_bounds(k, i) {
section_counter_make() {
update_section_counter() {
click_just_started() {
click_path_button(button) {
controls_on_click(event) {
add_to_update_queue(method, num_delay_frames, args) {

find_last_paths(pos) {
generate_new() {
generate_wall(pobj_correct) {
generate_new_step3(pobj_correct, prev_obj) {
generate_new_step4(pobj_correct, prev_obj, obs) {
generate_new_step4_2(prev_obj, obs) {
generate_obstacles(path_objects) {
//generate_path(start, obstacles, path_x_length) {
draw_obstacles(obs) {

pause() {
gameover() {
*/
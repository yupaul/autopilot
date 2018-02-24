import AutopRand from '../util/autoprand';
import {AutopGenPathW, AutopGenPathH} from './gen_path';
import AutopGenObs from './gen_obs';

class AutopLIB {
	
	constructor(sc) {
		this.sc = sc;
		this.cfg = this.sc.cfg;
		this.rwh = this.cfg.revertWidthHeight;
		this.gen_path = this.rwh ? (new AutopGenPathH(sc)) : (new AutopGenPathW(sc));
		this.gen_obs = new AutopGenObs(this.cfg, this.sc);
	}
	
	camera_follow(player) {
		if(!this.rwh) {
			if(player.x > this.cfg._cameraOffset) {
				let _p = Math.round(player.x) - this.cfg._cameraOffset;
				if(_p > this.sc.cameras.main.scrollX) {
					this.sc.cameras.main.setScroll(_p, 0);
					if(this.sc.registry.get('bg')) {
						this.sc.registry.get('bg').tilePositionX = this.sc.cameras.main.scrollX;
						this.sc.registry.get('bg').x = this.sc.cameras.main.scrollX;
					}						
				}
			}
		} else {
			if(player.y < this.cfg._cameraOffset) {
				let _p = Math.round(player.y) - this.cfg._cameraOffset;
				if(_p < this.sc.cameras.main.scrollY) this.sc.cameras.main.setScroll(0, _p);
			}	
		}
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
			this.sc.c.player_update(this.sc);
			this.sc.registry.get('player_xy')[0] = player.x;
			this.sc.registry.get('player_xy')[1] = player.y;
		}
		return true;
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
		if(this.sc.c.theme.player_afterCreate && typeof	this.sc.c.theme.player_afterCreate === 'function') this.sc.c.theme.player_afterCreate(_player);
	
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
		//if(this.cfg.speedUp) this.cfg.speed += this.cfg.speedUp;	
		this.sc.c.update_section(this.sc);
		if(!this.cfg._buttons_enabled && this.cfg._correct_selected) this.controls_buttons_enable();
		this.add_to_update_queue('update_section_counter', 5);
	}
	
	activate_path_buttons(num) {
		let x;		
		let _tmp = [this.cfg.pathLength,  (1 - this.cfg.heightControlsRate)];
		if(this.rwh) _tmp.reverse();
		let button_width = Math.round(this.sc.sys.game.config.width * _tmp[0] * this.cfg.heightControlsRate * this.cfg.controls.button_height);
		if((num % 2) === 0) {
			x = Math.round((this.sc.sys.game.config.width - this.cfg.controls.button_gap * num - button_width * (num - 1)) * 0.5);
		} else {
			x = Math.round((this.sc.sys.game.config.width - this.cfg.controls.button_gap * (num - 1) - button_width * num) * 0.5);
		}
		let y = Math.round(this.sc.sys.game.config.height - this.cfg.heightControls * 0.5);
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

	wall_add(x, create_far_mask) {
		let _x = x.wall_coords !== undefined ? x.wall_coords : x;
		this.sc.registry.get('walls').push(_x);
		if(create_far_mask !== undefined && create_far_mask) {
			if(!this.sc.registry.has('far_mask')) {
				this.sc.registry.set('far_mask', this.sc.add.image(0, 0, 'far_mask').setOrigin(0));
			}
			this.sc.registry.get('far_mask').setPosition(_x - this.cfg.wallWidth * 2, 0).setDepth(500);				
			this.sc.cameras.cameras[1].ignore(this.sc.registry.get('far_mask'));
		}		
	}
	
	move_far_mask() {
		if(this.sc.registry.get('walls').length) {
			this.sc.tweens.add({
				targets: this.sc.registry.get('far_mask'),
				x: this.sc.registry.get('walls')[0] - this.cfg.wallWidth * 2,
				duration: 500
			});			
		}
	}
	wall_show(tw) {
		let _x = this.sc.registry.get('walls').shift();
		//let _x = x.wall_coords !== undefined ? x.wall_coords : x;
		if(tw !== undefined && tw === true) {
			this.sc.registry.get('wall_group').toggleVisible();		
		} else if(this.cfg.wallOpenBlitter) {
			let blitter = this.sc.add.blitter(0, 0, this.cfg.wallTextureName);
			this.sc.registry.get('wall_group').getChildren().forEach((_img) => {
				blitter.create(_img.x, _img.y).setAlpha(this.cfg.wallOpenAlpha);
			});
		}
		Phaser.Actions.SetX(this.sc.registry.get('wall_group').getChildren(), _x);
		//this.sc.registry.get('walls').push(_x);
		//this.sc.registry.get('walls').push(this.sc.add.image(_x, 0, this.cfg.wallTextureName).setOrigin(0));
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
		this.wall_show();
		//let _wall = this.sc.registry.get('walls').shift();
		//if(_wall) _wall.setAlpha(this.cfg.wallOpenAlpha);
					
		if(_pos[_pos_i].nxt && _pos[_pos_i].nxt[0].wall_coords) this.wall_add(_pos[_pos_i].nxt[0]);	
		this.move_far_mask();

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
	
	generate_wall(pobj_correct) {
		pobj_correct.wall_coords = Math.round(pobj_correct.points.getEndPoint().x);
	}
	
	generate_new() {
		let _all_pos = this.sc.registry.get('path_objects');
		let _pos = this.find_last_paths(_all_pos[_all_pos.length - 1]);
		for(let i = 0; i < _pos.length; i++) {
			let prev_tail = _pos[i].tail;
			let pobj_correct = [this.gen_path.generate_path(prev_tail)];	
			if(AutopRand.chanceOneIn(this.cfg.twoCorrectChance)) pobj_correct.push(this.gen_path.generate_path(prev_tail, false, pobj_correct[0].path_x_length));
			this.generate_wall(pobj_correct[0]);
			this.add_to_update_queue('generate_new_step2', AutopRand.randint(2,6), [pobj_correct, _pos[i]]);
		}
	}
	
	generate_new_step2(pobj_correct, prev_obj) {
		let obs = this.generate_obstacles(pobj_correct);
		this.add_to_update_queue('generate_new_step3', AutopRand.randint(2,6), [pobj_correct, prev_obj, obs]);
	}

	generate_new_step3(pobj_correct, prev_obj, obs) {
		let prev_tail = prev_obj.tail;
		let pobj_wrong = this.gen_path.generate_path(prev_tail, obs, false, false, {path: pobj_correct[0], value: 0});//tmp
		prev_obj.nxt = [...pobj_correct, pobj_wrong];
		prev_obj.obs = obs;
		
		if(this.cfg.maxNumPaths > (pobj_correct.length + 1) && AutopRand.chanceOneIn(this.cfg.fourPathsChance)) {
			let _to_gen = this.cfg.maxNumPaths - pobj_correct.length - 1;
			if(_to_gen > 1) _to_gen = AutopRand.randint(1, _to_gen);
			for(let i = 0; i < _to_gen; i++) {
				this.add_to_update_queue('generate_new_step4', AutopRand.randint(2,6), [prev_obj, obs, pobj_correct]); //tmp
			}
		}
	}

	generate_new_step4(prev_obj, obs, pobj_correct) {
		let prev_tail = prev_obj.tail;
		let pobj_wrong = this.gen_path.generate_path(prev_tail, obs, false, false, {path: (pobj_correct.length > 1 ? pobj_correct[1] : pobj_correct[0]), value: 1});//tmp
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
		this.sc.cameras.main.ignore(btn.path);
		btn.path_index = path_index;
		btn.is_correct = is_correct;
		if(this.cfg.dbg) btn.button.setAlpha(is_correct ? 1 : 0.25);//tmp
	}
	
	generate_obstacles(path_objects) {
		return this.gen_obs.generate(path_objects);
	}

	draw_obstacles(obs) {
		obs.each((_, obs_x) => {
			for(let i = 0; i < obs_x.length; i++) {
				obs_x[i].add_image(this.sc);
				//this.sc.add.image(0, 0, this.cfg.gridCellTextureName).setOrigin(0).setPosition(rects[i].x, rects[i].y);
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
		this.sc.sys.game.registry.set('_do_gameover', true);
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
player_make() {
player_body_make() {
show_path_make() {
controls_make_buttons() {
section_counter_make() {

camera_follow(player) {
player_update(player) {
add_to_update_queue(method, num_delay_frames, args) {

multipath_follower(config, texture) {
path_continue(config, player) {
	
activate_path_buttons(num) {
controls_buttons_enable() {
controls_set_path(points, button_index, is_correct, path_index) {
_set_button_bounds(k, i) {
update_section_counter() {
click_just_started() {
click_path_button(button) {
	show_path(path_object) {
	draw_obstacles(obs) {	
	wall_show(x) {
controls_on_click(event) {

find_last_paths(pos) {
generate_new() {
generate_new_step3(pobj_correct, prev_obj) {
generate_new_step4(pobj_correct, prev_obj, obs) {
generate_new_step4_2(prev_obj, obs) {
generate_obstacles(path_objects) {

pause() {
gameover() {
*/
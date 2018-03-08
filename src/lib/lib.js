import AutopRand from '../util/autoprand';
import {AutopGenPathW, AutopGenPathH} from './gen_path';
import AutopGenObs from './gen_obs';

class AutopLIB {
	
	constructor(sc) {
		this.sc = sc;
//		this.cfg = this.sc.c.config;
		this.c = this.sc.c;
		this.rwh = this.c.config.revertWidthHeight;
		this.gen_path = this.rwh ? (new AutopGenPathH(this.c.config)) : (new AutopGenPathW(this.c.config));
		this.gen_obs = new AutopGenObs(this.c.config, this.sc);
	}
	
	camera_follow(player) {
		
		if(player.bgtween && player.bgtween.isPlaying() && AutopRand.chanceOneIn(10)) this.update_bgcolor([this.c.config.bgcolor.h, this.c.config.bgcolor.s, player.bgtween.getValue()]);
		
		if(!this.rwh) {
			if(player.x > this.c.config.cameraOffsetPx) {
				let _p = Math.round(player.x) - this.c.config.cameraOffsetPx;
				if(_p > this.sc.cameras.main.scrollX) {
					this.sc.cameras.main.setScroll(_p, 0);
					if(this.sc.registry.get('bg')) {
						this.sc.registry.get('bg').tilePositionX = this.sc.cameras.main.scrollX;
						this.sc.registry.get('bg').x = this.sc.cameras.main.scrollX;
					}						
				}
			}
		} else {
			if(player.y < this.c.config.cameraOffsetPx) {
				let _p = Math.round(player.y) - this.c.config.cameraOffsetPx;
				if(_p < this.sc.cameras.main.scrollY) this.sc.cameras.main.setScroll(0, _p);
			}	
		}
	}	
	
	player_update(player) {
		let _k = Phaser.Math.Snap[this.rwh ? 'Ceil' : 'Floor'](player[this.rwh ? 'y' : 'x'], this.c.config.grid);
	
		let _rects = this.sc.registry.get('obstacles').get(_k);
		if(_rects && _rects.length > 0) {
			for(let _i = 0; _i < _rects.length; _i++) {				
				if(_rects[_i].contains(player.x, player.y)) {
					//player.stop();
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
		if(!this.c.config.showPaths) return;	
		
		let texture_counter = AutopRand.randint(1, 100000000);
		//if(this.path_texture_counter > 2) this.path_texture_counter = 0;
		//this.path_texture_counter++;
		/*['fore', 'back'].forEach((_k) => {
			if(this.sc.textures.exists('show_path_'+_k+this.path_texture_counter)) {
				this.sc.textures.get('show_path_'+_k+this.path_texture_counter).destroy();
				delete this.sc.textures.list['show_path_'+_k+this.path_texture_counter];
			}
		});*/
		
		
		let _points = path_object.points.getPointsSubSet(this.c.config.show_path.subset);
		//if(this.sc.registry.get('show_path_last_point')) _points.unshift(this.sc.registry.get('show_path_last_point'));
		//this.sc.registry.set('show_path_last_point', _points[_points.length - 1]);
		if(this.sc.registry.get('show_path_last_point')) _points = this.sc.registry.get('show_path_last_point').concat(_points);
		this.sc.registry.set('show_path_last_point', [_points[_points.length - 2], _points[_points.length - 1]]);
		
		
/*		let _lp = this.sc.registry.get('show_path_last_point');
			if(_lp.distance(_points[1]) > _points[1].distance(_points[2]) * 1.5) {
				let _fp = new Phaser.Math.Vector2((_lp.x + _points[1].x) * 0.5, (_lp.y + _points[1].y) * 0.5);
				_points.unshift(_fp);
			}
		}*/
		let last_style = this.c.config.show_path.styles.length - 1;
//		let start_x = _points[0].x;
//		_points = path_object.points.movePointsExternal(_points, -start_x, 0);
		let _bounds = Phaser.Geom.Rectangle.FromPoints(_points);		
		let start_x = _bounds.x;
		let start_y = _bounds.y - 10;
		_points = path_object.points.movePointsExternal(_points, -start_x, -start_y);
//		let texture_wh = [Math.ceil(_bounds.width), this.c.config.heightField + this.c.config.show_path.styles[last_style][0]];
		let texture_wh = [Math.ceil(_bounds.width), Math.ceil(_bounds.height) + this.c.config.show_path.styles[last_style][0]];
		
		let gr = this.sc.make.graphics();
		let gr2 = this.sc.make.graphics();
		
		for(let i = last_style; i > 0; i--) {
			gr.lineStyle(...this.c.config.show_path.styles[i]);
			gr.strokePoints(_points);				
		}		
		gr.generateTexture('show_path_back'+texture_counter, ...texture_wh);		
		gr2.lineStyle(...this.c.config.show_path.styles[0]);
		gr2.strokePoints(_points).generateTexture('show_path_fore'+texture_counter, ...texture_wh);	
		
//		let back = this.sc.add.image(0, 0, 'show_path_back'+texture_counter).setOrigin(0).setPosition(start_x, 0).setDepth(-51).setBlendMode('SCREEN');
//		let fore = this.sc.add.image(0, 0, 'show_path_fore'+texture_counter).setOrigin(0).setPosition(start_x, 0).setDepth(-51).setBlendMode('SCREEN');
		let back = this.sc.add.image(0, 0, 'show_path_back'+texture_counter).setOrigin(0).setPosition(start_x, start_y).setDepth(-51).setBlendMode('SCREEN');
		let fore = this.sc.add.image(0, 0, 'show_path_fore'+texture_counter).setOrigin(0).setPosition(start_x, start_y).setDepth(-51).setBlendMode('SCREEN');

//		back.mask = new Phaser.Display.Masks.BitmapMask(this.sc, this.sc.registry.get('mask1'));
//		fore.mask = new Phaser.Display.Masks.BitmapMask(this.sc, this.sc.registry.get('mask1'));
		back.mask = new Phaser.Display.Masks.GeometryMask(this.sc, this.sc.registry.get('mask1'));
		fore.mask = new Phaser.Display.Masks.GeometryMask(this.sc, this.sc.registry.get('mask1'));
		this.sc.registry.get('path_images')['i'+texture_counter] = [back, fore];
		this.sc.registry.get('path_textures').push(texture_counter);		
		
		this.sc.registry.get('mask1').x = start_x - this.c.config._rwhcfg.cfg_w;
		this.sc.tweens.add({
			targets: this.sc.registry.get('mask1'),
			x: path_object.points.getEndPoint().x - this.c.config._rwhcfg.cfg_w,			
			duration: AutopRand.randint(...this.c.config.wallMoveDuration) - 100,
			onComplete: () => {
				back.mask = null;
//				fore.mask = new Phaser.Display.Masks.BitmapMask(this.sc, this.sc.registry.get('mask2'));
				fore.mask = new Phaser.Display.Masks.GeometryMask(this.sc, this.sc.registry.get('mask2'));
			},
			delay: 150,
		});					
		this.add_to_update_queue('cleanup_show_paths', 150);
		
		//tmp to delete
		/*let points1 = path_object.points.movePoints(0, this.c.config.playerWidthHeight[1]);
		let points2 = path_object.points.movePoints(0, -this.c.config.playerWidthHeight[1]);
		gr.strokePoints(points1);
		gr.strokePoints(points2);*/
		//gr.fillStyle(this.c.config.showPathStyle[1], this.c.config.showPathStyle[2]);
		/*
		let points = path_object.points.getPointsSubSet(this.c.config.show_path.subset);
		if(this.sc.registry.get('show_path_last_point')) {
			let _lp = this.sc.registry.get('show_path_last_point');
			if(_lp.distance(points[1]) > points[1].distance(points[2]) * 1.5) {
				let _fp = new Phaser.Math.Vector2((_lp.x + points[1].x) * 0.5, (_lp.y + points[1].y) * 0.5);
				this.sc.add.image(0, 0, this.c.config.show_path.texture_name).setPosition(_fp.x, _fp.y).setDepth(-101);
			}
		}
		for(let i = 1; i < (points.length - 1); i++) {
			this.sc.add.image(0, 0, this.c.config.show_path.texture_name).setPosition(points[i].x, points[i].y).setDepth(-101);
			if(i === (points.length - 2)) this.sc.registry.set('show_path_last_point', points[i]);
			//gr.fillCircle(points[i].x, points[i].y, this.c.config.showPathRadius);
		}*/
	}	
	
	cleanup_show_paths() {
		let ts = this.sc.registry.get('path_textures');
		if(ts.length < 6) return;
		this.sc.registry.get('path_images')['i'+ts[0]][0].destroy();
		this.sc.registry.get('path_images')['i'+ts[0]][1].destroy();
		delete this.sc.registry.get('path_images')['i'+ts[0]];
		if(this.sc.textures.exists('show_path_fore'+ts[0])) this.sc.textures.get('show_path_fore'+ts[0]).destroy();
		if(this.sc.textures.exists('show_path_back'+ts[0])) this.sc.textures.get('show_path_back'+ts[0]).destroy();
		ts.shift();
		this.add_to_update_queue('cleanup_minipaths', 100);
	}
	
	cleanup_minipaths() {
		let ts = this.sc.registry.get('minipath_indexes');
		if(ts.length < 20) return;
		for(let i = 0; i < 4; i++) {
			if(this.sc.textures.exists(ts[i])) this.sc.textures.get(ts[i]).destroy();
		}
		ts.slice(4);			
	}
	
	multipath_follower(config, texture) {
		let _p = this.sc.registry.get('paths').shift();
		let _start_point = _p.getStartPoint();
		let _clen0 = _p.getCurveLengths();

		config.duration = Math.round((_clen0[_clen0.length - 1] / this.c.config.speed) * this.c.config.speedMult);
		let _player = this.sc.add.follower(_p, _start_point.x, _start_point.y, texture);	
		if(this.sc.c.theme.player_afterCreate && typeof	this.sc.c.theme.player_afterCreate === 'function') this.sc.c.theme.player_afterCreate(_player);
	
		config.onComplete = () => {this.path_continue(config, _player);};
		config.onCompleteScope = this.sc;	
	
		_player.start(config);
		_player.setRotateToPath(false, config.rotationOffset, config.verticalAdjust);	
		this.sc.registry.get('state')._pause_scheduled = true;	
		this.add_to_update_queue('player_bgtween', 2, [_player]);
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
		config.duration = Math.round((_clen[_clen.length - 1] / this.c.config.speed) * this.c.config.speedMult);
		player.setPath(_path, config);
		player.setRotateToPath(true, config.rotationOffset, config.verticalAdjust);	
		//if(this.c.config.speedUp) this.c.config.speed += this.c.config.speedUp;	
		this.c.update_section(this.sc);
		if(!this.sc.registry.get('state')._buttons_enabled && this.sc.registry.get('state')._correct_selected) this.controls_buttons_enable();
		this.add_to_update_queue('player_bgtween', 2, [player]);
		
		this.add_to_update_queue('update_section_counter', 5);
		this.add_to_update_queue('add_background', 100);
	}
	
	player_bgtween(player) {
		if(this.c.config.bgcolor_change && this.c.config.bgcolor_change.length === 2) player.bgtween = this.sc.tweens.addCounter({
				from: this.c.config.bgcolor_change[0],
				to: this.c.config.bgcolor_change[1],
				duration: Math.round(player.pathTween.duration * 0.9)
		  });
	}
	
	add_background(check) {
		if(check === undefined) check = true;
		if(check && this.sc.registry.get('player').x < (this.sc.registry.get('state').bgt_next.x - this.c.config._rwhcfg.w * 2)) return;
		this.sc.add.image(0, 0, 'bgt').setOrigin(0).setDepth(-1080).setDisplaySize(this.sc.registry.get('state').bgt_next.w, this.sc.registry.get('state').bgt_next.h).setPosition(this.sc.registry.get('state').bgt_next.x, 0);
		this.sc.registry.get('state').bgt_next.x += this.sc.registry.get('state').bgt_next.w + 1;	
	}
	
	update_bgcolor(hsv) {
		if(hsv === undefined) hsv = [this.c.config.bgcolor.h, this.c.config.bgcolor.s, this.c.config.bgcolor.v[0]];
		this.sc.cameras.main.setBackgroundColor(Phaser.Display.Color.HSVToRGB(...hsv).color);		
	}	
	
	activate_path_buttons(num) {
		let x;		
		let _tmp = [this.c.config.pathLength,  (1 - this.c.config.heightControlsRate)];
		if(this.rwh) _tmp.reverse();
		let button_width = Math.round(this.sc.sys.game.config.width * _tmp[0] * this.c.config.heightControlsRate * this.c.config.controls.button_height);
		if((num % 2) === 0) {
			x = Math.round((this.sc.sys.game.config.width - this.c.config.controls.button_gap * num - button_width * (num - 1)) * 0.5);
		} else {
			x = Math.round((this.sc.sys.game.config.width - this.c.config.controls.button_gap * (num - 1) - button_width * num) * 0.5);
		}
		let y = Math.round(this.sc.sys.game.config.height - this.c.config.heightControls * this.c.config.controls.button_offset_coeff);
		for(let i = 0; i < this.sc.registry.get('buttons').length; i++) {
			if(i >= num) {
				if(this.sc.registry.get('buttons')[i].path && this.sc.registry.get('buttons')[i].path.destroy) {
					this.sc.registry.get('buttons')[i].path.destroy();
					this.sc.registry.get('buttons')[i].path = false;
				}
				this.sc.registry.get('buttons')[i].button.setVisible(false);
				if(this.c.config.controls.button_shadow) this.sc.registry.get('buttons')[i].shadow.setVisible(false);
			} else {
				let _x = x + (button_width + this.c.config.controls.button_gap) * i;
				this.sc.registry.get('buttons')[i].button.setPosition(_x, y).setVisible(true);
				if(this.c.config.controls.button_disabled_type === 'tint') {
					if(this.c.config.controls.button_path_tint) {
						this.sc.registry.get('buttons')[i].button.setTint(this.c.config.controls.button_path_tint);
					} else {
						this.sc.registry.get('buttons')[i].button.clearTint();
					}
				}
				this._set_button_bounds('buttons', i);
				
				let _cdata = this.sc.registry.get('buttons')[i].shadow_data;
				if(this.c.config.controls.button_shadow) this.sc.registry.get('buttons')[i].shadow.setPosition(_x + _cdata.w_factor * _cdata.w_offset, y + _cdata.h_factor * _cdata.h_offset).setVisible(true);				
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
		if(btn.button.texture.frames[btn.button.texture.firstFrame].customData.bounds_to_rect) {
			let x_offset = this.c.config.controls.path_in_button_x_offset ? this.c.config.controls.path_in_button_x_offset : 0;
			let c = btn.button.texture.frames[btn.button.texture.firstFrame].customData.bounds_to_rect;
			let wi = __pbounds.width * c;
			let hi = __pbounds.height * c;
			btn.bounds_internal = {};
			btn.bounds_internal.x1 = btn.bounds.x1 + (__pbounds.width - wi) / 2+ x_offset;
			btn.bounds_internal.x2 = btn.bounds_internal.x1 + wi + x_offset;
			btn.bounds_internal.y1 = btn.bounds.y1 + (__pbounds.height - hi) / 2;
			btn.bounds_internal.y2 = btn.bounds_internal.y1 + hi;
			
		}
	}

	wall_add(x, create_far_mask) {
		let _x = x.wall_coords !== undefined ? x.wall_coords : x;
		this.sc.registry.get('walls').push(_x);
		if(create_far_mask !== undefined && create_far_mask) this.create_far_mask(_x);
	}

	create_far_mask(x) {
		if(this.sc.registry.has('far_mask')) {
			this.sc.registry.get('far_mask').destroy();
			this.sc.registry.remove('far_mask');
		}
		this.sc.registry.set('far_mask', this.sc.add.image(0, 0, 'far_mask').setOrigin(0).setPosition(x - this.c.config.farMaskOffset, 0).setDepth(500));	
//		this.sc.cameras.cameras[1].ignore(this.sc.registry.get('far_mask'));
	}
	
	move_far_mask() {
		if(this.sc.registry.get('walls').length) {
			this.sc.tweens.add({
				targets: this.sc.registry.get('far_mask'),
				x: this.sc.registry.get('walls')[0] - this.c.config.farMaskOffset,
				duration: this.c.config.farMaskMoveDuration
			});			
		}
	}
	
	wall_show(tw) {
		let _x = this.sc.registry.get('walls').shift();
		let _first = tw !== undefined && tw === true;
		//let _x = x.wall_coords !== undefined ? x.wall_coords : x;
		if(_first) {
			this.sc.registry.get('wall_group').toggleVisible();		
			Phaser.Actions.SetX(this.sc.registry.get('wall_group').getChildren(), _x);
		} else {
			if(this.c.config.wallOpenBlitter) {
				let blitter = this.sc.add.blitter(0, 0, this.c.config.wallTextureName);
				this.sc.registry.get('wall_group').getChildren().forEach((_img) => {
					blitter.create(_img.x, _img.y).setAlpha(this.c.config.wallOpenAlpha);
				});
			}			
			let _ch = this.sc.registry.get('wall_group').getChildren();
			let _ys = _ch.map((_i) => _i.y);		
			Phaser.Utils.Array.Shuffle(_ys);
			for(let i = 0; i < _ch.length; i++) {
				let _dur = AutopRand.randint(...this.c.config.wallMoveDuration);
				this.sc.tweens.add({
					targets: _ch[i],
					x: _x,
					y: _ys[i],
					ease: this.c.config.wallMoveEase,
					duration: AutopRand.randint(_dur)
				});			
			}
		}		
		
		//this.sc.registry.get('walls').push(_x);
		//this.sc.registry.get('walls').push(this.sc.add.image(_x, 0, this.c.config.wallTextureName).setOrigin(0));
	}	

	update_section_counter() {
		let current = parseInt(this.sc.registry.get(this.c.config.sectionCounterName).text);
		this.sc.registry.get(this.c.config.sectionCounterName).setText((current + 1) + '');
	}
	
	controls_buttons_enable(show_second_button) {
		let _this = this;
		let delay_multiplier = 1 - this.c.config.speedUp / this.c.config.speed;
		this.sc.time.addEvent({delay: AutopRand.randint(...this.c.config.buttonEnableDelay.map((_x) => {return Math.round(_x * delay_multiplier);})), callback: function() {
			if(show_second_button !== undefined && show_second_button === true) this.sc.registry.get('buttons')[1].button.setVisible(true);
			_this.sc.registry.get('state')._buttons_enabled = true;
			let _pos = _this.sc.registry.get('path_objects')[0];
			let btn_order = [...Array(_pos.length).keys()];
			if(_this.c.config.randomizeButtons) Phaser.Utils.Array.Shuffle(btn_order);
			this.activate_path_buttons(_pos.length);
			for(let _i = 0; _i < _pos.length; _i++) {
				_this.controls_set_path(_pos[_i].points, btn_order[_i], _pos[_i].is_correct, _i);
			}
		}, callbackScope: this});		
	}

	click_just_started() {
		this.sc.registry.get('state')._just_started = false;
		this.sc.registry.get('state')._correct_selected = true;
//		this.sc.registry.get('buttons')[1].button.setVisible(true);
		this.controls_buttons_enable(true);
	}

	click_path_button(button) {
		this.sc.registry.get('state')._correct_selected = button.is_correct;
		let _all_pos = this.sc.registry.get('path_objects');
		let _pos = _all_pos.shift();						
					
		let _pos_i = button.path_index;
		this.wall_show();
		//let _wall = this.sc.registry.get('walls').shift();
		//if(_wall) _wall.setAlpha(this.c.config.wallOpenAlpha);
					
		if(_pos[_pos_i].nxt && _pos[_pos_i].nxt[0].wall_coords) this.wall_add(_pos[_pos_i].nxt[0]);	
		if(this.c.config.useFarMask) this.add_to_update_queue('move_far_mask', 10);

		this.sc.registry.get('paths').push(_pos[_pos_i].points);
		this.show_path(_pos[_pos_i]);					
					
		if(this.sc.registry.get('state')._correct_selected) {
			if(_pos[_pos_i].nxt) this.sc.registry.get('path_objects').push(_pos[_pos_i].nxt);
			if(_pos[_pos_i].obs) {
				this.draw_obstacles(_pos[_pos_i].obs);
				this.sc.registry.get('obstacles').merge(_pos[_pos_i].obs, true);
			}
			this.add_to_update_queue('generate_new', AutopRand.randint(3,8));
		}
	}
	
	controls_on_click(event, button) {
		if(button.name === 'button_pause') return this.pause();
		if(!this.sc.registry.get('state')._buttons_enabled) return;
		let _ar = button.name.match(/^button_path_(\d+)$/);
		if(!_ar) return;
		let i = parseInt(_ar[1]);
		let buttons = this.sc.registry.get('buttons');		
		if(i >= buttons.length || !buttons[i].button.visible) return;
		let player = this.sc.registry.get('player');
		if(!player.isFollowing()) player.resume();
		if(this.sc.registry.get('state')._just_started) {
			this.click_just_started();
		} else {
			this.click_path_button(buttons[i]);
		}				
		for(let _i2 = 0; _i2 < buttons.length; ++_i2) {
			if(buttons[_i2].button.visible && buttons[_i2].path !== undefined) {
				if(this.c.config.controls.button_disabled_type === 'alpha') {
					buttons[_i2].path.setAlpha(this.c.config.controls.button_disabled_alpha);
				} else if(this.c.config.controls.button_disabled_type === 'tint') {
					buttons[_i2].button.setTint(this.c.config.controls.button_disabled_tint);
					buttons[_i2].path.setTint(this.c.config.controls.button_disabled_tint);
				}				
			}
		}				
		this.sc.registry.get('state')._buttons_enabled = false;				
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
		let cfg;
		let config_id;
		let _all_pos = this.sc.registry.get('path_objects');
		let _pos = this.find_last_paths(_all_pos[_all_pos.length - 1]);
		for(let i = 0; i < _pos.length; i++) {
			let prev_tail = _pos[i].tail;
			config_id = _pos[i].config_id + 1;
			cfg = this.sc.c.get_section_by_id(config_id);
			let pobj_correct = [this.gen_path.setConfig(cfg).generate_path(prev_tail)];	
			pobj_correct[0].config_id = config_id;
			if(this.c.config.twoCorrectChance && (this.c.config.twoCorrectChance < 2 || AutopRand.chanceOneIn(this.c.config.twoCorrectChance))) {
				pobj_correct.push(this.gen_path.generate_path(prev_tail, false, pobj_correct[0].path_x_length));
				pobj_correct[1].config_id = config_id;
			}
			this.generate_wall(pobj_correct[0]);			
			this.add_to_update_queue('generate_new_step2', AutopRand.randint(2,6), [pobj_correct, _pos[i], cfg]);
		}
	}
	
	generate_new_step2(pobj_correct, prev_obj, cfg) {
		//let obs = this.generate_obstacles(pobj_correct);
		//this.add_to_update_queue('generate_new_step3', AutopRand.randint(2,6), [pobj_correct, prev_obj, obs]);		
		let p = new Promise((res, rej) => {
			res(this.generate_obstacles(pobj_correct, cfg));
		});
		p.then((obs) => {
			this.add_to_update_queue('generate_new_step3', AutopRand.randint(2,6), [pobj_correct, prev_obj, obs, cfg]);
		});
	}

	generate_new_step3(pobj_correct, prev_obj, obs, cfg) {
		let prev_tail = prev_obj.tail;
		let pobj_wrong = this.gen_path.setConfig(cfg).generate_path(prev_tail, obs, false, false, {path: pobj_correct[0], value: 0});//tmp
		pobj_wrong.config_id = pobj_correct[0].config_id;
		prev_obj.nxt = [...pobj_correct, pobj_wrong];
		prev_obj.obs = obs;
		
		if(this.c.config.fourPathsChance && this.c.config.maxNumPaths > (pobj_correct.length + 1) && AutopRand.chanceOneIn(this.c.config.fourPathsChance)) {
			let _to_gen = this.c.config.maxNumPaths - pobj_correct.length - 1;
			if(_to_gen > 1) _to_gen = AutopRand.randint(1, _to_gen);
			for(let i = 0; i < _to_gen; i++) {
				this.add_to_update_queue('generate_new_step4', AutopRand.randint(2,6), [prev_obj, obs, pobj_correct, cfg]); //tmp
			}
		}
	}

	generate_new_step4(prev_obj, obs, pobj_correct, cfg) {
		let prev_tail = prev_obj.tail;
		let pobj_wrong = this.gen_path.setConfig(cfg).generate_path(prev_tail, obs, false, false, {path: (pobj_correct.length > 1 ? pobj_correct[1] : pobj_correct[0]), value: 1});//tmp
		pobj_wrong.config_id = pobj_correct[0].config_id;
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
		let minipath_index;
		while(true) {
			minipath_index = '_grs'+((Math.random() * 1000000) | 0);
			texture_name = minipath_index;
			if(!this.sc.sys.textures.exists(texture_name)) break;
		}
		this.sc.registry.get('minipath_indexes').push(minipath_index);
		let btn = this.sc.registry.get('buttons')[button_index];
		if(btn.path !== undefined && btn.path instanceof Phaser.GameObjects.Image && btn.path.active) btn.path.destroy();		
		minipath.lineStyle(...this.c.config.controls.button_path_style);	
		let cfg = this.sc.c.get_section_by_id(this.sc.c.current_config_id + 1);
		btn.path = this.gen_path.setConfig(cfg).minipath(minipath, points, btn, texture_name, (this.c.config.controls.button_path_styles_add ? this.c.config.controls.button_path_styles_add : false), this.sc);
		btn.path.setDepth(-100).setScrollFactor(0);
		if(this.c.config.controls.button_path_path_tint) btn.path.setTint(this.c.config.controls.button_path_path_tint);
		//this.sc.cameras.main.ignore(btn.path);
		btn.path_index = path_index;
		btn.is_correct = is_correct;
		if(this.sc.registry.get('state').dbg) btn.button.setAlpha(is_correct ? 1 : 0.25);//tmp
	}
	
	generate_obstacles(path_objects, cfg) {
		return this.gen_obs.generate(path_objects, cfg);
	}
	
	bg_particle_static(particle, interval, behind, ahead) {
		let px = this.sc.registry.has('player') ? this.sc.registry.get('player').x : 0;
		if(particle.x < (px - behind))  {
			particle.x = px + AutopRand.randint(...ahead);
		} else if(particle.x > (px + ahead[1])) {
			particle.x = px + AutopRand.randint(0, this.c.config._rwhcfg.cfg_w * 2);
		}
		this.sc.time.addEvent({delay: interval, callback: () => {
			this.bg_particle_static(particle, interval, behind, ahead);
		}, callbackScope: this});
	}

	bg_particle_moving(particle, interval, behind, ahead, speed) {
		let px = this.sc.registry.has('player') ? this.sc.registry.get('player').x : 0;
		let _ahead = AutopRand.randint(...ahead);
		particle.x = px + _ahead;
		let distance = _ahead + behind;
		let duration = Math.round((distance / speed) * 5000);

		let tw = this.sc.tweens.add({
			targets: particle,
			x: px - behind,			
			duration: duration,
			onUpdate: () => {
				let px = this.sc.registry.has('player') ? this.sc.registry.get('player').x : 0;
				if(particle.x < (px - behind) || particle.x > (px + ahead[1])) {
					tw.stop();
					this.bg_particle_moving(particle, interval, behind, ahead, speed);
				}					
			},
			onComplete: () => {				
				this.bg_particle_moving(particle, interval, behind, ahead, speed);
				/*this.sc.time.addEvent({delay: interval, callback: () => {
					this.bg_particle_moving(particle, interval, behind, ahead, speed);
				}, callbackScope: this}); */
			}			
		});		
	}	
	
	draw_obstacles(obs) {
		obs.each((_, obs_x) => {
			for(let i = 0; i < obs_x.length; i++) {
				obs_x[i].add_image(this.sc);
				//this.sc.add.image(0, 0, this.c.config.gridCellTextureName).setOrigin(0).setPosition(rects[i].x, rects[i].y);
			}
			return true;
		});					
	}
	
	pause() {
		//console.log('pause');//tmp to delete
		if(!this.sc.registry.get('state').dbg) {
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
		if(!this.c.config.gameOver) return;		
		let _xy = [this.sc.registry.get('player').x, this.sc.registry.get('player').y];
		this.sc.registry.get('player').setAlpha(0);
		if(this.sc.registry.get('player').pathTween.isPlaying()) this.sc.registry.get('player').stop();				
		this.sc.registry.get('player_body_group').manager.setDepth(100);
		this.sc.registry.get('player_body_group').setPosition(..._xy);		
		//this.sc.registry.get('player_body_group').manager.setDepth(100);
		//this.sc.registry.get('player_body_group').setAlpha(0.9).explode(200, ..._xy);
		this.sc.sys.game.registry.set('_do_gameover', true);		
		//this.sc.cameras.cameras.forEach((c) => {c.fade(this.c.config.gameOverFade);});
		this.sc.cameras.main.fade(this.c.config.gameOverFade);
		var _this = this;
		this.sc.time.addEvent({delay: Math.round(this.c.config.gameOverFade * 0.9), callback: function() {	                         				
			_this.sc.scene.stop('PlayMain');			
			_this.c.config.speed = _this.c.config.speed_initial;
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
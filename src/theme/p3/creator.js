import AutopRand from '../../util/autoprand';

class AutopCreator {

	constructor(scene) {
		this.sc = scene;
		this.c = this.sc.c;
	//	this.cfg = this.sc.cfg;
	}

	create() {
		this.masks();
		this.background();
		this.show_path();
		this.controls();
		this.controls_buttons();
		this.player();
		this.player_body();
		this.obstacles();
		this.wall();		
		this.section_counter();	
		this.bg_particles();
		
		//tmp
		/*
		let __g = 0.1;
		let grs_rect = this.sc.make.graphics();
		grs_rect.fillStyle(0xdedede);//tmp
		grs_rect.fillRect(0, 0, Math.round(this.sc.sys.game.config.width * __g), this.sc.sys.game.config.height);
		//grs_rect.lineStyle(...[10, 0xffffff, 1]);
		//grs_rect.strokeRect(0, 0, Math.round(this.sc.sys.game.config.width * __g), this.sc.sys.game.config.height);		
		grs_rect.generateTexture('_tmp1111', Math.round(this.sc.sys.game.config.width * __g), this.sc.sys.game.config.height); 		
		let __img = this.sc.add.image(0, 0, '_tmp1111').setDepth(100).setOrigin(0).setPosition(Math.round(this.sc.sys.game.config.width * (1 - __g)), 0);
		__img.alphaTopLeft = 0;
		__img.alphaBottomLeft = 0;
		if(this.sc.cameras.cameras.length > 1) this.sc.cameras.cameras[1].ignore(__img);
		*/
	}
	
	masks() {
		let texture_name = 'mask_black';
		if(this.sc.textures.exists(texture_name)) {
			this.sc.textures.get(texture_name).destroy();
			delete this.sc.textures.list[texture_name];	
		}
		let gr1 = this.sc.make.graphics();
		gr1.fillStyle(0x000000, 1);
		gr1.fillRect(0, 0, this.c.config._rwhcfg.cfg_w, this.c.config._rwhcfg.cfg_h);
		this.sc.registry.set('mask1', gr1);
		let gr2 = this.sc.make.graphics();
		gr2.fillStyle(0x000000, 1);
		gr2.fillRect(0, 0, this.c.config._rwhcfg.cfg_w, this.c.config._rwhcfg.cfg_h);
		this.sc.registry.set('mask2', gr2);

//		gr.fillRect(0, 0, this.sc.sys.game.config.width, this.sc.sys.game.config.height);
/*		gr.generateTexture(texture_name, this.sc.sys.game.config.width, this.sc.sys.game.config.height);	
		for(let i = 1; i <= 3; i++) {
			this.sc.registry.set('mask'+i, this.sc.make.image({
					x: -(this.sc.sys.game.config.width / 2),
					y: this.sc.sys.game.config.height / 2,
					key: texture_name,
					add: false
				})
			);
		}*/
//		this.sc.registry.get('mask1').setPosition(-(this.sc.sys.game.config.width / 2), this.sc.sys.game.config.height / 2);
		this.sc.registry.get('mask1').setPosition(-this.c.config._rwhcfg.cfg_w, 0);
		this.sc.registry.get('mask2').setPosition(0, 0);
//		this.sc.registry.get('mask2').setOrigin(0).setPosition(0, 0);
	}

	background() {
		//this.sc.sys.game.textures.create('bg_dark', this.sc.sys.game.textures.get('bg_dark_src').getSourceImage(), this.sc.sys.game.config.width, this.sc.sys.game.config.height).add('__BASE', 0, 0, 0, this.sc.sys.game.config.width, this.sc.sys.game.config.height);
		//this.sc.sys.game.textures.get('bg_dark').add('bg_dark_resized', 0, 0, 0, this.sc.sys.game.config.width, this.sc.sys.game.config.height);
		let bg = this.sc.add.tileSprite(0, 0, Phaser.Math.Pow2.GetNext(this.sc.sys.game.config.width), Phaser.Math.Pow2.GetNext(this.sc.sys.game.config.height), 'bg_dark').setOrigin(0).setDepth(-1080);
		//let bg = this.sc.add.image(0, 0, 'bg_dark').setOrigin(0).setDisplaySize(this.sc.sys.game.config.width, this.sc.sys.game.config.height);
//		bg.setScrollFactor(0);
//		if(this.sc.cameras.cameras.length > 1) this.sc.cameras.cameras[1].ignore(bg);
		this.sc.registry.set('bg', bg);
		//this.sc.add.image(0, 0, 'bg_dark').setOrigin(0).setSize(this.sc.sys.game.config.width, this.sc.sys.game.config.height).setPosition(this.sc.sys.game.config.width, 0);		
	}

	bg_particles() {
		let offset_ahead = [Math.round(this.c.config._rwhcfg.cfg_w * (1 - this.c.config.cameraOffset) + 50)];
		offset_ahead.push(offset_ahead[0] + this.c.config._rwhcfg.cfg_w);
		let offset_behind = Math.round(this.c.config._rwhcfg.cfg_w * this.c.config.cameraOffset + 50);
		let rect = new Phaser.Geom.Rectangle(0, 50, this.c.config._rwhcfg.cfg_w * 2, this.c.config._rwhcfg.cfg_h - 100);

		for(let i = 0; i < this.c.config.bg_particles.length; i++) {
			let cfg = this.c.config.bg_particles[i];			
			let grps = {};
			grps.s = this.sc.make.group({
				classType: Phaser.GameObjects.Image, 
				key: ('bg_particle'+i), quantity: 1, repeat: (cfg.total - cfg.moving)
			});
			grps.m = this.sc.make.group({
				classType: Phaser.GameObjects.Image, 
				key: ('bg_particle'+i), quantity: 1, repeat: cfg.moving
			});
			['s', 'm'].forEach((_k) => {
				let grp = grps[_k];
				grp.setDepth(-200);	
				Phaser.Actions.RandomRectangle(grp.getChildren(), rect);
				grp.getChildren().forEach((ch) => {
					ch.setAlpha(Math.random() * (cfg.alpha[1] - cfg.alpha[0]) + cfg.alpha[0]);
					ch.setScale(Math.random() * (cfg.scale[1] - cfg.scale[0]) + cfg.scale[0]);
					if(_k === 's') {
						this.sc.lib.bg_particle_static(ch, AutopRand.randint(...cfg.pause), offset_behind, offset_ahead);
					} else {
						let _s = Math.random();
						//if(_s > 0.7) {
						//	_s = _s + (1 - _s) / 2;
						//} else 
						if(_s < 0.4) {
							_s = _s / 2;
						}
						let speed = (cfg.speed[1] - cfg.speed[0]) * _s + cfg.speed[0];
						this.sc.lib.bg_particle_moving(ch, AutopRand.randint(...cfg.pause), offset_behind, offset_ahead, speed);					
					}
				});
			});
		}
	}
	
	show_path() {
		/*if(!this.c.config.showPaths) return;
		let gr = this.sc.make.graphics();
		gr.fillStyle(this.c.config.showPathStyle[1], this.c.config.showPathStyle[2]);
		gr.fillCircle(this.c.config.showPathRadius, this.c.config.showPathRadius, this.c.config.showPathRadius).generateTexture(this.c.config.showPathTextureName, this.c.config.showPathRadius * 2, this.c.config.showPathRadius * 2);*/
	}
	
	controls() {
		this.sc.registry.set('button_pause', {button: this.sc.add.image(Math.round(this.sc.sys.game.config.width * this.c.config.controls.pause_button_x_position), Math.round(this.sc.sys.game.config.height - this.c.config.heightControls * 0.5), 'pause').setInteractive().setName('button_pause')});		
		this.sc.lib._set_button_bounds('button_pause');
		this.sc.registry.get('button_pause').button.setScrollFactor(0);
//		this.sc.cameras.main.ignore(this.sc.registry.get('button_pause').button);
		/*var gr_separator_line = this.sc.add.graphics();		
		gr_separator_line.lineStyle(...this.c.config.controls.separator_line_style);	
		let _l = new Phaser.Curves.Line([0, this.c.config.heightField + 1, this.sc.sys.game.config.width + 1, this.c.config.heightField + 1]);
		_l.draw(gr_separator_line, this.sc.sys.game.config.width + 1);
		
		this.sc.cameras.main.ignore([this.sc.registry.get('button_pause').button, gr_separator_line]);*/
	}	

	controls_buttons() {
		let _tmp = [this.c.config.pathLength,  (1 - this.c.config.heightControlsRate)];
		if(this.rwh) _tmp.reverse();
		let button_width = Math.round(this.sc.sys.game.config.width * _tmp[0] * this.c.config.heightControlsRate * this.c.config.controls.button_height);
		let button_height = Math.round(this.sc.sys.game.config.height * _tmp[1] * this.c.config.heightControlsRate * this.c.config.controls.button_height);	
		
		//var grs_rect = this.sc.make.graphics();
		//grs_rect.lineStyle(...this.c.config.controls.button_bounds_style);
		//grs_rect.strokeRect(0, 0, button_width, button_height).generateTexture('button_bounds', button_width, button_height); 
		//b.button.texture.frames[b.button.texture.firstFrame].customData
		for(let i = 0; i < this.c.config.maxNumPaths; i++) {
			let _btn = this.sc.add.image(0, 0, 'path_buttons', 'button_on').setInteractive().setVisible(false).setName('button_path_'+i).setScrollFactor(0).setDisplaySize(button_width, button_height).setDepth(-10);
			if(this.c.config.controls.button_path_tint) _btn.setTint(this.c.config.controls.button_path_tint);			
			this.sc.registry.get('buttons').push({button: _btn});
			let _cdata = this.sc.textures.get('path_buttons').frames['button_sh'].customData;
			let _sh = this.sc.add.image(0, 0, 'path_buttons', 'button_sh').setVisible(false).setName('button_sh_'+i).setScrollFactor(0).setDisplaySize(button_width * (1 / _cdata.w_factor), button_height * (1 / _cdata.h_factor)).setDepth(-11);
			this.sc.registry.get('buttons')[this.sc.registry.get('buttons').length - 1].shadow = _sh;
			this.sc.registry.get('buttons')[this.sc.registry.get('buttons').length - 1].shadow_data = _cdata;			
			//this.sc.registry.get('buttons').push({button: this.sc.add.image(0, 0, 'button_bounds').setInteractive().setVisible(false).setName('button_path_'+i)});			
		}
		this.sc.lib.activate_path_buttons(2);//tmp
		this.sc.registry.get('buttons')[1].button.setVisible(false);//tmp
		this.sc.registry.get('buttons')[1].shadow.setVisible(false);
		/*for(let i = 0; i < this.sc.registry.get('buttons').length; i++) {
			this.sc.registry.get('buttons')[i].button.setScrollFactor(0)
//			this.sc.cameras.main.ignore(this.sc.registry.get('buttons')[i].button);
		}*/
	}
	
	player() {
//		var _player_graphics = this.sc.make.graphics();
//		_player_graphics.fillStyle(this.c.config.playerFillStyle).fillTriangle(...this.c.config.playerTrianglePoints).generateTexture('player', ...this.c.config.playerWidthHeight);
	}
	
	player_body() {	
		var p = this.sc.add.particles('player_body_particle').createEmitter(this.c.config.player_body_emitter.emitter).setPosition(-200, 0);		
		/* //tmp
		//this.c.config.player_body_emitter.zone.source = new Phaser.Geom.Circle(0, 0, Math.round(this.c.config.playerWidthHeight[0] * 0.5));
		//this.c.config.player_body_emitter.zone.source = new Phaser.Geom.Triangle(-100, -50, 0, 0, -100, 50);
		//p.setEmitZone(this.c.config.player_body_emitter.zone);
		//p.setFrequency(0.1);
		//p.reserve(10); */
		p.visible = 0;
		this.sc.registry.set('player_body_group', p);
	}	

	obstacles(config) {
		if(config === undefined) config = this.c.config;
		let ots = {};
		let cell_scales = config.gen_obs.gridCellScales.map((_x) => _x[0]);
		cell_scales.forEach((_x) => {
			ots['x'+_x] = {};
		});
		let texture = this.sc.textures.get(config.gen_obs.texture_root);
		let frames = texture.getFrameNames();
		Phaser.Utils.Array.Shuffle(frames);
		
		let _i = 0;
		frames.forEach((_f) => {
			let n = cell_scales[_i];			
			let fr = this.sc.textures.getFrame(config.gen_obs.texture_root, _f);
			let _scale_to = (1 + config.gen_obs.img_scaling_step * n * (Math.random() - 1)) * config.grid * n;
			let cdata = Phaser.Utils.Objects.Extend(true, {}, fr.customData);
			cdata.scale = [Math.round((_scale_to / fr.width) * 100) * 0.01, Math.round((_scale_to / fr.height) * 100) * 0.01];
			
			if(cdata.type === 'rect') {
				cdata.shape_data = [cdata.center.x - cdata.radius, cdata.center.y - cdata.radius, cdata.radius * 2, cdata.radius * 2].map((_x) => Math.round(_x * cdata.scale[0]));
			} else {
				cdata.shape_data = [cdata.center.x, cdata.center.y, cdata.radius].map((_x) => Math.round(_x * cdata.scale[0]));
			}			
			
			cdata.offset_x = Math.floor(config.grid * n - _scale_to);
			cdata.offset_y = cdata.offset_x;
			ots['x'+cell_scales[_i]][_f] = cdata;
			_i = _i === (cell_scales.length - 1) ? 0 : _i + 1;			
		});
		this.sc.registry.set('obstacle_textures'+config.gen_obs.obs_set_sfx, ots);
		
		/* //tmp to delete
		if(this.sc.textures.exists(config.gridCellTextureName)) this.sc.textures.get(config.gridCellTextureName).destroy();//tmp
		var grs_rect = this.sc.make.graphics();
		//grs_rect.fillStyle(config.gridCellFillStyle);//tmp
		grs_rect.fillStyle(AutopRand.randint(0, 0xffffff));//tmp
		grs_rect.fillRect(0, 0, config.grid, config.grid);
		if(config.gridCellLineStyle) {
			grs_rect.lineStyle(...config.gridCellLineStyle);//1, 0xffffff, 1		
			grs_rect.strokeRect(0, 0, config.grid, config.grid);
		}
		grs_rect.generateTexture(config.gridCellTextureName, config.grid, config.grid); 
		*/		
		/*
		for(let i = 0; i < config.gridCellScales.length; i++) {
			let n = config.gridCellScales[i];			
			if(this.sc.textures.exists(config.gridCellTextureName+n)) {
				this.sc.textures.get(config.gridCellTextureName+n).destroy();
				if(this.sc.textures.list.hasOwnProperty(config.gridCellTextureName+n)) delete this.sc.textures.list[config.gridCellTextureName+n];
			}			
			let grs_rect = this.sc.make.graphics();
			//grs_rect.fillStyle(config.gridCellFillStyle);//tmp
			grs_rect.fillStyle(AutopRand.randint(0, 0xffffff));//tmp
			grs_rect.fillRect(0, 0, config.grid * n, config.grid * n);
			if(config.gridCellLineStyle) {
				grs_rect.lineStyle(...config.gridCellLineStyle);//1, 0xffffff, 1		
				grs_rect.strokeRect(0, 0, config.grid * n, config.grid * n);
			}
			grs_rect.generateTexture(config.gridCellTextureName+n, config.grid * n, config.grid * n); 			
			this.sc.textures.get(config.gridCellTextureName+n).customData.shape_data = [0, 0, config.grid * n, config.grid * n];			
			this.sc.textures.get(config.gridCellTextureName+n).customData.type = 'rect';
			ots['x'+n] = config.gridCellTextureName+n;
		}
		*/
			
	}

	wall() {
		this.c.config.wallWidth = this.sc.textures.get(this.c.config.wallTextureName).get().width;
		this.c.config.wallHeight = this.sc.textures.get(this.c.config.wallTextureName).get().height;
		let total = Math.floor(this.c.config.heightField / (this.c.config.wallHeight + 2));
		let offset = Math.round((this.c.config.heightField % (this.c.config.wallHeight + 2)) / 2);
		let grp = this.sc.make.group({
			classType: Phaser.GameObjects.Image, 
			key: this.c.config.wallTextureName, quantity: 1, repeat: -1, max: total, visible: false, 
			gridAlign: {
				width: 1, height: -1, 
				cellWidth: (this.c.config.wallWidth + 2), cellHeight: (this.c.config.wallHeight + 2),
				y: offset
			}
		});
		grp.setDepth(-10);
		this.sc.registry.set('wall_group', grp);

		/*
		var grs_rect = this.sc.make.graphics();		
		grs_rect.fillStyle(this.c.config.wallStyle);
		let _wh = [this.c.config.wallWidth, this.c.config.heightField];
		if(this.rwh) _wh.reverse();
		grs_rect.fillRect(0, 0, ..._wh).generateTexture(this.c.config.wallTextureName, ..._wh); */
	}	

	section_counter() {
		let counter = this.sc.add.text(50, this.c.config.heightField + this.c.config.heightControls * 0.5 - 20, '0', this.c.config.sectionCounterStyle);
		counter.setScrollFactor(0);
//		this.sc.cameras.main.ignore(counter);
		this.sc.registry.set(this.c.config.sectionCounterName, counter);
	}
	

}

export default AutopCreator
import AutopRand from '../../util/autoprand';

class AutopCreator {

	constructor(scene) {
		this.sc = scene;
		this.cfg = this.sc.cfg;
	}

	create() {
		this.background();
		this.show_path();
		this.controls();
		this.controls_buttons();
		this.player();
		this.player_body();
		this.obstacles();
		this.wall();		
		this.section_counter();		
		
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

	background() {
		//this.sc.sys.game.textures.create('bg_dark', this.sc.sys.game.textures.get('bg_dark_src').getSourceImage(), this.sc.sys.game.config.width, this.sc.sys.game.config.height).add('__BASE', 0, 0, 0, this.sc.sys.game.config.width, this.sc.sys.game.config.height);
		//this.sc.sys.game.textures.get('bg_dark').add('bg_dark_resized', 0, 0, 0, this.sc.sys.game.config.width, this.sc.sys.game.config.height);
		let bg = this.sc.add.tileSprite(0, 0, this.sc.sys.game.config.width, this.sc.sys.game.config.height, 'bg_dark').setOrigin(0).setDepth(-1080);
		//let bg = this.sc.add.image(0, 0, 'bg_dark').setOrigin(0).setDisplaySize(this.sc.sys.game.config.width, this.sc.sys.game.config.height);
		if(this.sc.cameras.cameras.length > 1) this.sc.cameras.cameras[1].ignore(bg);
		this.sc.registry.set('bg', bg);
		//this.sc.add.image(0, 0, 'bg_dark').setOrigin(0).setSize(this.sc.sys.game.config.width, this.sc.sys.game.config.height).setPosition(this.sc.sys.game.config.width, 0);		
	}

	show_path() {
		if(!this.cfg.showPaths) return;
		let gr = this.sc.make.graphics();
		gr.fillStyle(this.cfg.showPathStyle[1], this.cfg.showPathStyle[2]);
		gr.fillCircle(this.cfg.showPathRadius, this.cfg.showPathRadius, this.cfg.showPathRadius).generateTexture(this.cfg.showPathTextureName, this.cfg.showPathRadius * 2, this.cfg.showPathRadius * 2);		
	}
	
	controls() {
		this.sc.registry.set('button_pause', {button: this.sc.add.image(Math.round(this.sc.sys.game.config.width * this.cfg.controls.pause_button_x_position), Math.round(this.sc.sys.game.config.height - this.cfg.heightControls * 0.5), 'pause').setInteractive()});		
		this.sc.lib._set_button_bounds('button_pause');
		this.sc.cameras.main.ignore(this.sc.registry.get('button_pause').button);
		/*var gr_separator_line = this.sc.add.graphics();		
		gr_separator_line.lineStyle(...this.cfg.controls.separator_line_style);	
		let _l = new Phaser.Curves.Line([0, this.cfg.heightField + 1, this.sc.sys.game.config.width + 1, this.cfg.heightField + 1]);
		_l.draw(gr_separator_line, this.sc.sys.game.config.width + 1);
		
		this.sc.cameras.main.ignore([this.sc.registry.get('button_pause').button, gr_separator_line]);*/
	}	

	controls_buttons() {
		let _tmp = [this.cfg.pathLength,  (1 - this.cfg.heightControlsRate)];
		if(this.rwh) _tmp.reverse();
		let button_width = Math.round(this.sc.sys.game.config.width * _tmp[0] * this.cfg.heightControlsRate * this.cfg.controls.button_height);
		let button_height = Math.round(this.sc.sys.game.config.height * _tmp[1] * this.cfg.heightControlsRate * this.cfg.controls.button_height);	
		
		var grs_rect = this.sc.make.graphics();
		grs_rect.lineStyle(...this.cfg.controls.button_bounds_style);
		grs_rect.strokeRect(0, 0, button_width, button_height).generateTexture('button_bounds', button_width, button_height); 
		for(let i = 0; i < this.cfg.maxNumPaths; i++) {
			this.sc.registry.get('buttons').push({button: this.sc.add.image(0, 0, 'button_bounds').setInteractive().setVisible(false)});
		}
		this.sc.lib.activate_path_buttons(2);//tmp
		this.sc.registry.get('buttons')[1].button.setVisible(false);//tmp
		for(let i = 0; i < this.sc.registry.get('buttons').length; i++) {
			this.sc.cameras.main.ignore(this.sc.registry.get('buttons')[i].button);
		}
	}
	
	player() {
//		var _player_graphics = this.sc.make.graphics();
//		_player_graphics.fillStyle(this.cfg.playerFillStyle).fillTriangle(...this.cfg.playerTrianglePoints).generateTexture('player', ...this.cfg.playerWidthHeight);
	}
	
	player_body() {	
		var p = this.sc.add.particles('player_body_particle').createEmitter(this.cfg.player_body_emitter.emitter);		
		/* //tmp
		//this.cfg.player_body_emitter.zone.source = new Phaser.Geom.Circle(0, 0, Math.round(this.cfg.playerWidthHeight[0] * 0.5));
		//this.cfg.player_body_emitter.zone.source = new Phaser.Geom.Triangle(-100, -50, 0, 0, -100, 50);
		//p.setEmitZone(this.cfg.player_body_emitter.zone);
		//p.setFrequency(0.1);
		//p.reserve(10); */
		p.visible = 0;
		this.sc.registry.set('player_body_group', p);
	}	

	obstacles() {
		let ots = {};
		let cell_scales = this.cfg.gen_obs.gridCellScales.map((_x) => _x[0]);
		cell_scales.forEach((_x) => {
			ots['x'+_x] = [];
		});
		let texture = this.sc.textures.get(this.cfg.gen_obs.texture_root);
		let frames = texture.getFrameNames();
		Phaser.Utils.Array.Shuffle(frames);
		
		let _i = 0;
		frames.forEach((_f) => {
			let n = cell_scales[_i];			
			let fr = this.sc.textures.getFrame(this.cfg.gen_obs.texture_root, _f);
			let _scale_to = (1 + this.cfg.gen_obs.img_scaling_step * n * (Math.random() - 1)) * this.cfg.grid * n;
			fr.customData.scale = [Math.round((_scale_to / fr.width) * 100) * 0.01, Math.round((_scale_to / fr.height) * 100) * 0.01];
			
			if(fr.customData.type === 'rect') {
				fr.customData.shape_data = [fr.customData.center.x - fr.customData.radius, fr.customData.center.y - fr.customData.radius, fr.customData.radius * 2, fr.customData.radius * 2].map((_x) => Math.round(_x * fr.customData.scale[0]));
			} else {
				fr.customData.shape_data = [fr.customData.center.x, fr.customData.center.y, fr.customData.radius].map((_x) => Math.round(_x * fr.customData.scale[0]));
			}			
			
			fr.customData.offset_x = Math.floor(this.cfg.grid * n - _scale_to);
			fr.customData.offset_y = fr.customData.offset_x;
			ots['x'+cell_scales[_i]].push(_f);
			_i = _i === (cell_scales.length - 1) ? 0 : _i + 1;			
		});
		
		/* //tmp to delete
		if(this.sc.textures.exists(this.cfg.gridCellTextureName)) this.sc.textures.get(this.cfg.gridCellTextureName).destroy();//tmp
		var grs_rect = this.sc.make.graphics();
		//grs_rect.fillStyle(this.cfg.gridCellFillStyle);//tmp
		grs_rect.fillStyle(AutopRand.randint(0, 0xffffff));//tmp
		grs_rect.fillRect(0, 0, this.cfg.grid, this.cfg.grid);
		if(this.cfg.gridCellLineStyle) {
			grs_rect.lineStyle(...this.cfg.gridCellLineStyle);//1, 0xffffff, 1		
			grs_rect.strokeRect(0, 0, this.cfg.grid, this.cfg.grid);
		}
		grs_rect.generateTexture(this.cfg.gridCellTextureName, this.cfg.grid, this.cfg.grid); 
		*/		
		/*
		for(let i = 0; i < this.cfg.gridCellScales.length; i++) {
			let n = this.cfg.gridCellScales[i];			
			if(this.sc.textures.exists(this.cfg.gridCellTextureName+n)) {
				this.sc.textures.get(this.cfg.gridCellTextureName+n).destroy();
				if(this.sc.textures.list.hasOwnProperty(this.cfg.gridCellTextureName+n)) delete this.sc.textures.list[this.cfg.gridCellTextureName+n];
			}			
			let grs_rect = this.sc.make.graphics();
			//grs_rect.fillStyle(this.cfg.gridCellFillStyle);//tmp
			grs_rect.fillStyle(AutopRand.randint(0, 0xffffff));//tmp
			grs_rect.fillRect(0, 0, this.cfg.grid * n, this.cfg.grid * n);
			if(this.cfg.gridCellLineStyle) {
				grs_rect.lineStyle(...this.cfg.gridCellLineStyle);//1, 0xffffff, 1		
				grs_rect.strokeRect(0, 0, this.cfg.grid * n, this.cfg.grid * n);
			}
			grs_rect.generateTexture(this.cfg.gridCellTextureName+n, this.cfg.grid * n, this.cfg.grid * n); 			
			this.sc.textures.get(this.cfg.gridCellTextureName+n).customData.shape_data = [0, 0, this.cfg.grid * n, this.cfg.grid * n];			
			this.sc.textures.get(this.cfg.gridCellTextureName+n).customData.type = 'rect';
			ots['x'+n] = this.cfg.gridCellTextureName+n;
		}
		*/
		this.sc.registry.set('obstacle_textures', ots);		
	}

	wall() {
		var grs_rect = this.sc.make.graphics();		
		grs_rect.fillStyle(this.cfg.wallStyle);
		let _wh = [this.cfg.wallWidth, this.cfg.heightField];
		if(this.rwh) _wh.reverse();
		grs_rect.fillRect(0, 0, ..._wh).generateTexture(this.cfg.wallTextureName, ..._wh); 
	}	

	section_counter() {
		let counter = this.sc.add.text(50, this.cfg.heightField + this.cfg.heightControls * 0.5 - 20, '0', this.cfg.sectionCounterStyle);
		this.sc.cameras.main.ignore(counter);
		this.sc.registry.set(this.cfg.sectionCounterName, counter);
	}
	

}

export default AutopCreator
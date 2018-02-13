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
		this.grid_cell();
		this.wall();		
		this.section_counter();		
	}

	background() {
		//this.sc.game.textures.create('bg_dark', this.sc.game.textures.get('bg_dark_src').getSourceImage(), this.sc.game.config.width, this.sc.game.config.height).add('__BASE', 0, 0, 0, this.sc.game.config.width, this.sc.game.config.height);
		//this.sc.game.textures.get('bg_dark').add('bg_dark_resized', 0, 0, 0, this.sc.game.config.width, this.sc.game.config.height);
		let bg = this.sc.add.tileSprite(0, 0, this.sc.game.config.width, this.sc.game.config.height, 'bg_dark').setOrigin(0).setDepth(-1080);
		//let bg = this.sc.add.image(0, 0, 'bg_dark').setOrigin(0).setDisplaySize(this.sc.game.config.width, this.sc.game.config.height);
		if(this.sc.cameras.cameras.length > 1) this.sc.cameras.cameras[1].ignore(bg);
		this.sc.registry.set('bg', bg);
		//this.sc.add.image(0, 0, 'bg_dark').setOrigin(0).setSize(this.sc.game.config.width, this.sc.game.config.height).setPosition(this.sc.game.config.width, 0);		
	}

	show_path() {
		if(!this.cfg.showPaths) return;
		let gr = this.sc.make.graphics();
		gr.fillStyle(this.cfg.showPathStyle[1], this.cfg.showPathStyle[2]);
		gr.fillCircle(this.cfg.showPathRadius, this.cfg.showPathRadius, this.cfg.showPathRadius).generateTexture(this.cfg.showPathTextureName, this.cfg.showPathRadius * 2, this.cfg.showPathRadius * 2);		
	}
	
	controls() {
		this.sc.registry.set('button_pause', {button: this.sc.add.image(Math.round(this.sc.game.config.width * this.cfg.controls.pause_button_x_position), Math.round(this.sc.game.config.height - this.cfg.heightControls * 0.5), 'pause').setInteractive()});		
		this.sc.lib._set_button_bounds('button_pause');
		this.sc.cameras.main.ignore(this.sc.registry.get('button_pause').button);
		/*var gr_separator_line = this.sc.add.graphics();		
		gr_separator_line.lineStyle(...this.cfg.controls.separator_line_style);	
		let _l = new Phaser.Curves.Line([0, this.cfg.heightField + 1, this.sc.game.config.width + 1, this.cfg.heightField + 1]);
		_l.draw(gr_separator_line, this.sc.game.config.width + 1);
		
		this.sc.cameras.main.ignore([this.sc.registry.get('button_pause').button, gr_separator_line]);*/
	}	

	controls_buttons() {
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
/*		var gr = this.sc.make.graphics();
		let radius = Math.round(this.cfg.playerWidthHeight[0] * 0.5);
		gr.fillStyle(this.cfg.playerFillStyle).fillCircle(0, 0, radius).generateTexture('player_body', radius, radius);
		let g = this.sc.add.group({key: 'player_body', frameQuantity: this.cfg.playerNumBodyParts });
		g.visible = 0;
		for(let i = 0; i < g.getChildren().length; i++) {
			//g.getChildren()[i].setAlpha(Phaser.Math.Easing.Stepped(i / g.getChildren().length, this.cfg.playerBodyEaSteps)); 
			g.getChildren()[i].setAlpha(Phaser.Math.Easing.Sine.Out(i / g.getChildren().length) * 0.75);
		}
		this.sc.registry.set('player_body_group', g);*/
	}	

	grid_cell() {
		if(this.sc.sys.textures.exists(this.cfg.gridCellTextureName)) delete this.sc.sys.textures.list[this.cfg.gridCellTextureName];//tmp
		var grs_rect = this.sc.make.graphics();
		//grs_rect.fillStyle(this.cfg.gridCellFillStyle);//tmp
		grs_rect.fillStyle(AutopRand.randint(0, 0xffffff));//tmp
		grs_rect.fillRect(0, 0, this.cfg.grid, this.cfg.grid);
		if(this.cfg.gridCellLineStyle) {
			grs_rect.lineStyle(...this.cfg.gridCellLineStyle);//1, 0xffffff, 1		
			grs_rect.strokeRect(0, 0, this.cfg.grid, this.cfg.grid);
		}
		grs_rect.generateTexture(this.cfg.gridCellTextureName, this.cfg.grid, this.cfg.grid); 
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
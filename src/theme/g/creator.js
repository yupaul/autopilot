import AutopRand from '../../util/autoprand';

class AutopCreator {

	constructor(scene) {
		this.sc = scene;
		this.c = this.sc.c;
//		this.cfg = this.sc.cfg;
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
	}

	background() {

	}

	show_path() {
		if(!this.c.config.showPaths) return;
		let gr = this.sc.make.graphics();
		gr.fillStyle(this.c.config.show_path.styles[0][1], this.c.config.show_path.styles[0][2]);
		gr.fillCircle(this.c.config.show_path.radius, this.c.config.show_path.radius, this.c.config.show_path.radius).generateTexture(this.c.config.show_path.texture_name, this.c.config.show_path.radius * 2, this.c.config.show_path.radius * 2);		
	}
	
	controls() {
		this.sc.registry.set('button_pause', {button: this.sc.add.image(Math.round(this.sc.sys.game.config.width * this.c.config.controls.pause_button_x_position), Math.round(this.sc.sys.game.config.height - this.c.config.heightControls * 0.5), 'pause').setInteractive()});
		this.sc.lib._set_button_bounds('button_pause');
		var gr_separator_line = this.sc.add.graphics();
		gr_separator_line.lineStyle(...this.c.config.controls.separator_line_style);	
		let _l = new Phaser.Curves.Line([0, this.c.config.heightField + 1, this.sc.sys.game.config.width + 1, this.c.config.heightField + 1]);
		_l.draw(gr_separator_line, this.sc.sys.game.config.width + 1);		
	}	

	controls_buttons() {
		let _tmp = [this.c.config.pathLength,  (1 - this.c.config.heightControlsRate)];
		if(this.rwh) _tmp.reverse();
		let button_width = Math.round(this.sc.sys.game.config.width * _tmp[0] * this.c.config.heightControlsRate * this.c.config.controls.button_height);
		let button_height = Math.round(this.sc.sys.game.config.height * _tmp[1] * this.c.config.heightControlsRate * this.c.config.controls.button_height);	
		
		var grs_rect = this.sc.make.graphics();
		grs_rect.lineStyle(...this.c.config.controls.button_bounds_style);
		grs_rect.strokeRect(0, 0, button_width, button_height).generateTexture('button_bounds', button_width, button_height); 
		for(let i = 0; i < this.c.config.maxNumPaths; i++) {
			this.sc.registry.get('buttons').push({button: this.sc.add.image(0, 0, 'button_bounds').setInteractive().setVisible(false)});
		}
		this.sc.lib.activate_path_buttons(2);//tmp
		this.sc.registry.get('buttons')[1].button.setVisible(false);//tmp
	}
	
	player() {
		var _player_graphics = this.sc.make.graphics();
		_player_graphics.fillStyle(this.c.config.playerFillStyle).fillTriangle(...this.c.config.playerTrianglePoints).generateTexture('player', ...this.c.config.playerWidthHeight);
	}
	
	player_body() {
		var gr = this.sc.make.graphics();
		let radius = Math.round(this.c.config.playerWidthHeight[0] * 0.5);
		gr.fillStyle(this.c.config.playerFillStyle).fillCircle(0, 0, radius).generateTexture('player_body', radius, radius);
		let g = this.sc.add.group({key: 'player_body', frameQuantity: this.c.config.playerNumBodyParts });
		g.visible = 0;
		for(let i = 0; i < g.getChildren().length; i++) {
			//g.getChildren()[i].setAlpha(Phaser.Math.Easing.Stepped(i / g.getChildren().length, this.c.config.playerBodyEaSteps)); 
			g.getChildren()[i].setAlpha(Phaser.Math.Easing.Sine.Out(i / g.getChildren().length) * 0.75);
		}
		this.sc.registry.set('player_body_group', g);
	}	

	obstacles() {		
		var ots = {};
		for(let i = 0; i < this.c.config.gridCellScales.length; i++) {
			let n = this.c.config.gridCellScales[i];			
			if(this.sc.textures.exists(this.c.config.gridCellTextureName+n)) {
				this.sc.textures.get(this.c.config.gridCellTextureName+n).destroy();
				if(this.sc.textures.list.hasOwnProperty(this.c.config.gridCellTextureName+n)) delete this.sc.textures.list[this.c.config.gridCellTextureName+n];
			}			
			let grs_rect = this.sc.make.graphics();
			//grs_rect.fillStyle(this.c.config.gridCellFillStyle);//tmp
			grs_rect.fillStyle(AutopRand.randint(0, 0xffffff));//tmp
			grs_rect.fillRect(0, 0, this.c.config.grid * n, this.c.config.grid * n);
			if(this.c.config.gridCellLineStyle) {
				grs_rect.lineStyle(...this.c.config.gridCellLineStyle);//1, 0xffffff, 1		
				grs_rect.strokeRect(0, 0, this.c.config.grid * n, this.c.config.grid * n);
			}
			grs_rect.generateTexture(this.c.config.gridCellTextureName+n, this.c.config.grid * n, this.c.config.grid * n); 			
			this.sc.textures.get(this.c.config.gridCellTextureName+n).customData.shape_data = [0, 0, this.c.config.grid * n, this.c.config.grid * n];			
			this.sc.textures.get(this.c.config.gridCellTextureName+n).customData.type = 'rect';
			ots['x'+n] = this.c.config.gridCellTextureName+n;
		}
		this.sc.registry.set('obstacle_textures', ots);		
	}

	wall() {
		var grs_rect = this.sc.make.graphics();		
		grs_rect.fillStyle(this.c.config.wallStyle);
		let _wh = [this.c.config.wallWidth, this.c.config.heightField];
		if(this.rwh) _wh.reverse();
		grs_rect.fillRect(0, 0, ..._wh).generateTexture(this.c.config.wallTextureName, ..._wh); 
	}	

	section_counter() {
		this.sc.registry.set(this.c.config.sectionCounterName, this.sc.add.text(50, this.c.config.heightField + this.c.config.heightControls * 0.5 - 20, '0', this.c.config.sectionCounterStyle));
	}
	

}

export default AutopCreator
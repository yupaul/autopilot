
import Immutable from 'immutable';

import _config_game from './game';
import {_config_global} from './global';

import PlayMain from '../scene/play_main';
import Menu from '../scene/menu';

class AutopConfigurator {
	
	constructor(config_global, config_game, scenes) {
		this._config_game;						
		this._config_global;
		this.config_boot;
		this.config_boot_menu;		
		this.config;
		this.config_menu;		
		this.set_global(config_global);
		this.set_game(config_game, scenes);				
		this.theme = require('../theme/'+this._config_global.theme_name);		
		this.has_theme_update = this.theme.update && typeof this.theme.update === 'function';
		this.has_theme_player_update = this.theme.player_update && typeof this.theme.player_update === 'function';
		
		this.boot();		
	}	
	
	boot() {
		let cstm = this._config_global;
		let cstmg = cstm.gen_path;		
		cstm.configurator = this;
		let rwh = cstm.revertWidthHeight;
		var _w = rwh ? 'height' : 'width';
		var _h = rwh ? 'width' : 'height';
		let cfg_w, cfg_h;
		cstm._rwhcfg = {
			w : _w,
			h : _h
		};
		cstm._position = {l : 0, p : 0};

		cstm._current_camera_offset = 0;
		cstm._current_camera_inc_speed = 0;		
		
		cstm.heightControls = Math.round(this._config_game.height * cstm.heightControlsRate);
		cstm.heightField = this._config_game.height - cstm.heightControls;		
		
		if(rwh) {
			cfg_w = cstm.heightField;
			cfg_h = this._config_game[_h];
		} else {
			cfg_w = this._config_game[_w];
			cfg_h = cstm.heightField;
		}	
		cstm._rwhcfg.cfg_w = cfg_w;
		cstm._rwhcfg.cfg_h = cfg_h;
		
		cstm._cameraOffset = Math.round(cfg_w * (rwh ? (1 - cstm.cameraOffset) : cstm.cameraOffset));
		cstm.speedMult = cstm.useFrames ? 100 : 1000;		
		//if(this.config.f.init && typeof this.config.f.init === 'function') this.config.f.init(this.cfg);//tmp
		if(this.theme.boot && typeof this.theme.boot === 'function') this.theme.boot(cstm);
		
		if(cstm.gen_obs.gridCellScales) {
			cstm.gridCellScales = cstm.gen_obs.gridCellScales.map((x) => (x[0])).sort((a, b) => (a - b));
		} else {
			cstm.gen_obs.gridCellScales = [];
			cstm.gridCellScales.forEach((_v) => {
				cstm.gen_obs.gridCellScales.push([_v, (100 / cstm.gridCellScales.length) * 0.01]);
			});
		}
		//cstm.speedUp = Math.round(cstm.speed * cstm.speedUpCoeff);
		if(cstm.speed_intial === undefined) {
			cstm.speed_initial = cstm.speed;
		} else {
			cstm.speed = cstm.speed_initial;
		}

		cstmg.rwh = rwh;
		cstmg.screen_length = cfg_w;
		this.config_boot = Immutable.Map(cstm);
		this.config_boot_menu = Immutable.Map(cstm.menu);
	}

	preload(scene) {
		if(this.theme.preload && typeof this.theme.preload === 'function') this.theme.preload(scene);
	}
	
	create(scene) {
		if(this.theme.create && typeof this.theme.create === 'function') this.theme.create(scene);
		
	}
	
	update(scene) {
		 if(this.has_theme_update) this.theme.update(scene);
	}	
	
	player_update(scene) {
		if(this.has_theme_player_update) this.theme.player_update(scene);
	}
	
	update_section(scene) {
		//update _position
		if(this.config.levels[this.config._position.l].num_sections && this.config._position.p === this.config.levels[this.config._position.l].num_sections) {
			this.config._position.p = 0;
			this.config._positions.l++;
		} else {
			this.config._position.p++;
		}
		if(this.config.speedUp) this.config.speed += this.config.speedUp;
		//if(this.config.f.update && typeof this.config.f.update === 'function') this.config.f.update(this.cfg);//tmp
	}		

	set_game(config, scenes) {
		config.scene = scenes;
		this._config_game = config;
	}
	
	set_global(config) {
		this._config_global = config;
	}
	
	get_game() {		
		return this._config_game;
	}

	get_play(current) {
		if(!current) this.config = this.config_boot.toObject()
		return this.config;
	}

	get_menu(current) {
		if(!current) this.config_menu = this.config_boot_menu.toObject()
		return this.config_menu;
	}	
	
	get_version() {
		return this._config_global.v;
	}
	
}

let configurator = new AutopConfigurator(_config_global, _config_game, [Menu, PlayMain]);

export default configurator;
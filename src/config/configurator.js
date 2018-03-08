
import Immutable from 'immutable';

import _config_game from './game';
import {_config_global} from './global';

import PlayMain from '../scene/play_main';
import Menu from '../scene/menu';

import {AutopLevels} from '../lib/level';

class AutopConfigurator {
	
	constructor(config_global, config_game, scenes) {
		this.current_config_id = 0;
		this.configs = [];
		this._config_game;						
		this._config_global;
		this.config_boot;
		this.config_boot_menu;	
		this.config_afterload;
		this.config;
		this.config_menu;		
		this.levels;
		this.set_global(config_global);
		this.set_game(config_game, scenes);				
		this.theme = require('../theme/'+this._config_global.theme_name);		
		this.has_theme_update = this.theme.update && typeof this.theme.update === 'function';
		this.has_theme_player_update = this.theme.player_update && typeof this.theme.player_update === 'function';
		this.has_theme_new_level = this.theme.new_level && typeof this.theme.new_level === 'function';
		
		this.boot();		
	}	
	
	boot() {
		let cstm = this._config_global;
		let cstmg = cstm.gen_path;		
//		cstm.configurator = this;
		let rwh = cstm.revertWidthHeight;
		var _w = rwh ? 'height' : 'width';
		var _h = rwh ? 'width' : 'height';
		let cfg_w, cfg_h;
		cstm._rwhcfg = {
			w : _w,
			h : _h
		};
//		this.registry.get('state')._position = {l : 0, p : 0};

//		this.registry.get('state')._current_camera_offset = 0;
//		this.registry.get('state')._current_camera_inc_speed = 0;		
		
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
		
		cstm.cameraOffsetPx = Math.round(cfg_w * (rwh ? (1 - cstm.cameraOffset) : cstm.cameraOffset));
		cstm.speedMult = cstm.useFrames ? 100 : 1500;		
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
		this.config_boot = Immutable.fromJS(cstm);
		this.config_boot_menu = Immutable.fromJS(cstm.menu);
	}

	preload(scene) {		
		if(this.theme.preload && typeof this.theme.preload === 'function') {
			this.theme.preload(scene);		
			this.config_afterload = Immutable.fromJS(scene.c.config);
		}
		this.configs = [];
		this.levels = new AutopLevels(this.theme.levels, this, scene);
	}
	
	create(scene) {
		if(this.theme.create && typeof this.theme.create === 'function') this.theme.create(scene);	
		
		for(let i = 0; i < 10; i++) {
			this.add_next_section(!i);
		}
		
		//if(this.has_theme_new_level) this.theme.new_level(scene, 0, false);		
		this.update_section(scene, true);
	}
	
	update(scene) {
		 if(this.has_theme_update) this.theme.update(scene);
	}	
	
	player_update(scene) {
		if(this.has_theme_player_update) this.theme.player_update(scene);
	}
	
	
	add_next_section(just_starting) {
		if(just_starting === undefined) just_starting = false;
		this.configs.push(Phaser.Utils.Objects.Extend(true, {}, this.levels.next_section(just_starting)));
	}
	
	get_section(n, full) {
		if(full === undefined) full = false;
		return (this.configs.length > n ? (full ? this.configs[n] : this.configs[n].config) : (full ? false : this.config));
	}
	
	get_section_by_id(id) {
		for(let i = 0; i < this.configs.length; i++) {
			if(this.configs[i].id === id) return this.configs[i].config;
		}
		return this.config;
	}	

	get_section_by_id_full(id) {
		for(let i = 0; i < this.configs.length; i++) {
			if(this.configs[i].id === id) return this.configs[i];
		}
		return false;
	}	
	
	update_section(scene, no_next) {
		//update _position
		if(this.configs.length > 0) {
			let _cfg = this.configs.shift();
			this.config = _cfg.config;
//			Phaser.Utils.Objects.Extend(true, this.config, _cfg.config);
			if(this.has_theme_new_level && _cfg.position.position === 0) this.theme.new_level(scene, _cfg.position.level, _cfg.is_last_level);
			this.current_config_id = _cfg.id;
		}
		if(!no_next) setTimeout(() => {this.add_next_section();}, 1000);
		
		
//		scene.registry.get('state')._position.p = this.levels.position;		
//		if(this.levels.new_level) scene.registry.get('state')._position.l = this.levels.level;
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
		if(!current) this.config = this.config_boot.toJS();
		return this.config;
	}

	get_afterload() {
		return this.config_afterload.toJS();
	}
	
	get_afterboot() {
		return this.config_boot.toJS();
	}
	
	get_menu(current) {
		if(!current) this.config_menu = this.config_boot_menu.toJS()
		return this.config_menu;
	}	
	
	get_version() {
		return this._config_global.v;
	}
	
}

let configurator = new AutopConfigurator(_config_global, _config_game, [Menu, PlayMain]);

export default configurator;
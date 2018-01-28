
class AutopConfigurator {
	
	constructor(config) {
		this.config = config;
		this.cfg = this.config.custom;
		this.init();
	}
	
	init() {
		let cstm = this.cfg;
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
		
		cstm.heightControls = Math.round(this.config.height * cstm.heightControlsRate);
		cstm.heightField = this.config.height - cstm.heightControls;		
		
		if(rwh) {
			cfg_w = cstm.heightField;
			cfg_h = this.config[_h];
		} else {
			cfg_w = this.config[_w];
			cfg_h = cstm.heightField;
		}	
		cstm._rwhcfg.cfg_w = cfg_w;
		cstm._rwhcfg.cfg_h = cfg_h;
		
		cstm._cameraOffset = Math.round(cfg_w * (rwh ? (1 - cstm.cameraOffset) : cstm.cameraOffset));
	
		cstm.grid = cstm.playerWidthHeight[0] + cstm.playerWidthHeight[1];
	
		cstm.rtreeOffset = Math.round((cstm.playerWidthHeight[0] + cstm.playerWidthHeight[1]) * cstm.rtreeCoeff);
		cstm.speed = Math.round(cfg_w * cstm.speedCoeff);
		//	cstm.speedUp = Math.round(cstm.speed * cstm.speedUpCoeff);
		if(cstm.speed_intial === undefined) {
			cstm.speed_initial = cstm.speed;
		} else {
			cstm.speed = cstm.speed_initial;
		}		
		cstm.speedMult = cstm.useFrames ? 100 : 1000;
		cstm.playerNumBodyParts = Math.round(cfg_w * cstm.playerNumBodyPartsCoeff);
		cstmg.start_x = rwh ? (cstm.heightField - cstm.start_x) : cstm.start_x;
		cstmg.min_y = cstm.playerWidthHeight[1];
		cstmg.start_y = Math.round(cstm.heightField * 0.5 + cstmg.min_y);		
		cstmg.max_y = cfg_h - cstmg.min_y;
		cstmg.scale_y_length = (cstmg.max_y - cstmg.min_y) / (cstmg.scale_y + 1);
		cstmg.scale_y_length_r = Math.round(cstmg.scale_y_length);	
		cstmg.min_path_x_length = Math.round(cfg_w * (0.5 - cstmg.path_x_spread_min));
		cstmg.max_path_x_length = Math.round(cfg_w * (0.5 + cstmg.path_x_spread_max));
		cstmg.min_segment_length = cstm.playerWidthHeight[0] + cstm.playerWidthHeight[1];
		cstmg.min_segment_length_sq = cstmg.min_segment_length * cstmg.min_segment_length;
		cstmg.rwh = rwh;
		cstmg.screen_length = cfg_w;		
	}
	
	update() {
		//update _position
		if(this.cfg.levels[this.cfg._position.l].num_sections && this.cfg._position.p === this.cfg.levels[this.cfg._position.l].num_sections) {
			this.cfg._position.p = 0;
			this.cfg._positions.l++;
		} else {
			this.cfg._position.p++;
		}
		if(this.cfg.speedUp) this.cfg.speed += this.cfg.speedUp;
	}		
	
	
	
	
	
}

export default AutopConfigurator
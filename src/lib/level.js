import AutopRand from '../util/autoprand';

export class AutopLevel {

	constructor(cfg, configurator) {		
		this.c;
		this.config;	
		this.cfg = cfg || {};
		this._num_sections;
		if(this.cfg.num_sections) {
			if(Array.isArray(this.cfg.num_sections)) {				
				this._num_sections = AutopRand.randint(...this.cfg.num_sections);
			} else {
				this._num_sections = this.cfg.num_sections;				
			}
		} else {			
			this._set_num_sections();
		}		
	}		
	
	_set_num_sections() {
		this._num_sections = -1;
	}
	
	_init(scene) {
		
	}
	
	_load_section(position) {
		
	}

	_load_prev_config() {
		let last = this.c.configs.length - 1;
		if(last >= 0) {
			this.config = Phaser.Utils.Objects.Extend(true, {}, this.c.configs[last].config);
		} else {
			this.config = Phaser.Utils.Objects.Extend(true, {}, this.c.config);
		}
	}
	
	init(configurator, scene) {		
		this.c = configurator;
		if(this.cfg.reboot) {
			this.config = this.c.get_afterboot();
		} else if(this.cfg.reload) {			
			this.config = this.c.get_afterload();
		} else {
			this._load_prev_config();
		}
		
		if(this.cfg.config) Phaser.Utils.Objects.Extend(true, this.config, this.cfg.config);
		this._init(scene);
	}

	load_section(position) {		
		if(position > 0) this._load_prev_config();
		this._load_section(position);
	}

	num_sections() {
		return this._num_sections;		
	}
}

export class AutopLevels {
	
	constructor(config, configurator, scene) {		
		this._cfg;
		this.c = configurator;
		this.level = -1;
		this.level_obj;
		this.position = -1;
		this.id = -1;
		this.new_level;
		this.is_last_level;
		this.sc = scene;
		this.config(config);		
		this.current_num_sections = -1;		
	}
	
	config(config) {
		this._cfg = config;
	}
	
	next_section(just_starting) {
		let position = this.position + 1;
		if((this.current_num_sections !== -1 && position === this.current_num_sections) || just_starting) {
			position = 0;
			this.load_level(this.level + 1);
		} else {
			this.new_level = false;
		}
		this.load_section(position);
		this.id++;
		return {
			config: this.level_obj.config,
			is_last_level: this.is_last_level,
			position: {
				position: this.position,
				level: this.level
			},
			id: this.id
		}
	}
	
	load_level(level) {
		if(level === (this._cfg.length - 1)) {
			this.is_last_level = true;
			this.current_num_sections = -1;
		} else {
			this.is_last_level = false;
		} 
		this.level_obj = this._cfg[level];
		this.level_obj.init(this.c, this.sc);
		if(!this.is_last_level) this.current_num_sections = this.level_obj.num_sections();
		this.new_level = true;
		this.level = level;
	}
	
	load_section(position) {
		this.level_obj.load_section(position);
		this.position = position;
	}	
	
}

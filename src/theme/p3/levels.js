
import AutopRand from '../../util/autoprand';
import {AutopLevel} from '../../lib/level';

class Level0 extends AutopLevel {
	
	_prepare_bgcolor() {
		if(!this.step || !this.cfg.config.hasOwnProperty('bgcolor') || this.cfg.config.bgcolor.v.length !== 2) return;
		this.cfg.bgcolor = this.cfg.config.bgcolor;
		this.cfg.bgcolor_changes = [];
		let _changes = [];
		let _diff = this.cfg.bgcolor.v[1] - this.cfg.bgcolor.v[0];
		for(let i = 1; i < this._num_sections; i++) {
			let l = this.cfg.bgcolor_changes.length;
			let _ar = [(l > 0 ? this.cfg.bgcolor_changes[l - 1][1] : this.cfg.bgcolor.v[0])];			
			_ar.push(this.cfg.bgcolor.v[0] + _diff * Phaser.Math.Easing.Quadratic.In(this.step * i));
			this.cfg.bgcolor_changes.push(_ar);
		}
		this.cfg.bgcolor_changes.push([this.cfg.bgcolor_changes[this.cfg.bgcolor_changes.length - 1][1], this.cfg.bgcolor.v[1]]);			
	}
	
	_bgcolor_control(position) {
		if(position === 0 || !this.cfg.bgcolor_changes || position > this.cfg.bgcolor_changes.length) return;
		this.config.bgcolor_change = this.cfg.bgcolor_changes[position - 1];
	}

	_speed_control(position) {
		if(!this.step) return;
		if(!this.cfg.hasOwnProperty('speedFinal')) {
			this.cfg.speedFinal = this.config.speed_initial * this.config.speedFinalCoeff;
			this.cfg.speedDiff = this.cfg.speedFinal - this.config.speed_initial;
		}
		if(this.cfg.speedDiff > 0) {
			if(position === (this._num_sections - 1)) {
				this.config.speed = this.config.speed_initial;
			} else {
				this.config.speed = this.config.speed_initial + this.cfg.speedDiff * Phaser.Math.Easing.Cubic.Out(Math.min((position + 1) * this.step, 1));
			}			
		}
	}

	_load_section(position) {	
		this._speed_control(position);
		this._bgcolor_control(position);
/*		if(position === (this._num_sections - 1)) {
			this.config.speed = this.config.speed_initial;
		} else if(position > 0 && this.config.speedUp) {
			this.config.speed += this.config.speedUp;
		}			*/
	}	
	
	_init(scene) {
		this._prepare_bgcolor();
	}
}

class Level1 extends Level0 {
	
	_load_section(position) {	
		this._speed_control(position);		
		this._bgcolor_control(position);
		if(position < (this._num_sections - 1)) {
			let v = Phaser.Math.Easing.Expo.Out(Math.min((position + 1) * this.step, 1));
			this.config.gen_obs.imp_probability = this.cfg.initial.imp_probability * (1 - v) + this.cfg.target.imp_probability * v;
			this.config.gen_obs.notimp_probability = this.cfg.initial.notimp_probability * (1 - v) + this.cfg.target.notimp_probability * v;

//			if(position > 0 && this.config.speedUp) this.config.speed += this.config.speedUp;
			if(position === (this._num_sections - 3)) this.config.twoCorrectChance = 1;
			//console.log(v, this.sc.cfg.gen_obs);//tmp to delete
		} /*else {
			this.config.speed = this.config.speed_initial;			
		}*/
	}	
	
	_init(scene) {
		this._prepare_bgcolor();
		this.cfg.initial = {
			imp_probability: this.config.gen_obs.imp_probability,
			notimp_probability: this.config.gen_obs.notimp_probability,
		}
		this.cfg.target = {
			imp_probability: 0.1,
			notimp_probability: 0.5
		}
		
		this.c.theme.reset_grid(this.config);
		//this.config.gen_obs.img_scaling_step = 0.15;
		//scene.c.theme.create(scene, 'obstacles');
		this.config.rtreeCoeff = 0.2;
		this.config.speed = this.config.speed_initial;
		this.config.gen_path.next_x_method = 'softmax';
		//this.config.gen_path.scale_y = 4;
		//this.config.gen_path.scale_y_length = (this.config.gen_path.max_y - this.config.gen_path.min_y) / (this.config.gen_path.scale_y + 1);
		//this.config.gen_path.scale_y_length_r = Math.round(this.config.gen_path.scale_y_length);			
		this.config.gen_obs.gridCellScales = [[1, 0.1], [2, 0.35], [3, 0], [4, 0.55]];
		this.config.gridCellScales = this.config.gen_obs.gridCellScales.map((x) => (x[0])).sort((a, b) => (a - b));
		this.config.rtreeOffset = Math.round((this.config.playerWidthHeight[0] + this.config.playerWidthHeight[1]) * this.config.rtreeCoeff);		
		this.config.gen_obs.obs_set_sfx = '1';
		this.c.theme.create(scene, 'obstacles', this.config);
	}
		
}

class Level2 extends Level0 {

	_load_section(position) {	
		this._speed_control(position);	
		this._bgcolor_control(position);		
		if(position === (this._num_sections - 3)) this.config.twoCorrectChance = 3;
	}
	
	_init(scene) {		
		this._prepare_bgcolor();
		this.c.theme.reset_grid(this.config);
		this.config.speed = this.config.speed_initial;
		this.config.gen_path.next_x_method = 'minmax';
		
		this.config.gen_obs.gridCellScales = [[1, 0.1], [2, 0.3], [3, 0.3], [4, 0.3]];
		this.config.gridCellScales = this.config.gen_obs.gridCellScales.map((x) => (x[0])).sort((a, b) => (a - b));	
		this.config.gen_obs.obs_set_sfx = '2';
		this.config.twoCorrectChance = 1;
		this.c.theme.create(scene, 'obstacles', this.config);
	}		
}

let levels = [
	(new Level0({
		config: {
			bgcolor: {h: 1 / 3, s: 1, v: [0.498039, 0.188235]} //[0x007f00, 0x003000],
		},		
		num_sections: 10, //[10, 15],
	})),
	(new Level1({
		config: {
			bgcolor: {h: 1 / 3, s: 1, v: [0.188235, 0.498039]} //[0x003000, 0x007f00],
		},
		num_sections: 10,
		reload: true,
	})),	
	(new Level2({
		config: {
			bgcolor: {h: 1 / 3, s: 1, v: [0.498039, 0.188235]} //[0x007f00, 0x003000],
		},		
		num_sections: 10,
		reload: true
	})),
	(new AutopLevel({
		config: {
			bgcolor: {h: 1 / 3, s: 1, v: [0.188235]}, //[0x003000],			
			twoCorrectChance: 3
		},
		reload: true
	}))
];




export default levels;
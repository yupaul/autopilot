import AutopRand from '../../util/autoprand';
import {AutopLevel} from '../../lib/level';

class Level0 extends AutopLevel {
	_load_section(position) {	
		if(position === (this._num_sections - 1)) {
			this.config.speed = this.config.speed_initial;
		} else if(position > 0 && this.config.speedUp) {
			this.config.speed += this.config.speedUp;
		}			
	}	
}

class Level1 extends AutopLevel {
	_load_section(position) {	
		if(position < (this._num_sections - 1)) {
			let v = Phaser.Math.Easing.Expo.Out(Math.min((position + 1) * this.cfg.step, 1));
			this.config.gen_obs.imp_probability = this.cfg.initial.imp_probability * (1 - v) + this.cfg.target.imp_probability * v;
			this.config.gen_obs.notimp_probability = this.cfg.initial.notimp_probability * (1 - v) + this.cfg.target.notimp_probability * v;

			if(position > 0 && this.config.speedUp) this.config.speed += this.config.speedUp;
			//console.log(v, this.sc.cfg.gen_obs);//tmp to delete
		} else {
			this.config.speed = this.config.speed_initial;			
		}
	}	
	
	_init(scene) {
		this.cfg.step = 1 / this._num_sections;
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
		this.config.rtreeCoeff = 0.5;
		this.config.speed = this.config.speed_initial;
		this.config.gen_path.next_x_method = 'softmax';
		//this.config.gen_path.scale_y = 4;
		//this.config.gen_path.scale_y_length = (this.config.gen_path.max_y - this.config.gen_path.min_y) / (this.config.gen_path.scale_y + 1);
		//this.config.gen_path.scale_y_length_r = Math.round(this.config.gen_path.scale_y_length);			
		this.config.gen_obs.gridCellScales = [[1, 0], [2, 0.4], [3, 0], [4, 0.2]];
		this.config.gridCellScales = this.config.gen_obs.gridCellScales.map((x) => (x[0])).sort((a, b) => (a - b));
		this.config.rtreeOffset = Math.round((this.config.playerWidthHeight[0] + this.config.playerWidthHeight[1]) * this.config.rtreeCoeff);		
		this.config.gen_obs.obs_set_sfx = '1';
		this.c.theme.create(scene, 'obstacles', this.config);
	}
		
}

class Level2 extends AutopLevel {
	
	_init() {
		//this.c.theme.reset_grid(this.config);
	}
}

let levels = [
	(new Level0({
		num_sections: 3, //[10, 15],
	})),
	(new Level1({
		num_sections: [15, 20],
		reload: true,
	})),	
	(new Level2({		
		//reload: true
	}))
];




export default levels;
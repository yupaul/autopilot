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
			//console.log(v, this.sc.cfg.gen_obs);//tmp to delete
		}		
	}	
	
	_init() {
		this.cfg.step = 1 / this._num_sections;
		this.cfg.initial = {
			imp_probability: this.config.gen_obs.imp_probability,
			notimp_probability: this.config.gen_obs.notimp_probability,
		}
		this.cfg.target = {
			imp_probability: 0.3,
			notimp_probability: 0.5
		}
		this.config.gen_obs.img_scaling_step = 0.2;
		//scene.c.theme.create(scene, 'obstacles');
		this.config.rtreeCoeff = 0.6;
		this.config.speed = this.config.speed_initial;
		this.config.gen_path.next_x_method = 'longshort';
		this.config.gen_path.gridCellScales = [[1,0], [2, 0.1], [3, 0.4], [4, 0.5]];
		this.config.rtreeOffset = Math.round((this.config.playerWidthHeight[0] + this.config.playerWidthHeight[1]) * this.config.rtreeCoeff);		
	}
		
}

let levels = [
	(new Level0({
		num_sections: 5, //[15, 20]
	})),
	(new Level1({
		num_sections: [15, 20],
	})),	
	(new AutopLevel({		
		//reboot: true
	}))
];




export default levels;
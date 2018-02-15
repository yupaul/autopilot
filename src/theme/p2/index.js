import AutopRand from '../../util/autoprand';
import AutopCreator from './creator';
import _config from './config';

let theme = {
	theme_name: 'p2', 
	boot: function(config) {		
		let cstmg = config.gen_path;		
		let rwh = config.revertWidthHeight;
		let cfg_w = config._rwhcfg.cfg_w;
		let cfg_h = config._rwhcfg.cfg_h;		
		
		Phaser.Utils.Objects.Extend(config, _config);
		config.grid = config.playerWidthHeight[0] + config.playerWidthHeight[1];	
		config.rtreeOffset = Math.round((config.playerWidthHeight[0] + config.playerWidthHeight[1]) * config.rtreeCoeff);
		config.speed = Math.round(cfg_w * config.speedCoeff);
		config.playerNumBodyParts = Math.round(cfg_w * config.playerNumBodyPartsCoeff);
		cstmg.start_x = rwh ? (config.heightField - config.start_x) : config.start_x;
		cstmg.min_y = config.playerWidthHeight[1];
		cstmg.start_y = Math.round(config.heightField * 0.5 + cstmg.min_y);		
		cstmg.max_y = cfg_h - cstmg.min_y;
		cstmg.scale_y_length = (cstmg.max_y - cstmg.min_y) / (cstmg.scale_y + 1);
		cstmg.scale_y_length_r = Math.round(cstmg.scale_y_length);	
		cstmg.min_path_x_length = Math.round(cfg_w * (0.5 - cstmg.path_x_spread_min));
		cstmg.max_path_x_length = Math.round(cfg_w * (0.5 + cstmg.path_x_spread_max));
		cstmg.min_segment_length = config.playerWidthHeight[0] + config.playerWidthHeight[1];
		cstmg.min_segment_length_sq = cstmg.min_segment_length * cstmg.min_segment_length;
	},
	
	preload: function(scene) {
		scene.cfg.grid = AutopRand.randint(Math.round((scene.cfg.playerWidthHeight[0] + scene.cfg.playerWidthHeight[1]) * 0.25), scene.cfg.playerWidthHeight[0] + scene.cfg.playerWidthHeight[1]);
		scene.load.image('pause', './assets/'+this.theme_name+'/images/pause.png');
		scene.load.image('bg_dark', './assets/'+this.theme_name+'/images/bg_dark2.png');
		scene.load.image('player', './assets/'+this.theme_name+'/images/player2.png');
		scene.load.image('player_body_particle', './assets/'+this.theme_name+'/images/pbp1.png');
	},
	
	create: function(scene) {
		let cr = new AutopCreator(scene);
		cr.create();
	},
	
	update: function(scene) {
		
	},
	
	player_afterCreate: function(player) {		
		player.setBlendMode('SCREEN');
	},
	
	player_update: function(scene) {
		if(!scene.registry.get('player_body_group').visible) {
			scene.registry.get('player').setBlendMode('SCREEN');
			scene.registry.get('player_body_group').visible = 1;
			//scene.registry.get('player_body_group').startFollow(scene.registry.get('player'));
		}
		
		if(AutopRand.chanceOneIn(2)) {
			let r = [AutopRand.randint(0, 50), AutopRand.randint(0, 60)];
			let xy = scene.registry.get('player_xy');
			scene.registry.get('player_body_group').setPosition(xy[0] + r[0] - 25, xy[1] + r[1] - 30).setGravityY((r[1] - 30) * 2).setGravityX(-AutopRand.randint(20, 80));
		}
	},	

	test: function() {
		console.log('test');
	}






}

module.exports = theme;
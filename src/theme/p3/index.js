import AutopRand from '../../util/autoprand';
import AutopCreator from './creator';
import _config from './config';
import levels from './levels';

let theme = {
	theme_name: 'p3', 
	levels: levels,
	boot: function(config) {		
		let cstmg = config.gen_path;		
		let rwh = config.revertWidthHeight;
		let cfg_w = config._rwhcfg.cfg_w;
		let cfg_h = config._rwhcfg.cfg_h;		
		
		
		_config.player_body_emitter.follow.position_range_half = [Math.round(_config.player_body_emitter.follow.position_range[0] * 0.5), Math.round(_config.player_body_emitter.follow.position_range[1] * 0.5)];
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

	reset_grid: function(cfg) {
		cfg.grid = AutopRand.randint(Math.round((cfg.playerWidthHeight[0] + cfg.playerWidthHeight[1]) * 0.6), Math.round((cfg.playerWidthHeight[0] + cfg.playerWidthHeight[1]) * 0.8));
	},
	
	preload: function(scene) {
		this.reset_grid(scene.c.config);
		let _h = scene.c.config._rwhcfg.h;
		let h = scene.sys.game.config[_h];
		let _ar = [128, 256, 512, 1024];
		let r;
		for(let _i = 0; _i < _ar.length; _i++) {
			r = _ar[_i];
			if(r >= h) break;
		}
		//console.log(r);
		//r = 1024;
		scene.load.image('bgt', './assets/'+this.theme_name+'/images/bgt'+r+'.png');
		
		scene.load.image('pause', './assets/'+this.theme_name+'/images/pause.png');
		//scene.load.image('bg_dark', './assets/'+this.theme_name+'/images/bg_dark2.png');
		scene.load.image('bg_top', './assets/'+this.theme_name+'/images/bg_top.png');
		scene.load.image('bg_bottom', './assets/'+this.theme_name+'/images/bg_bottom.png');		
		scene.load.image('player', './assets/'+this.theme_name+'/images/player2.png');
		scene.load.image('player_body_particle', './assets/'+this.theme_name+'/images/pbp1.png');
		scene.load.image('bg_particle0', './assets/'+this.theme_name+'/images/bgp1.png');
		scene.load.image('bg_particle1', './assets/'+this.theme_name+'/images/bgp2.png');
		scene.load.image(scene.c.config.wallTextureName, './assets/'+this.theme_name+'/images/krestik23.png');
		scene.load.image('far_mask', './assets/'+this.theme_name+'/images/msk2.png');		
		scene.load.atlas(scene.c.config.gen_obs.texture_root, './assets/'+this.theme_name+'/images/obstacles_out1_x15.png', './assets/'+this.theme_name+'/images/obstacles_out1_x15.json');
		scene.load.atlas('path_buttons', './assets/'+this.theme_name+'/images/buttons1.png', './assets/'+this.theme_name+'/images/buttons1.json');	

//    var atlasTexture = this.textures.get('megaset'); //tmp to delete
//    var frames = atlasTexture.getFrameNames(); //tmp to delete

		/* //tmp to delete
		for(let i = 1; i <= scene.c.config.numObsImages; i++) { 
			scene.load.image('o'+i, './assets/'+this.theme_name+'/images/o/'+i+'.png');
		}
		*/
	},
	
	create: function(scene, method, config) {
		scene.lib.update_bgcolor();		
		let cr = new AutopCreator(scene);
		if(method !== undefined && !!cr[method] === true && typeof cr[method] === 'function') {
			(config ? cr[method](config) : cr[method]);
		} else {
			cr.create();
		}
	},
	
	update: function(scene) {
		
	},
	
	player_afterCreate: function(player) {		
		player.setBlendMode('SCREEN');
	},
	
	player_update: function(scene) {
		if(!scene.registry.get('player').pathTween || !scene.registry.get('player').pathTween.isPlaying()) return;
		
		let _cfg = scene.c.config.player_body_emitter.follow;
		let xy = scene.registry.get('player_xy');
		if(AutopRand.chanceOneIn(_cfg.chance)) {			
			let r = [AutopRand.randint(0, _cfg.position_range[0]), AutopRand.randint(0, _cfg.position_range[1])];			
			scene.registry.get('player_body_group').setPosition(xy[0] + r[0] - _cfg.position_range_half[0], xy[1] + r[1] - _cfg.position_range_half[1]).setGravityY((r[1] - _cfg.position_range_half[1]) * _cfg.gravity_y_multiplier).setGravityX(-AutopRand.randint(..._cfg.gravity_x_range));
			if(!scene.registry.get('player_body_group').visible) {
				scene.registry.get('player').setBlendMode('SCREEN');
				scene.registry.get('player_body_group').visible = 1;
				scene.registry.get('player_body_group').manager.setDepth(scene.registry.get('player').depth - 1);
				//scene.registry.get('player_body_group').startFollow(scene.registry.get('player'));
			}
		}	
		if(scene.registry.get('player').x > scene.registry.get('mask2').x) {
			if(this.mask_moved === 0) {
				this.mask_moved = scene.c.config.playerMaskMoveSpeed;
				scene.registry.get('mask2').x = scene.registry.get('player').x;
			} else {
				this.mask_moved--;
			}
		}
	},	
	
	new_level: function(scene, level, is_last_level) {
		//LEVEL ∞			
		let was_playing;
		scene.time.addEvent({delay: 100, callback: () => {
			was_playing = scene.registry.has('player') && scene.registry.get('player').pathTween.isPlaying();
			if(was_playing) scene.registry.get('player').pauseFollow();
		}});
		let level_msg = is_last_level ? '\u221E' : ('LEVEL'+(level + 1));
		let _x0 = scene.cameras.main.scrollX + scene.c.config._rwhcfg.cfg_w * 0.5;
		let _x = scene.cameras.main.scrollX + scene.c.config._rwhcfg.cfg_w * (is_last_level ? 0.3 : 0.1);
		let _y0 = -20;
		let _y = scene.c.config._rwhcfg.cfg_h * 0.1;
		let level_text = scene.add.text(_x0, _y0, level_msg, {color: (is_last_level ? '#434' : '#aba'), fill: (is_last_level ? '#010' : '#aba'), fontSize: (is_last_level ? '128px' : '48px'), fontFamily: 'Georgia'}).setDepth(1000).setScale(is_last_level ? 0.5 : 0.25).setAlpha(0.1);
		
		scene.add.tween({
			targets: level_text,
			scaleX: (is_last_level ? 5: 3),
			scaleY: 3,
				x: _x,
				y: _y,
				ease: 'Expo.In',
				alpha: (is_last_level ? 0.9 : 0.6),
				duration: 300,
				onComplete: () => {		
		scene.time.addEvent({delay: 1200, callback: () => {
			scene.add.tween({
				targets: level_text,
				scaleX: 0.25,
				scaleY: 0.25,
				x: scene.cameras.main.scrollX + scene.c.config._rwhcfg.cfg_w * 0.55,
				y: scene.c.config._rwhcfg.cfg_h * 0.8,
				ease: 'Circular.In',
				alpha: 0.05,
				duration: 1000,
				onComplete: () => {
					level_text.destroy();
				}
			});			
			if(was_playing && !scene.registry.get('player').pathTween.isPlaying()) scene.registry.get('player').resumeFollow();
		}});
		}});
	},
	
	mask_moved: 0

}

module.exports = theme;

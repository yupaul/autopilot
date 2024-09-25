import AutopLIB from '../lib/lib';
import PlayBase from './play_base';

class PlayMain extends PlayBase {

  constructor () {
    super({
      key: 'PlayMain'
    })
  }
  
	preload () {
		console.log('PlayMain preload()');//tmp
		this.c = this.registry.get('c');
		this.c.get_play();
//		this.cfg = this.c.get_play();
	  	this.lib = new AutopLIB(this);
		this.c.preload(this);
		
	}

create () {		
	console.log('PlayMain create()');//tmp
//	var rwh = this.c.config.revertWidthHeight;
//	var _w = rwh ? 'height' : 'width';
//	var _h = rwh ? 'width' : 'height';
	
	this.registry.set('buttons', []);
	this.registry.set('paths', []);
	this.registry.set('path_images', {});
	this.registry.set('path_textures', []);
	this.registry.set('path_objects', []);
	this.registry.set('walls', []);
	this.registry.set('obstacles', (new Phaser.Structs.Map()));
	this.registry.set('show_path_last_point', false);
	this.registry.set('minipath_indexes', []);

//	this.lib.config_preprocess(rwh, _w, _h);//tmp to delete

	//this.cameras.main.setSize(this.cameras.main.width, this.c.config.heightField);	
	if(this.cameras.cameras.length < 2) this.cameras.add(0, this.c.config.heightField, this.cameras.main.width, this.c.config.heightControls).setBounds(0, this.c.config.heightField, this.cameras.main.width, this.c.config.heightControls);
	for (let _i in this.cameras.cameras) {
		this.cameras.cameras[_i].setScroll(0, 0);
		for (let _k in this.cameras.cameras[_i]) {
			if(_k.indexOf('_fade') === 0) this.cameras.cameras[_i][_k] = 0;
		}
	}
	
	this.sys.events.on('resize', (w, h) => {
	 	this.cameras.main.setAngle(h > w ? -90 : 0);
	});
	this.cameras.main.setAngle(this.sys.game.config.height > this.sys.game.config.width ? -90 : 0);
	//this.lib.create();	
	this.c.create(this);	
	
	let pobj = this.lib.gen_path.generate_path();	
	this.lib.generate_wall(pobj);
	
	let prev_tail = pobj.tail;
	this.registry.get('paths').push(pobj.points);
	this.lib.wall_add(pobj);
	this.lib.wall_show(true);
	
	this.lib.show_path(pobj);	
	
	this.lib.draw_obstacles(this.lib.generate_obstacles(pobj));	
	
	for(let i = 0; i < 3; i++) {				
		let id = i + 1;
		let cfg = this.c.get_section_by_id(id);
		this.lib.gen_path.setConfig(cfg);
		let pobj_correct = this.lib.gen_path.generate_path(prev_tail);
		this.lib.generate_wall(pobj_correct);		
		this.lib.wall_add(pobj_correct, !i);
		let obs = this.lib.generate_obstacles(pobj_correct, cfg);
		this.lib.draw_obstacles(obs);
		let pobj_wrong = this.lib.gen_path.generate_path(prev_tail, obs, false, false, {path: pobj_correct, value: 0});//tmp
		this.registry.get('obstacles').merge(obs, true);
		prev_tail = pobj_correct.tail;
		pobj_correct.config_id = pobj_wrong.config_id = id;
		this.registry.get('path_objects').push([pobj_correct, pobj_wrong]);		
	}
	
	this.lib.controls_set_path(this.registry.get('paths')[0], 0, true);
	
	this.registry.set('player', this.lib.multipath_follower({
			positionOnPath: true,        
			repeat: 0,
			rotateToPath: false,
			rotationOffset: 0,
			verticalAdjust: true,
			useFrames: (this.c.config.useFrames ? true : false),
			//ease: 'Circ.easeInOut'
		}, 'player'));
	this.registry.get('player').setDepth(-100);
	
	this.input.on('gameobjectdown', (event, button) => {
		this.lib.controls_on_click(event, button);
	});

	this.registry.get('state')._just_started = true;
	this.registry.get('state')._buttons_enabled = true;
	this.registry.get('state')._correct_selected = true;
}

update() {	
	this.c.update(this);
	if(!this.registry.has('player')) return;
	let player = this.registry.get('player');
//	console.log(player.pathTween.getValue(), Math.round(player.x * 100) / 100, Math.round(player.y * 100) / 100);//tmp debug to fix start / end 2 frame delay
	if(this.registry.get('state')._pause_scheduled !== undefined && this.registry.get('state')._pause_scheduled && player.isFollowing()) {
		player.pauseFollow();
		this.registry.get('state')._pause_scheduled = false;
		return;
	}
	
	if(!this.lib.player_update(player)) return;
	this.lib.camera_follow(player);
}

}

export default PlayMain

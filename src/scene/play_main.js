import AutopLIB from '../lib/lib';
import PlayBase from './play_base';

class PlayMain extends PlayBase {

  constructor () {
    super({
      key: 'PlayMain'
    })
  }
  
	preload () {
		this.c = this.registry.get('c');
		this.cfg = this.c.get_play();
	  	this.lib = new AutopLIB(this);
		this.c.preload(this);
		
	}

create () {		
	console.log('PlayMain create()');//tmp
	var rwh = this.cfg.revertWidthHeight;
	var _w = rwh ? 'height' : 'width';
	var _h = rwh ? 'width' : 'height';
	
	this.registry.set('buttons', []);
	this.registry.set('paths', []);
	this.registry.set('path_objects', []);
	this.registry.set('walls', []);
	this.registry.set('obstacles', (new Phaser.Structs.Map()));
	this.registry.get('show_path_last_point', false)

//	this.lib.config_preprocess(rwh, _w, _h);//tmp to delete

	//this.cameras.main.setSize(this.cameras.main.width, this.cfg.heightField);	
	if(this.cameras.cameras.length < 2) this.cameras.add(0, this.cfg.heightField, this.cameras.main.width, this.cfg.heightControls).setBounds(0, this.cfg.heightField, this.cameras.main.width, this.cfg.heightControls);
	for (let _i in this.cameras.cameras) {
		this.cameras.cameras[_i].setScroll(0, 0);
		for (let _k in this.cameras.cameras[_i]) {
			if(_k.indexOf('_fade') === 0) this.cameras.cameras[_i][_k] = 0;
		}
	}
	
	//this.lib.create();	
	this.c.create(this);	
	
	let pobj = this.lib.gen_path.generate_path();	
	this.lib.generate_wall(pobj);
	
	let prev_tail = pobj.tail;
	this.registry.get('paths').push(pobj.points);
	this.lib.wall_show(pobj);
	this.lib.show_path(pobj);	
	
	this.lib.draw_obstacles(this.lib.generate_obstacles(pobj));
	
	
	for(let i = 0; i < 3; i++) {				
		let pobj_correct = this.lib.gen_path.generate_path(prev_tail);
		this.lib.generate_wall(pobj_correct);		
		this.lib.wall_show(pobj_correct);
		let obs = this.lib.generate_obstacles(pobj_correct);
		this.lib.draw_obstacles(obs);
		let pobj_wrong = this.lib.gen_path.generate_path(prev_tail, obs, false, false, {path: pobj_correct, value: 0});//tmp
		this.registry.get('obstacles').merge(obs, true);
		prev_tail = pobj_correct.tail;
		this.registry.get('path_objects').push([pobj_correct, pobj_wrong]);		
	}
	
	this.lib.controls_set_path(this.registry.get('paths')[0], 0, true);
	
	this.registry.set('player', this.lib.multipath_follower({
			positionOnPath: true,        
			repeat: 0,
			rotateToPath: false,
			rotationOffset: 0,
			verticalAdjust: true,
			useFrames: (this.cfg.useFrames ? true : false),
			//ease: 'Circ.easeInOut'
		}, 'player'));
	this.registry.get('player').setDepth(-100);
	
	this.input.on('pointerdown', (event) => {
		this.lib.controls_on_click(event);
	});
	this.cfg._just_started = true;
	this.cfg._buttons_enabled = true;
	this.cfg._correct_selected = true;
}

update() {	
	this.c.update(this);
	if(!this.registry.has('player')) return;
	let player = this.registry.get('player');
//	console.log(player.pathTween.getValue(), Math.round(player.x * 100) / 100, Math.round(player.y * 100) / 100);//tmp debug to fix start / end 2 frame delay
	if(this.cfg._pause_scheduled !== undefined && this.cfg._pause_scheduled && player.isFollowing()) {
		player.pause();
		this.cfg._pause_scheduled = false;
		return;
	}
	
	if(!this.lib.player_update(player)) return;
	this.lib.camera_follow(player);
}

}

export default PlayMain

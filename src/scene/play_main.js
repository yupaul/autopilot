import AutopLIB from '../lib/lib';
import AutopCFG from '../config';

class PlayMain extends Phaser.Scene {
	
  constructor () {
    super({
      key: 'PlayMain'
    })
    this.cfg = AutopCFG.custom;
	this.lib = new AutopLIB(this);
  }

preload () {
     this.load.image('pause', './assets/images/pause.png');
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

	this.lib.config_preprocess(rwh, _w, _h);

	this.cameras.main.setSize(this.cameras.main.width, this.cfg.heightField);
	if(this.cameras.cameras.length < 2) this.cameras.add(0, this.cfg.heightField, this.cameras.main.width, this.cfg.heightControls).setBounds(0, this.cfg.heightField, this.cameras.main.width, this.cfg.heightControls);
	for (let _i in this.cameras.cameras) {
		this.cameras.cameras[_i].setScroll(0, 0);
		for (let _k in this.cameras.cameras[_i]) {
			if(_k.indexOf('_fade') === 0) this.cameras.cameras[_i][_k] = 0;
		}
	}
	
	this.lib.create();
	
	let pobj = this.lib.generate_path();	
	pobj.wall = this.add.image(Math.round(pobj.points.getEndPoint().x), 0, this.cfg.wallTextureName).setOrigin(0);
	
	let prev_tail = pobj.tail;
	this.registry.get('paths').push(pobj.points);
	this.registry.get('walls').push(pobj.wall);	
	this.lib.show_path(pobj);	
	this.lib.generate_obstacles(pobj);
	
	for(let i = 0; i < 3; i++) {				
		let pobj_correct = this.lib.generate_path(prev_tail);
		pobj_correct.wall = this.add.image(Math.round(pobj_correct.points.getEndPoint().x), 0, this.cfg.wallTextureName).setOrigin(0);
		let obs = this.lib.generate_obstacles(pobj_correct);
		let pobj_wrong = this.lib.generate_path(prev_tail, obs);
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
			//ease: 'Circ.easeInOut'
		}, 'player'));
	this.registry.get('player').setDepth(-100);
	
	this.input.events.on('POINTER_DOWN_EVENT', (event) => {
		this.lib.controls_on_click(event);
	});
	this.cfg._just_started = true;
	this.cfg._buttons_enabled = true;
	this.cfg._correct_selected = true;
}

update() {	
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

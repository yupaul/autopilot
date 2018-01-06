import AutopCFG from '../config';

class Menu extends Phaser.Scene {
	
  constructor () {
    super({
      key: 'Menu'
    })
    this.cfg = AutopCFG.custom;
    this.game_started = false;
  }

preload () {
	

}

create() {

	let w = this.game.config.width;
	let h = this.game.config.height;
	let gr = this.add.graphics();
	gr.lineStyle(...this.cfg.menu.border_style);
	gr.fillStyle(this.cfg.menu.bg_style);
	let _offset = (1 - this.cfg.menu.bg_proportion) * 0.5;
	let coords = [Math.round(w * _offset), Math.round(h * _offset), Math.round(w * this.cfg.menu.bg_proportion), Math.round(h * this.cfg.menu.bg_proportion)];
	gr.fillRect(...coords).strokeRect(...coords);

	let _play_button = this.add.graphics();
	let _hsize = this.cfg.menu.play_button_half_size;
	let _play_button_coords = [Math.round((0.5 - _hsize) * w),Math.round((0.5 - _hsize) * h),Math.round((0.5 - _hsize) * w),Math.round((0.5 + _hsize) * h),Math.round((0.5 + _hsize) * w),Math.round(h * 0.5)];
	let play_triangle = new Phaser.Geom.Triangle(..._play_button_coords);
	_play_button.fillStyle(this.cfg.menu.play_button_style).fillTriangle(..._play_button_coords);
        
	this.input.events.on('POINTER_DOWN_EVENT', (event) => {
//		if(Phaser.Geom.Triangle.Contains(play_triangle, event.x, event.y)) console.log('!!!!!!!!!!!!!!!!');//tmp
//		this.scene.sendToBack();
		if(Phaser.Geom.Triangle.Contains(play_triangle, event.x, event.y)) {
			if(!this.game_started) {
				this.scene.start('PlayMain');
				this.game_started = true;		
			} else {
				this.scene.wake('PlayMain');
			}		
			this.scene.stop();
		}
	});


}

}

export default Menu
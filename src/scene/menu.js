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
	gr.lineStyle(5, 0x000000, 1);
	gr.fillStyle(0xffffff);
	let coords = [Math.round(w * 0.02), Math.round(h * 0.02), Math.round(w * 0.96), Math.round(h * 0.96)];
	gr.fillRect(...coords).strokeRect(...coords);

	let _play_button = this.add.graphics();
	let _play_button_coords = [Math.round(w * 0.3),Math.round(h * 0.3),Math.round(w * 0.3),Math.round(h * 0.7),Math.round(w * 0.7),Math.round(h * 0.5)];
	let play_triangle = new Phaser.Geom.Triangle(..._play_button_coords);
	_play_button.fillStyle(0x000000).fillTriangle(..._play_button_coords);
        
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
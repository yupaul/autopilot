
class Menu extends Phaser.Scene {
	
  constructor () {
    super({
      key: 'Menu'
    })
//    this.cfg;
    this.c;
    this.game_started = false;
  }

preload () {	
	this.c = this.registry.get('c');
	this.c.get_menu();
	//this.cfg = this.c.get_menu();
}

create() {
	let _hsize = this.c.config_menu.play_button_half_size;

	let w = this.sys.game.config.width;
	let h = this.sys.game.config.height;
	let gr = this.add.graphics();
	gr.lineStyle(...this.c.config_menu.border_style);
	gr.fillStyle(this.c.config_menu.bg_style);
	let _offset = (1 - this.c.config_menu.bg_proportion) * 0.5;
	let coords = [Math.round(w * _offset), Math.round(h * _offset), Math.round(w * this.c.config_menu.bg_proportion), Math.round(h * this.c.config_menu.bg_proportion)];
	gr.fillRect(...coords).strokeRect(...coords);
	
	this.add.text(Math.round(w * _offset) + Math.round(w * this.c.config_menu.bg_proportion) - 50, Math.round(h * _offset) + Math.round(h * this.c.config_menu.bg_proportion) - 50, this.c.get_version(), {color: '#979797', fill: '#979797', fontSize: '14px', fontFamily: ' Tahoma'});

	let _play_button = this.add.graphics();
	let _play_button_dbg = this.add.graphics();
	let _play_button_coords = [Math.round((0.5 - _hsize) * w),Math.round((0.5 - _hsize) * h),Math.round((0.5 - _hsize) * w),Math.round((0.5 + _hsize) * h),Math.round((0.5 + _hsize) * w),Math.round(h * 0.5)];
	let play_triangle = new Phaser.Geom.Triangle(..._play_button_coords);
	_play_button.fillStyle(this.c.config_menu.play_button_style).fillTriangle(..._play_button_coords);
	
	let _play_button_coords_dbg = [w * 0.75, 60, (w * 0.75) + 30, 75, w * 0.75, 90];
	let play_triangle_dbg = new Phaser.Geom.Triangle(..._play_button_coords_dbg);
	_play_button.fillStyle(0xab32ba).fillTriangle(..._play_button_coords_dbg);

	let game_over_text = this.add.text(Math.round((0.5 + _hsize) * w * 0.5), Math.round((0.5 - _hsize) * h * 0.5), this.c.config_menu.gameOverText, this.c.config_menu.gameOverStyle);
	if(!this.registry.get('_do_gameover')) {
		game_over_text.visible = 0;
	} else {
		game_over_text.visible = 1;
		this.game_started = false;	
		this.registry.set('_do_gameover', false);
	}
//	console.log(game_over_text.getTextMetrics());//tmp
//	game_over_text.setStyle({color: '#fff'});
    
	this.input.on('pointerdown', (event) => {
//		if(Phaser.Geom.Triangle.Contains(play_triangle, event.x, event.y)) console.log('!!!!!!!!!!!!!!!!');//tmp
//		this.scene.sendToBack();
		if(Phaser.Geom.Triangle.Contains(play_triangle, event.x, event.y) || Phaser.Geom.Triangle.Contains(play_triangle_dbg, event.x, event.y)) {
			if(Phaser.Geom.Triangle.Contains(play_triangle_dbg, event.x, event.y)) window.game = this.sys.game;
			game_over_text.visible = 0;
			if(!this.game_started) {				
				this.scene.start('PlayMain');
				this.game_started = true;		
			} else {				
				this.scene.wake('PlayMain');
			}		
			this.scene.stop();
			this.registry.get('state').dbg = Phaser.Geom.Triangle.Contains(play_triangle_dbg, event.x, event.y);	
		}
	});


}

}

export default Menu
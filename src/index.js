import 'phaser';
import Configurator from './config/configurator';

///////////////////////////////////

class AutopGame extends Phaser.Game {

	constructor(configurator) {
	 	super(configurator.get_game());
		this.registry.set('c', configurator);
		if(configurator.config_boot.get('dbg')) window.game = this;
		this.registry.set('state', {
			dbg: configurator.config_boot.get('dbg')
		});		
		configurator.set_game(this.config, this.config.sceneConfig);
		this.events.on('boot', () => {
			window.onresize = () => {
				this.window_resize();
			}
			this.window_resize();
		});
	}

	window_resize() {
	    var canvas = document.querySelector('canvas');
	    var windowWidth = window.innerWidth;
	    var windowHeight = window.innerHeight;
	    var windowRatio = windowWidth / windowHeight;
	    var gameRatio = game.config.width / game.config.height;
	    if(windowRatio < gameRatio){
        	canvas.style.width = windowWidth + 'px';
	        canvas.style.height = (windowWidth / gameRatio) + 'px';
	    }
	    else{
        	canvas.style.width = (windowHeight * gameRatio) + 'px';
	        canvas.style.height = windowHeight + 'px';
	    }
	    this.resize(window.innerWidth, window.innerHeight);
	    //console.log('resized '+Math.random());//tmp to delete
	}
}

var game = new AutopGame(Configurator);

//game.scene.scenes[0].lib
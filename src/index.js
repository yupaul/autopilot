import 'phaser';
import Configurator from './config/configurator';

///////////////////////////////////

class AutopGame extends Phaser.Game {

	constructor(configurator) {
	 	super(configurator.get_game());
		this.registry.set('c', configurator);
		if(configurator.config_boot.get('dbg')) window.game = this;
	}
}

var game = new AutopGame(Configurator);

//game.scene.scenes[0].lib
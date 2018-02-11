import 'phaser';
import Configurator from './config/configurator';

///////////////////////////////////

class AutopGame extends Phaser.Game {

	constructor(configurator) {
	 	super(configurator.get_game());
		this.registry.set('c', configurator);
	}
}

var game = new AutopGame(Configurator);
//game.scene.scenes[0].lib
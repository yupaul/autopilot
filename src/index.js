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
	}
}

var game = new AutopGame(Configurator);

//game.scene.scenes[0].lib
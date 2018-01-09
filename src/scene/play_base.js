class PlayBase extends Phaser.Scene {
	
  constructor (scene_cfg, cfg, Lib) {
	super(scene_cfg);
	this.cfg = cfg;
  	this.lib = new Lib(this);
  }

}

export default PlayBase
var CFG = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'game_div',
    scene: {
        preload: preload,
        create: create,
		update: update
    },
	//other
	custom: {
		playerFillStyle: 0x0000ff,
		playerTrianglePoints: [0,0,0,20,10,10],
		playerWidthHeight: [20, 20],
		singlePathDuration: 5000,
		speed: 120,
		cameraOffset: 0.3,
		gen_path: {

		}
	}
};

var game = new Phaser.Game(CFG);
var player;
var PATHS;

var PathGenerator = new GenPath(CFG.custom.gen_path);

function preload ()
{

}

function create ()
{
	
	let cfg = CFG.custom;
	cfg._cameraOffset = Math.round(this.game.config.width * cfg.cameraOffset);
	
	var start_y = Math.round(this.game.config.height / 2);
	var min_y = cfg.playerWidthHeight[1];
	var max_y = this.game.config.height - min_y;
	
	
    var path1 = new Phaser.Curves.Path(50, 100).splineTo([ 164, 46, 274, 142, 412, 57, 522, 141, 664, 64 ]);
    var path2 = new Phaser.Curves.Path(664, 64).lineTo(1200, 300);
	var path3 = new Phaser.Curves.Path(1200, 300).lineTo(2500,400);
	var paths = [path1, path2, path3];
	PATHS = [].concat(paths);

    var graphics = this.add.graphics();
	var _player_graphics = this.make.graphics();
	_player_graphics.fillStyle(cfg.playerFillStyle).fillTriangle(...cfg.playerTrianglePoints).generateTexture('player', ...cfg.playerWidthHeight);
	
    graphics.lineStyle(1, 0xffffff, 1);

	paths.forEach((_p) => {_p.draw(graphics, Math.round(_p.getCurveLengths()[0]));});    

	//tmp to delete
	//10, 500 20, 460, 110, 430, 130, 520
	/*	
	let _np = (new Phaser.Geom.Line(110, 570, 130, 480)).getPoint(2.3);
	var p0 = new Phaser.Curves.Path(10, 500).cubicBezierTo(130, 480, 20, 460, 110, 570).cubicBezierTo(310, 520, Math.round(_np.x), Math.round(_np.y), 300, 420);
	p0.draw(graphics, 128);
	*/
	//console.log(p0.getPoints(120));
	//tmp end
	
	var follower_config = {
        positionOnPath: true,
        duration: cfg.singlePathDuration,        
        repeat: 0,
        rotateToPath: true,
        verticalAdjust: true
	}
	
	player = multipath_follower(this, paths, follower_config, 'player');
}

function update() {		
	if(player.x > CFG.custom._cameraOffset) this.cameras.main.setScroll(Math.round(player.x) - CFG.custom._cameraOffset, 0);
}

function multipath_follower(sc, paths, config, texture) {	
	let _p = paths.shift();
	config.duration = Math.round((_p.getCurveLengths()[0] / CFG.custom.speed) * 1000);
    let _player = sc.add.follower(_p, 0, 0, texture);	
	
	config.onComplete = () => {
			let _path = paths.shift();
			if(_path === undefined) return;
			config.duration = Math.round((_path.getCurveLengths()[0] / CFG.custom.speed) * 1000);
			_player.setPath(_path, config);
		},
	config.onCompleteScope = sc;
	
    _player.start(config);
	return _player;	
}

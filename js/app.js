var CFG = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'game_div',
    scene: {
        preload: preload,
        create: create,
		//update: update //tmp
    },
	//other
	custom: {
		revertWidthHeight: false,
		playerFillStyle: 0x0000ff,
		playerTrianglePoints: [0,0,0,20,10,10],
		playerWidthHeight: [20, 20],
		singlePathDuration: 5000,
		speed: 80,
		cameraOffset: 0.3,
		start_x: 10,
		gen_path: {
			min_path_x_length: 0.4,
			max_path_x_length: 0.6,
			line_probability: 3000, //tmp
			long_short_probability: 3,
			double_segment_probability: 1000, //tmp
			segment_avg: 0.5,
			first_line_length: [20, 50]
		}
	}
};

var game = new Phaser.Game(CFG);
var player;
var PATHS;
var PathGenerator;

function preload ()
{

}

function config_preprocess(cfg, rwh, _w, _h) {
	cfg._cameraOffset = Math.round(this.game.config[_w] * cfg.cameraOffset);
	
	cfg.gen_path.start_x = cfg.start_x;
	cfg.gen_path.start_y = Math.round(this.game.config[_h] / 2);
	cfg.gen_path.min_y = cfg.playerWidthHeight[1];
	cfg.gen_path.max_y = this.game.config[_h] - cfg.gen_path.min_y;
	cfg.gen_path.min_path_x_length = Math.round(this.game.config[_w] * cfg.gen_path.min_path_x_length);
	cfg.gen_path.max_path_x_length = Math.round(this.game.config[_w] * cfg.gen_path.max_path_x_length);
	cfg.gen_path.min_segment_x_length = cfg.playerWidthHeight[0] * 3;
	cfg.gen_path.min_segment_y_length = cfg.playerWidthHeight[1];
	cfg.gen_path.rwh = rwh;
	cfg.gen_path.screen_length = CFG[_w];
}	

function create ()
{
	
	let cfg = CFG.custom;
	var rwh = cfg.revertWidthHeight;
	var _w = rwh ? 'height' : 'width';
	var _h = rwh ? 'width' : 'height';

	config_preprocess(cfg, rwh, _w, _h);
	var paths = [];
	PathGenerator = new GenPath(cfg.gen_path, this);
	
	var _last_line = false;
	for(let _i = 0; _i < 2; _i++) {		
		let _p = PathGenerator.generate(_last_line, AutopUTIL.coinflip(), AutopUTIL.coinflip());
		_last_line = _p.line;
		paths.push(_p.path);
	}
	/*//tmp to delete
    var path1 = new Phaser.Curves.Path(50, 100).splineTo([ 164, 46, 274, 142, 412, 57, 522, 141, 664, 64 ]);
    var path2 = new Phaser.Curves.Path(664, 64).lineTo(1200, 300);
	var path3 = new Phaser.Curves.Path(1200, 300).lineTo(2500,400);
	var paths = [path1, path2, path3];
	*/
	PATHS = [].concat(paths);
	console.log(PATHS);//tmp

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
	
	//player = multipath_follower(this, paths, follower_config, 'player');//tmp
}

function update() {		
	if(!CFG.custom.revertWidthHeight) {
		if(player.x > CFG.custom._cameraOffset) {
			let _p = Math.round(player.x) - CFG.custom._cameraOffset;
			if(_p > this.cameras.main.scrollX) this.cameras.main.setScroll(_p, 0);
		}
	} else {
		if(player.y > (CFG.height - CFG.custom._cameraOffset)) {
			let _p = Math.round(player.y) + CFG.custom._cameraOffset	
			if(_p < this.cameras.main.scrollY) this.cameras.main.setScroll(0, _p);
		}
	}
}

function multipath_follower(sc, paths, config, texture) {	
	let _p = paths.shift();
	config.duration = Math.round((_p.getCurveLengths()[0] / CFG.custom.speed) * 1000);
    let _player = sc.add.follower(_p, 0, 0, texture);	
	
	config.onComplete = () => {
			let _path = paths.shift();
			if(_path === undefined) return;
			let _clen = _path.getCurveLengths();
			config.duration = Math.round((_clen[_clen.length - 1] / CFG.custom.speed) * 1000);
			_player.setPath(_path, config);
		},
	config.onCompleteScope = sc;
	
    _player.start(config);
	return _player;	
}

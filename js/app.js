class PointsPath {
	constructor(points) {
		this.points = [];
		if(points !== undefined && typeof points === 'object' && points.hasOwnProperty(0)) this.setPoints(points);		
	}

	setPoints(points) {
		this.points = points;
	}
	
	getCurveLengths() {
		return [this.points.length];
	}
	
	getPoints() {
		return this.points;
	}
	
	movePoints(x, y) {
		let out = [];
		for(let i = 0; i < this.points.length; i++) {
			out.push(new Phaser.Math.Vector2(this.points[i].x + x, this.points[i].y + y));
		}
		return out;
	}
	
	movePointsToZero() {
		return this.movePoints(-this.points[0].x, -this.points[0].y);
	}
	
	addPoint(p) {
		this.points.push(p);
	}
	
	getStartPoint(out) {
		if (out === undefined) { out = new Phaser.Math.Vector2(); }
		return out.copy(this.points[0]);		
	}
	
	getPoint(i, out) {
		//console.log(i);//tmp to delete
		if (out === undefined) { out = new Phaser.Math.Vector2(); }
		if(i === 0) return out.copy(this.points[0]);
		if(i < 1) i = this.points.length * i;
		i = Math.round(i);
		if(i >= this.points.length) i = this.points.length - 1;					
		return out.copy(this.points[i]);
	}
	
}

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
		revertWidthHeight: false,
		playerFillStyle: 0x0000ff,
		playerTrianglePoints: [0,0,0,20,10,10],
		playerWidthHeight: [20, 20],		
		speed: 100,
		cameraOffset: 0.3,
		start_x: 10,
		heightControlsRate: 0.2,
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
	
	cfg.heightControls = Math.round(this.game.config.height * cfg.heightControlsRate);
	cfg.heightField = this.game.config.height - cfg.heightControls;
	
	cfg.gen_path.start_x = cfg.start_x;
	cfg.gen_path.start_y = Math.round(cfg.heightField / 2);
	cfg.gen_path.min_y = cfg.playerWidthHeight[1];
	cfg.gen_path.max_y = (rwh ? this.game.config[_h] : cfg.heightField) - cfg.gen_path.min_y;
	cfg.gen_path.min_path_x_length = Math.round(this.game.config[_w] * cfg.gen_path.min_path_x_length);
	cfg.gen_path.max_path_x_length = Math.round(this.game.config[_w] * cfg.gen_path.max_path_x_length);
	cfg.gen_path.min_segment_x_length = cfg.playerWidthHeight[0] * 3;
	cfg.gen_path.min_segment_y_length = cfg.playerWidthHeight[1];
	cfg.gen_path.rwh = rwh;
	cfg.gen_path.screen_length = CFG[_w];
}	

function _create_tmp(game) { //tmp
	let cfg = CFG.custom;
	var points_or1 = [[10, 80], [70, 150], [145, 265], [220, 115], [285, 55]];
	var tail1 = [[400, 150], [430, 220], [485, 90]];
	var spline1 = new Phaser.Curves.Spline(points_or1.concat(tail1));
	var spline2 = new Phaser.Curves.Spline(tail1.concat([[515,95], [600, 95], [670, 210], [725, 180], [810, 310]]));

	var gr = game.add.graphics();
	gr.lineStyle(1, 0xffffff, 1);
	
	var length1 = Math.floor(spline1.getLength());
	var points1 = new PointsPath();
	for(let i = 0; i < length1; i++) {
		let _p = spline1.getPoint(i / length1);
		points1.addPoint(_p);
		if(Math.round(_p.x) === tail1[0][0] && Math.round(_p.y) === tail1[0][1]) break;
	}
	
	//var points1 = spline1.getPoints(length1);
	gr.strokePoints(points1.getPoints());
	var length2 = Math.floor(spline2.getLength());
	var points2 = new PointsPath(spline2.getPoints(length2));
	gr.strokePoints(points2.getPoints());	
	
	var grs_rect = game.make.graphics();
	grs_rect.lineStyle(4, 0x890021, 1);
	grs_rect.strokeRect(0, 0, 1200 * 0.2, 600 * 0.2 - 10).generateTexture('grs_rect',1200 * 0.2, 600 * 0.2 - 10); 
	game.registry.get('buttons').push({button: game.add.image(0, 0, 'grs_rect').setPosition(600, cfg.heightField + 60).setInteractive()});	
	let __bounds = game.registry.get('buttons')[0].button.getBounds();
	game.registry.get('buttons')[0].bounds = {
		x1 : __bounds.x,
		x2 : __bounds.x + __bounds.width,
		y1 : __bounds.y,
		y2 : __bounds.y + __bounds.height,
	};
	//console.log('grs_rect', game.registry.get('buttons')[0]);//tmp
	
	var grs = game.make.graphics();
	grs.lineStyle(20, 0xff0000, 1);	
	//grs.scale(0.2, 0.2);
	//grs.strokePoints(points1.movePointsToZero());	
	grs.strokePoints(points1.getPoints());		
	grs.generateTexture('grs');
	var sprite = game.add.image(0, 0, 'grs').setScale(0.2).setPosition(600, cfg.heightField + 60 + 1);	
		
	/*var tmp23 = game.add.graphics();
	tmp23.fillStyle(0xff0000, 1);	
	tmp23.fillRect(0, 0, 100, 100).setPosition(900,250);
	tmp23.generateTexture('tmp23', 100, 100);	
	var tmp23s = game.add.sprite(900, 250, 'tmp23');
	tmp23s.setInteractive();	*/
	
	game.input.events.on('POINTER_DOWN_EVENT', function (event) {
		let buttons = game.registry.get('buttons');
		//console.log(event, game.registry.get('buttons')[0].getBounds());//tmp
		for(let i = 0; i < buttons.length; i++) {
			if(event.x > buttons[i].bounds.x1 && event.y > buttons[i].bounds.y1 && event.x < buttons[i].bounds.x2 && event.y < buttons[i].bounds.y2) {
				console.log(event);//tmp
				break;
			}
		}
	});
	//console.log('!!!', sprite);//tmp
	
	var gr_separator_line = game.add.graphics();//{x : 100, y : 500}
	gr_separator_line.lineStyle(3, 0xff0000, 1);	
	let _l = new Phaser.Curves.Line([0, cfg.heightField + 1, game.game.config.width + 1, cfg.heightField + 1]);
	_l.draw(gr_separator_line, game.game.config.width + 1);
	//console.log('_l', _l);//tmp
	
	
	return [points1, points2];
}

function create ()
{
	
	let cfg = CFG.custom;
	var rwh = cfg.revertWidthHeight;
	var _w = rwh ? 'height' : 'width';
	var _h = rwh ? 'width' : 'height';
	
	this.registry.set('buttons', []);

	config_preprocess(cfg, rwh, _w, _h);
	
	this.cameras.main.setSize(this.cameras.main.width, cfg.heightField);
	this.cameras.add(0, cfg.heightField, this.cameras.main.width, cfg.heightControls).setBounds(0, cfg.heightField, this.cameras.main.width, cfg.heightControls);
	
	var paths = _create_tmp(this);
	//PathGenerator = new GenPath(cfg.gen_path, this);
	
	/*//tmp to delete
	var _last_line = false;
	for(let _i = 0; _i < 2; _i++) {		
		let _p = PathGenerator.generate(_last_line, AutopRand.coinflip(), AutopRand.coinflip());
		_last_line = _p.line;
		paths.push(_p.path);
	}*/
	/*//tmp to delete
    var path1 = new Phaser.Curves.Path(50, 100).splineTo([ 164, 46, 274, 142, 412, 57, 522, 141, 664, 64 ]);
    var path2 = new Phaser.Curves.Path(664, 64).lineTo(1200, 300);
	var path3 = new Phaser.Curves.Path(1200, 300).lineTo(2500,400);
	var paths = [path1, path2, path3];
	*/
	PATHS = [].concat(paths);
	//console.log(PATHS);//tmp

    //var graphics = this.add.graphics();
	var _player_graphics = this.make.graphics();
	_player_graphics.fillStyle(cfg.playerFillStyle).fillTriangle(...cfg.playerTrianglePoints).generateTexture('player', ...cfg.playerWidthHeight);
	
    //graphics.lineStyle(1, 0xffffff, 1);

	//paths.forEach((_p) => {_p.draw(graphics, Math.round(_p.getCurveLengths()[0]));});    

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
        repeat: 0,
        rotateToPath: true,
        verticalAdjust: true
	}
	
	player = multipath_follower(this, paths, follower_config, 'player');
	console.log(this.registry);//tmp
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
	let _clen0 = _p.getCurveLengths();
	config.duration = Math.round((_clen0[_clen0.length - 1] / CFG.custom.speed) * 1000);
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

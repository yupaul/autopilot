var CFG = {
    type: Phaser.AUTO,
    width: 800,
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
		singlePathDuration: 3000,
		cameraOffset: 0.35
	}
};

var game = new Phaser.Game(CFG);
var player;

function preload ()
{
    //this.load.image('lemming', 'lemming.png');//tmp to delete
}

function create ()
{
	
	let cfg = CFG.custom;
	cfg._cameraOffset = Math.round(this.game.config.width * cfg.cameraOffset)
    var path1 = new Phaser.Curves.Path(50, 100).splineTo([ 164, 46, 274, 142, 412, 57, 522, 141, 664, 64 ]);
    var path2 = new Phaser.Curves.Path(664, 64).lineTo(1200, 300);
    //var path3 = new Phaser.Curves.Path(1200, 300).circleTo(100);
	var path3 = new Phaser.Curves.Path(1200, 300).lineTo(1500,400);
	var paths = [path1, path2, path3];

    var graphics = this.add.graphics();
	var _player_graphics = this.make.graphics();
	_player_graphics.fillStyle(cfg.playerFillStyle).fillTriangle(...cfg.playerTrianglePoints).generateTexture('player', ...cfg.playerWidthHeight);
	
    graphics.lineStyle(1, 0xffffff, 1);

    //path1.draw(graphics, 128);
    //path2.draw(graphics, 128);
    //path3.draw(graphics, 128);
	paths.forEach((_p) => {_p.draw(graphics, 128);});
    
    //var lemming = this.add.follower(path1, 0, 0, 'lemming');	
	
	var follower_config = {
        positionOnPath: true,
        duration: cfg.singlePathDuration,
        //yoyo: true,
        repeat: 0,
        rotateToPath: true,
        verticalAdjust: true,
		/*
		onComplete:
		onCompleteScope:
		onCompleteParams:
		*/
	}
	
	player = multipath_follower(this, paths, follower_config, 'player');	
	//this.cameras.main.startFollow(lemming);
	/*
    lemming.start(follower_config);

    this.input.events.on('POINTER_DOWN_EVENT', function (event) {

        current++;

        if (current === 3)
        {
            current = 0;
        }

        if (current === 0)
        {
            lemming.setPath(path1);
        }
        else if (current === 1)
        {
            lemming.setPath(path2);
        }
        else
        {
            lemming.setPath(path3);
        }

    });
	*/
}

function update() {		
	if(player.x > CFG.custom._cameraOffset) this.cameras.main.setScroll(Math.round(player.x) - CFG.custom._cameraOffset, 0);
}

function multipath_follower(sc, paths, config, texture) {
	//var path_index = 0;
    let _player = sc.add.follower(paths.shift(), 0, 0, texture);	
	
	config.onComplete = () => {
			//path_index++;
			//if(path_index === paths.length) return;//path_index = 0;
			let _path = paths.shift();
			if(_path === undefined) return;
			_player.setPath(_path, config);
		},
	config.onCompleteScope = sc;
		//onCompleteParams:	
	
    _player.start(config);
	return _player;
	
}

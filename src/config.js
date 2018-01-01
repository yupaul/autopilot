import PlayMain from './scene/play_main';

let AutopCFG = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    backgroundColor: '#ffffff',//'#2d2d2d'
    parent: 'game_div',
    scene: [PlayMain],	//other
	custom: {
		dbg: true, //tmp
		revertWidthHeight: false,
		playerFillStyle: 0x0000ff,
		playerTrianglePoints: [0,0,0,30,15,15],
		playerWidthHeight: [30, 30],		
		playerNumBodyParts: 120,
		playerBodyEaSteps: 3,
		speed: 120,
		speedUp: 5,
		cameraOffset: 0.2,
		start_x: 10,
		heightControlsRate: 0.2,
		pathLength: 0.5,
		gridCellLineStyle: false, //[1, 0x627261, 1] //tmp
		gridCellFillStyle: 0x007090,
		gridCellTextureName: 'grid_cell',
		
		showPathStyle: [1, 0xff0000, 0.2],
		showPathSubSet: 20,
		showPathRadius: 4,
		showPaths: true,
		showPathTextureName: 'show_path_circle',
		
		randomizeButtons: true, //tmp
		gameOver: true, //tmp
		wallWidth: 15,
		wallStyle: 0xAB2121,
		wallOpenAlpha: 0.03,
		wallTextureName: 'wall',
		buttonEnableDelay: [600, 1000],
		rtreeCoeff: 1.2,
		gen_path: {
			path_x_spread: 0.1,
			scale_y: 6,
			long_short_probability: 3,			
			long_multiplier: 2,
			big_jump_probability: 7,
			small_jump_coeff: 0.35,
			min_max_segments: [4, 6],
			first_line_length: [60, 120],
			next_x_method: 'softmax', //'softmax', 'minmax', 'longshort'
			minmax_method_min_max: [0.5, 1.5],
			spaced_points: true
		},
		controls: {
			separator_line_style: [3, 0xff0000, 1],
			button_bounds_style: [4, 0x890021, 1],
			button_path_style: [20, 0xff0000, 1],
			button_height: 0.9,
			button_gap: 50,
			button_disabled_alpha: 0.25
		}
	}
};

export default AutopCFG
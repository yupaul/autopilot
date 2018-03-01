
export let _config_global = {
		v: '0.252',
		theme_name: 'p3',
		levels : [
			{},
			{},
			{}
		],
		dbg: false, //tmp
		twoCorrectChance: 3, //tmp
		fourPathsChance: 3, //tmp
		revertWidthHeight: false, // (_h > _w) //tmp
		playerFillStyle: 0xffffff, //0x0000ff
		playerTrianglePoints: [0,0,0,30,15,15],
		playerWidthHeight: [30, 30],		
		playerNumBodyParts: 45,
		playerNumBodyPartsCoeff: 0.04,
		playerBodyEaSteps: 3,
		speedCoeff: 0.2, //0.12, 0.15
		useFrames: false,
//		speedUpCoeff: 0.07,
//		speed: 120,
		speedUp: 8, //7
		cameraOffset: 0.3,
		start_x: 10,
		heightControlsRate: 0.2,
		pathLength: 0.5,
		maxNumPaths: 4,
		gridCellLineStyle: false, //[1, 0x627261, 1] //tmp
		gridCellFillStyle: 0xffffff, // 0x007090
		gridCellTextureName: 'grid_cell',
		gridCellScales: [1,2,3,4],
		sectionCounterStyle: {color: '#cd3221', fill: '#cd3221', fontSize: '40px Tahoma'},
		sectionCounterName: 'section_counter',
		
		showPaths: true,
		show_path: {
			styles: [[1, 0xffffff, 0.4]], //[1, 0xff0000, 0.2],
			subset: 20,
			radius: 4,		
			texture_name: 'show_path_circle',
		},
	
		randomizeButtons: true, //tmp
		gameOver: true, //tmp
		gameOverFade: 1200,
		wallWidth: 20,
		wallStyle: 0xffffff, //0xAB2121
		wallOpenAlpha: 0.03,
		wallTextureName: 'wall',
		wallMoveDuration: [400, 800],
		wallMoveEase: 'Sine.easeInOut',		
		buttonEnableDelay: [400, 800],
		rtreeCoeff: 1.2,
		gen_path: {
			path_x_spread_min: 0.1,
			path_x_spread_max: 0.1,
			scale_y: 6,				
			big_jump_probability: 7,
			small_jump_coeff: 0.35,
			min_max_segments: [4, 6],
			first_line_length: [60, 120],
			spaced_points: true,
			minipath_offset: 3,			
			next_x_method: 'minmax', //'softmax', 'minmax', 'longshort'
			long_short_probability: 3, //longshort
			long_multiplier: 2, //longshort				
			minmax_method_min_max: [0.4, 1.7], //minmax
		},
		gen_obs: {
			prev_collide_limit: 4
		},
		controls: {
			separator_line_style: [3, 0xffffff, 1], //[3, 0xff0000, 1],
			button_bounds_style: [4, 0xffffff, 1], //[4, 0x890021, 1],
			button_path_style: [20, 0xffffff, 1], //[20, 0xff0000, 1]
			button_height: 0.9,
			button_gap: 50,
			button_disabled_alpha: 0.25,
			button_disabled_type: 'alpha',
			pause_button_x_position: 0.2
		},
		menu: {
			gameOverStyle: {color: '#ffffff', fill: '#ffffff', fontSize: '60px Tahoma'},
			gameOverText: 'Game Over',			
			border_style: [5, 0xffffff, 1],
			bg_style: 0x000000,
			bg_proportion: 0.96,
			play_button_style: 0xffffff,
			play_button_half_size: 0.2
		},
		bg_particles: []
};
import PlayMain from './scene/play_main';
import Menu from './scene/menu';

let parent_element_id = 'game_div';
//let _w = document.getElementById(parent_element_id).innerWidth;
//let _h = document.getElementById(parent_element_id).innerHeight;
let _w = window.innerWidth;
let _h = window.innerHeight;


let AutopCFG = {
    type: Phaser.AUTO,
    width: _w, //1200
    height: _h, //600
    backgroundColor: '#000000',//'#2d2d2d', '#ffffff'
    parent: parent_element_id,
    scene: [Menu, PlayMain],	//other
	custom: {
		dbg: true, //tmp
		revertWidthHeight: false, // (_h > _w) //tmp
		playerFillStyle: 0xffffff, //0x0000ff
		playerTrianglePoints: [0,0,0,30,15,15],
		playerWidthHeight: [30, 30],		
		playerNumBodyParts: 45,
		playerNumBodyPartsCoeff: 0.04,
		playerBodyEaSteps: 3,
		speedCoeff: 0.08,
//		speedUpCoeff: 0.07,
//		speed: 120,
		speedUp: 8,
		cameraOffset: 0.2,
		start_x: 10,
		heightControlsRate: 0.2,
		pathLength: 0.5,
		maxNumPaths: 4,
		gridCellLineStyle: false, //[1, 0x627261, 1] //tmp
		gridCellFillStyle: 0xffffff, // 0x007090
		gridCellTextureName: 'grid_cell',
		gameOverStyle: {color: '#ffffff', fill: '#ffffff', fontSize: '60px Tahoma'},
		gameOverTest: 'Game Over',
		sectionCounterStyle: {color: '#cd3221', fill: '#cd3221', fontSize: '40px Tahoma'},
		sectionCounteName: 'section_counter',
		
		showPathStyle: [1, 0xffffff, 0.4], //[1, 0xff0000, 0.2],
		showPathSubSet: 20,
		showPathRadius: 4,
		showPaths: true,
		showPathTextureName: 'show_path_circle',
		
		randomizeButtons: true, //tmp
		gameOver: true, //tmp
		gameOverFade: 1200,
		wallWidth: 15,
		wallStyle: 0xffffff, //0xAB2121
		wallOpenAlpha: 0.03,
		wallTextureName: 'wall',
		buttonEnableDelay: [600, 1000],
		rtreeCoeff: 1.2,
		gen_path: {
			path_x_spread_min: 0.1,
			path_x_spread_max: 0.1,
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
			separator_line_style: [3, 0xffffff, 1], //[3, 0xff0000, 1],
			button_bounds_style: [4, 0xffffff, 1], //[4, 0x890021, 1],
			button_path_style: [20, 0xffffff, 1], //[20, 0xff0000, 1]
			button_height: 0.9,
			button_gap: 50,
			button_disabled_alpha: 0.25,
			pause_button_x_position: 0.2
		},
		menu: {
			border_style: [5, 0xffffff, 1],
			bg_style: 0x000000,
			bg_proportion: 0.96,
			play_button_style: 0xffffff,
			play_button_half_size: 0.2
		}
	}
};

export default AutopCFG
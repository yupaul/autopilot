import PlayMain from './scene/play_main';
import Menu from './scene/menu';

function config() {
	let parent_element_id = 'game_div';

	let out = {
		type: Phaser.AUTO,
		width: window.innerWidth, //1200
		height: window.innerHeight, //600
		backgroundColor: '#000000',//'#2d2d2d', '#ffffff'
		parent: parent_element_id,
		scene: [Menu, PlayMain],	//other
		custom: {
			dbg: true, //tmp
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
			useFrames: true,
//			speedUpCoeff: 0.07,
//			speed: 120,
			speedUp: 8, //7
			cameraOffset: 0.3,
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
			sectionCounterName: 'section_counter',
		
			showPathStyle: [1, 0xffffff, 0.4], //[1, 0xff0000, 0.2],
			showPathSubSet: 20,
			showPathRadius: 4,
			showPaths: true,
			showPathTextureName: 'show_path_circle',
		
			randomizeButtons: true, //tmp
			gameOver: true, //tmp
			gameOverFade: 1200,
			wallWidth: 20,
			wallStyle: 0xffffff, //0xAB2121
			wallOpenAlpha: 0.03,
			wallTextureName: 'wall',
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
	let cstm = out.custom;
	let cstmg = cstm.gen_path;
	let rwh = cstm.revertWidthHeight;
	var _w = rwh ? 'height' : 'width';
	var _h = rwh ? 'width' : 'height';
	let cfg_w, cfg_h;
	cstm._rwhcfg = {
		w : _w,
		h : _h
	};

	cstm._current_camera_offset = 0;
	cstm._current_camera_inc_speed = 0;		
		
	cstm.heightControls = Math.round(out.height * cstm.heightControlsRate);
	cstm.heightField = out.height - cstm.heightControls;		
		
	if(rwh) {
		cfg_w = cstm.heightField;
		cfg_h = out[_h];
	} else {
		cfg_w = out[_w];
		cfg_h = cstm.heightField;
	}	
	cstm._rwhcfg.cfg_w = cfg_w;
	cstm._rwhcfg.cfg_h = cfg_h;
		
	cstm._cameraOffset = Math.round(cfg_w * (rwh ? (1 - cstm.cameraOffset) : cstm.cameraOffset));
	
	cstm.grid = (cstm.playerWidthHeight[0] + cstm.playerWidthHeight[1]);
	cstm.rtreeOffset = Math.round((cstm.playerWidthHeight[0] + cstm.playerWidthHeight[1]) * cstm.rtreeCoeff);
	cstm.speed = Math.round(cfg_w * cstm.speedCoeff);
//	cstm.speedUp = Math.round(cstm.speed * cstm.speedUpCoeff);
	if(cstm.speed_intial === undefined) {
		cstm.speed_initial = cstm.speed;
	} else {
		cstm.speed = cstm.speed_initial;
	}		
	cstm.speedMult = cstm.useFrames ? 100 : 1000;
	cstm.playerNumBodyParts = Math.round(cfg_w * cstm.playerNumBodyPartsCoeff);
	cstmg.start_x = rwh ? (cstm.heightField - cstm.start_x) : cstm.start_x;
	cstmg.min_y = cstm.playerWidthHeight[1];
	cstmg.start_y = Math.round(cstm.heightField * 0.5 + cstmg.min_y);		
	cstmg.max_y = cfg_h - cstmg.min_y;
	cstmg.scale_y_length = (cstmg.max_y - cstmg.min_y) / (cstmg.scale_y + 1);
	cstmg.min_path_x_length = Math.round(cfg_w * (0.5 - cstmg.path_x_spread_min));
	cstmg.max_path_x_length = Math.round(cfg_w * (0.5 + cstmg.path_x_spread_max));
	cstmg.min_segment_length = cstm.playerWidthHeight[0] + cstm.playerWidthHeight[1];
	cstmg.rwh = rwh;
	cstmg.screen_length = cfg_w;

	return out;
}

let AutopCFG = config();

export default AutopCFG
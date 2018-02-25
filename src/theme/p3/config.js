
let _config = {	
	playerWidthHeight: [34, 34],
	rtreeCoeff: 0.3,
	showPaths: true,
	show_path: {
		styles: [
			[5, 0xffffff, 0.9],
			[10, 0xededed, 0.25],
			[15, 0xdedede, 0.15],
			[25, 0xffffff, 0.05]
		],
		subset: 9
	},
	gridCellLineStyle: [1, 0xffffff, 1],
	gridFullCells: true,
	wallOpenAlpha: 0.12,
	wallOpenBlitter: true,
	wallMoveDuration: [400, 800],
	wallMoveEase: 'Sine.easeInOut',
	useFarMask: true,
	farMaskMoveDuration: 700,
	farMaskOffset: 300,
	//tmp start
	gen_obs: {		
		//to_occupy: 0.85, 
		gridCellScales: [[1,0.05], [2, 0.3], [3, 0.3], [4, 0.3]],
		imp_probability: 1,
		notimp_probability: 0.1,
		texture_selector: 'frame',
		rotate: [2000, 22000],
		img_scaling_step: 0.1
	},/*
	gen_obs: {
		type: 'img'		
	},	*/ //tmp end
	player_body_emitter: {
		follow: {
			chance: 2,
			position_range : [50, 60],
			gravity_y_multiplier: 2,
			gravity_x_range: [20, 80],
		},
		emitter: {
			x: 0,
			y: {min: -100, max: 100},
			gravityX: -50,
			blendMode: 'NORMAL',
			rotate: {min: -60, max: 60},
			scale: { start: 0.7, end: 0 },
			speed: { min: -4, max: -8 },
			alpha: { start: 0.4, end: 0, ease: 'Quartic.easeOut' },
			frequency: 10,
			lifespan: 2250,	
			//acceleration: 100,
			//radial: true,
			angle: {min: -150, max: -30},
			delay: 100,			
			quantity: 3		
		},
		/* //tmp
		zone: {
			//source: new Phaser.Geom.Circle(0, 0, 10),
			type: 'edge',
			quantity: 6,
			yoyo: false
		}*/
	}
	
	
	
	
	
	
	
}

export default _config;
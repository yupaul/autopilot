
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
			gravityY: 0,
			blendMode: 'NORMAL',
			rotate: {min: -60, max: 60},
			scale: { start: 0.7, end: 0 },
			speed: { min: -25, max: -50 },
			alpha: { start: 0.6, end: 0, ease: 'Quartic.easeOut' },
			frequency: 2,
			lifespan: 1400,	
			//acceleration: 100,
			//radial: true,
			//angle: {min: -120, max: -60},
			delay: 100,			
			quantity: 1		
		},
		/* //tmp
		zone: {
			//source: new Phaser.Geom.Circle(0, 0, 10),
			type: 'edge',
			quantity: 6,
			yoyo: false
		}*/
	},
	bg_particles: [
	{
		total: 9,
		alpha: [0.2, 0.9],
		scale: [0.3, 0.7],
		moving: 6,
		speed: [5, 90],
		pause: [1000, 3000]
	},
	{
		total: 13,
		alpha: [0.2, 0.5],
		scale: [0.4, 0.8],
		moving: 4,
		speed: [10, 80],
		pause: [2000, 4000]
	}
	]
}

export default _config;

let _config = {	
	playerWidthHeight: [34, 34],
	rtreeCoeff: 0.8,
	showPaths: false,		
	gridCellLineStyle: [1, 0xffffff, 1],
	gridFullCells: true,
	//tmp start
	gen_obs: {		
		type: 'square',		
		chance_multiplier: 10,
		to_occupy: 0.3,
		gridCellScales: [[1,0.05], [2, 0.2], [3, 0.45], [4, 0.3]],
		imp_probability: 0.7
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
			frequency: 20,
			lifespan: 2250,	
			//acceleration: 100,
			//radial: true,
			angle: {min: -150, max: -30},
			delay: 100,			
			quantity: 2		
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
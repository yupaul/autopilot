
let _config = {	
	playerWidthHeight: [34, 34],
	rtreeCoeff: 1.2,
	showPaths: false,
	player_body_emitter: {
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
			lifespan: 2000,	
			//acceleration: 100,
			//radial: true,
			angle: {min: -150, max: -30},
			delay: 100,			
			quantity: 2		
		},
		zone: {
			//source: new Phaser.Geom.Circle(0, 0, 10),
			type: 'edge',
			quantity: 6,
			yoyo: false
		}
	}
	
	
	
	
	
	
	
}

export default _config;
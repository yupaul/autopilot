
let _config = {	
	playerWidthHeight: [70, 70],
	rtreeCoeff: 0.5,
	showPaths: false,
	player_body_emitter: {
		emitter: {
			x: -10,
			y: {min: -30, max: 30},
			blendMode: 'LIGHTEN',
			scale: { start: 0.8, end: 0.1 },
			speed: { min: -4, max: -8 },
			alpha: { start: 0.6, end: 0, ease: 'Quartic.easeInOut' },
			frequency: 50,
			lifespan: 1200,		
			//radial: true,
			//angle: {min: 220, max: 310},
			delay: 0,			
			quantity: 1
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
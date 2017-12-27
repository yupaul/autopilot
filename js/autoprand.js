var AutopRand = {

	coinflip: function() {
		return (this.randint(0, 1) > 0);
	},
	
	randint: function(min, max) {
		let range = max - min + 1;
		return (((Math.random() * range) | 0) + min);
	},
	
	chanceOneIn: function(v) {
		return (this.randint(1, v) === v);
	},
	
	randpow: function() {
		let _r = Math.random();
		return (_r * (_r > 0.5 ? _r : (1 - _r)));
	},
	
	softmax(num, precision) {
		if(precision === undefined) precision = 1000;
		let nums = [];
		for(let i = 0; i < num; i++) {
			nums.push(this.randint(1, precision));
		}
		let s = nums.reduce((a,b) => {return a + b;});
		return nums.map((_x) => {return _x / s;});
	}
}
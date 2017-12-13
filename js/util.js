var AutopUTIL = {

	coinflip: function() : boolean {
		return (this.randint(0, 1) > 0);
	},
	
	randint: function(min : number, max : number) : number {
		let range = max - min + 1;
		return (((Math.random() * range) | 0) + min);
	},
	
	chanceOneIn: function(v: number) : boolean {
		return (this.randint(1, v) === v);
	}

}
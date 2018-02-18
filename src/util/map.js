import AutopSet from './set';

export class AutopMap extends Phaser.Structs.Map {

	append(k, v) {
		if(!this.has(k)) {
			this.set(k, [v]);
		} else {
			this.get(k).push(v);
		}
	}

}


export class AutopMapOfSets extends AutopMap {

	append(k, v) {
		if(!this.has(k)) this.set(k, new AutopSet());
		this.get(k).set(v);		
	}
	
	addset(k, v) {
		this.set(k, new AutopSet(v));
	}	
	
}
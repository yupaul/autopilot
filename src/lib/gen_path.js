
class AutopGenPath {

	constructor(sc) {
		this.sc = sc;
		this.offset = 3;
	}
}


export class AutopGenPathW extends AutopGenPath {

	constructor(sc) {
		super(sc);
	}

	minipath(minipath, points, btn, texture_name) {
		let minipath_xy, coeff_y;
		let min_xy = points.findExtrem().min_y;
		let _points = points.movePoints(-points.getZeroX(), -min_xy);
		let _bounds = Phaser.Geom.Rectangle.FromPoints(_points);
		minipath.strokePoints(_points);		
		let minipath_wh = [Math.ceil(_bounds.width), Math.ceil(_bounds.height)];
		minipath.generateTexture(texture_name, ...minipath_wh);

		let __bounds = btn.bounds;
		let coeff_xy = (__bounds.x2 - __bounds.x1 - this.offset * 2) / minipath_wh[0];	
		min_xy = Math.max(min_xy, 0);
		
		let __height = (min_xy + minipath_wh[1]) * coeff_xy;
		let __max_xy = __bounds.y2 - __bounds.y1 - this.offset * 2;
		if(__height > __max_xy) {
//			coeff_y = __max_xy / (min_xy + minipath_wh[1]);
			coeff_y = coeff_xy * (__max_xy / __height);
		} else {
			coeff_y = coeff_xy;			
		}
		/*//tmp to delete
		let c = {min_xy: min_xy, __height: __height, minipath_wh: minipath_wh, coeff_xy:coeff_xy, __max_xy: __max_xy, coeff_y: coeff_y, minipath_xy: min_xy * coeff_y}
		for(let __k in c) {
			console.log(__k+': '+c[__k]);
		}
		//tmp end */
		let coeff_x = coeff_xy;
		minipath_xy = min_xy * coeff_y;
		return this.sc.add.image(0, 0, texture_name).setScale(coeff_x, coeff_y).setOrigin(0).setPosition(__bounds.x1 + this.offset, __bounds.y1 + Math.max(minipath_xy, this.offset));
	}


}


export class AutopGenPathH extends AutopGenPath {

	constructor(sc) {
		super(sc);
	}

	minipath(minipath, points, btn, texture_name) {
		let minipath_xy, coeff_x;
		let min_xy = points.findExtrem().min_x;
		let _points = points.movePoints(-min_xy, -points.getZeroY());
		let _bounds = Phaser.Geom.Rectangle.FromPoints(_points);
		minipath.strokePoints(_points);		
		let minipath_wh = [Math.ceil(_bounds.width), Math.ceil(_bounds.height)];
		minipath.generateTexture(texture_name, ...minipath_wh);

		let __bounds = btn.bounds;
		let coeff_xy = (__bounds.y2 - __bounds.y1 - this.offset * 2) / minipath_wh[1];	
		min_xy = Math.max(min_xy, 0);
		
		let __height = (min_xy + minipath_wh[0]) * coeff_xy;
		let __max_xy = __bounds.x2 - __bounds.x1 - this.offset * 2;
		if(__height > __max_xy) {
			coeff_x = __max_xy / (min_xy + minipath_wh[0]);
		} else {
			coeff_x = coeff_xy;			
		}
		let coeff_y = coeff_xy;
		minipath_xy = min_xy * coeff_x;
		return this.sc.add.image(0, 0, texture_name).setScale(coeff_x, coeff_y).setOrigin(0).setPosition(__bounds.x1 + Math.max(minipath_xy, this.offset), __bounds.y1 + this.offset);
	}

}


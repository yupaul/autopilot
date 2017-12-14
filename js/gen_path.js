class GenPath {

	constructor(cfg, game) {
		this.game = game;
		this.gr = this.game.add.graphics();//tmp
		this.gr.lineStyle(1, 0xff2211, 1);//tmp
		this.gr2 = this.game.add.graphics();//tmp
		this.gr2.lineStyle(1, 0x0000ff, 1);//tmp		
		this.cfg = cfg;		
		this.path_avg_length = Math.round((this.cfg.max_path_x_length + this.cfg.min_path_x_length) / 2);		
	}


	generate(prev_line, many_segments, is_long) {	
		var start, segment_type, change_y_direction, new_point = [0, 0], cp1 = [0, 0], cp2 = [0, 0], max_scale = false;
		if(this.cfg.rwh) return generate_rwh(prev_line, many_segments, is_long);
		let _r = Math.random();
		var path_x_length = Math.round((this.cfg.max_path_x_length - this.cfg.min_path_x_length) * _r + this.cfg.min_path_x_length);
		var segment_avg_length = Math.round(path_x_length * this.cfg.segment_avg);
		if(prev_line === undefined || prev_line === false) {
			start = [this.cfg.start_x, this.cfg.start_y];
		} else {
			start = [prev_line.x2, prev_line.y2];
		}
		var path = new Phaser.Curves.Path(...start);
		this.gr.strokeCircle(start[0], start[1], 2);//tmp
		
		if(prev_line === undefined || prev_line === false) {
			let _l = start[0] + AutopUTIL.randint(...this.cfg.first_line_length);
			prev_line = new Phaser.Geom.Line(start[0], start[1], _l, start[1])
			path.lineTo(_l, start[1]);
			this.gr.strokeCircle(_l, start[1], 2);//tmp
		}
		
		while(true) {
			if((prev_line.x2 - start[0]) > path_x_length) return {
				path: path,
				line: prev_line
			};
			segment_type = (AutopUTIL.chanceOneIn(this.cfg.line_probability) && segment_type !== undefined && segment_type !== 'line') ? 'line' : 'curve';
			let segment_coeff = AutopUTIL.randpow();
			if(many_segments) segment_coeff = 1 - segment_coeff;
			if(prev_line.y2 === prev_line.y1) {
				max_scale = false;
			} else {
				let _out_y;
				if(prev_line.y2 > prev_line.y1) {
					_out_y = this.cfg.max_y;
					if(segment_type === 'line') _out_y -= this.cfg.min_segment_y_length;
				} else {
					_out_y = this.cfg.min_y;			
					if(segment_type === 'line') _out_y += this.cfg.min_segment_y_length;					
				}
//    out.x = line.x1 + (line.x2 - line.x1) * position;
//    out.y = line.y1 + (line.y2 - line.y1) * position;				
				max_scale = (_out_y - prev_line.y1) / (prev_line.y2 - prev_line.y1);
			}
			let _prev_length_x = prev_line.x2 - prev_line.x1;
			let _prev_length_y = prev_line.y2 - prev_line.y1;
			let segment_length = segment_avg_length * segment_coeff;
			let _pos = segment_length / _prev_length_x;			
			if(segment_type === 'line') {
				if(max_scale !== false && Math.abs(_pos) > Math.abs(max_scale)) {
					_pos = max_scale * 0.4 + max_scale * 0.5 * Math.random();
					segment_length = _pos * _prev_length_x;
				}
				new_point = prev_line.getPoint(_pos);
				prev_line = new Phaser.Geom.Line(prev_line.x2, prev_line.y2, new_point.x, new_point.y);
				path.lineTo(new_point.x, new_point.y);
				this.gr.strokeCircle(new_point.x, new_point.y, 2);//tmp
			} else {
				new_point[0] = prev_line.x2 + segment_length;
				let _cp1_x_length = this.random_x_length(is_long, segment_length);
				let _cp2_x_length = this.random_x_length(is_long, segment_length);
				cp1[0] = prev_line.x2 + _cp1_x_length;
				cp1[1] = prev_line.y2 + _prev_length_y * ((_cp1_x_length + _prev_length_x) / _prev_length_x);
				cp2[0] = new_point[0] - _cp2_x_length;				
				
				//new_point[1]				
				change_y_direction = this.is_long_chance(is_long);
				if((prev_line.y2 <= prev_line.y1 && change_y_direction) || (prev_line.y2 > prev_line.y1 && !change_y_direction)) {
					var _s = this.cfg.max_y;
				} else {
					var _s = this.cfg.min_y;
				}
				let _c = this.is_long_invert(is_long) * Math.abs(_s - prev_line.y2);
				if(_s === this.cfg.max_y) {
					new_point[1] = prev_line.y2 + _c;
				} else {
					new_point[1] = prev_line.y2 - _c;
				}				
				
				//cp2[1]
				change_y_direction = this.is_long_chance(is_long);
				if((cp1[1] <= prev_line.y2 && change_y_direction) || (cp1[1] > prev_line.y2 && !change_y_direction)) {
					_s = this.cfg.max_y;
				} else {
					_s = this.cfg.min_y;
				}				
				_c = this.is_long_invert(is_long) * Math.abs(_s - new_point[1]);
				if(_s === this.cfg.max_y) {
					cp2[1] = new_point[1] + _c;
				} else {
					cp2[1] = new_point[1] - _c;
				}				
				
				prev_line = new Phaser.Geom.Line(cp2[0], cp2[1], new_point[0], new_point[1]);
				path.cubicBezierTo(new_point[0], new_point[1], cp1[0], cp1[1], cp2[0], cp2[1]);
				console.log(new_point[0], new_point[1], cp1[0], cp1[1], cp2[0], cp2[1]);//tmp
				this.gr.strokeCircle(new_point[0], new_point[1], 2);//tmp
				this.gr2.strokeCircle(cp2[0], cp2[1], 3);//tmp
				this.gr2.strokeCircle(cp1[0], cp1[1], 6);//tmp
			}
		}
	}
	
	random_x_length(is_long, segment_length) {		
		return (segment_length * this.is_long_invert(is_long) * (AutopUTIL.chanceOneIn(this.cfg.double_segment_probability) ? 2 : 1));		
	}	
	
	is_long_invert(is_long) {
		let _r = AutopUTIL.randpow();		
		if(this.is_long_chance(is_long)) _r = 1 - _r;
		return _r;
	}		
	
	is_long_chance(is_long) {
		let _p = AutopUTIL.chanceOneIn(this.cfg.long_short_probability);
		return ((is_long && !_p) || (!is_long && _p));
	}

	generate_rwh(prev_line, many_segments, is_long) {
		if(prev_line === undefined) {
			start = [this.cfg.start_y, this.cfg.screen_length - this.cfg_start_x];
		} else {
			start = [prev_line.x2, prev_line.y2];
		}		
	}
	


}
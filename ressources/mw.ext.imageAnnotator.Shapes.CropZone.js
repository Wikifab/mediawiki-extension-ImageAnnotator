/**
 * this is inspired by crop zone from darkroomjs
 * https://github.com/MattKetmo/darkroomjs
 *
 *
 */
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.CropZone = fabric.util.createClass(fabric.Rect, {

		type: 'cropzone',
		fill: 'rgba(0, 0, 0, 0)',
		lockRotation: true,
		hasRotatingPoint: false,
		minScaleLimit: 0.2,
		lockScalingFlip: true,
		statefullCache: true,

		// if false, center of crop must be in area, if true, all cropzone must be inside area
		positionLimitStrict: true,


	    initialize: function(options) {

	    	if (options['maxPositionX']) {
	    		this.maxPositionX = parseInt(options['maxPositionX']);
	    	} else {
	    		this.maxPositionX = 600;
	    	}
	    	if (options['maxPositionY']) {
	    		this.maxPositionY = parseInt(options['maxPositionY']);
	    	} else {
	    		this.maxPositionY = 300;
	    	}

	    	this.callSuper('initialize', options);


	    },

		/**
		 * limit position within frame :
		 */
		_set: function(key, value) {


			if (key == "left") {
				var min = - this.width * this.scaleX / 2;
				var max = parseInt(this.maxPositionX) - this.width * this.scaleX / 2;
				if (this.positionLimitStrict) {
					min = 0;
					max = parseInt(this.maxPositionX) - this.width * this.scaleX ;
				}
				if (value > max) {
					value = max;
				}
				if (value < min) {
					value = min;
				}
			}
			if (key == "top") {
				var min = - this.height * this.scaleY / 2;
				var max = this.maxPositionY - this.height * this.scaleY / 2;
				if (this.positionLimitStrict) {
					min = 0;
					max = parseInt(this.maxPositionY) - this.height * this.scaleY ;
				}
				if (value > max) {
					value = max;
				}
				if (value < min) {
					value = min;
				}
			}
			if (key == "scaleX" || key == 'scaleY') {
				// limit scale to not allow crop size bigger than image
				var maxScaleX = this.maxPositionX / this.width;
				var maxScaleY = this.maxPositionY / this.height;
				this.maxScale = Math.min(maxScaleX,maxScaleY);

				if (value > this.maxScale) {
					value = this.maxScale;
				}
			}
			this.callSuper('_set', key, value);
		},

		render: function(ctx) {

		    this.callSuper('render', ctx);

		    var canvas = ctx.canvas;
		    var dashWidth = 7;

		    // Set original scale
		    var flipX = this.flipX ? -1 : 1;
		    var flipY = this.flipY ? -1 : 1;
		    var scaleX = flipX / this.scaleX;
		    var scaleY = flipY / this.scaleY;

		    //ctx.scale(scaleX, scaleY);

		    // Overlay rendering
		    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		    this._renderOverlay(ctx);

		    // Set dashed borders
		    if (ctx.setLineDash !== undefined){ctx.setLineDash([dashWidth, dashWidth]);}else if (ctx.mozDash !== undefined){ctx.mozDash = [dashWidth, dashWidth];}

		    // First lines rendering with black
		    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
		    this._renderBorders(ctx);
		    this._renderGrid(ctx);

		    // Re render lines in white
		    ctx.lineDashOffset = dashWidth;
		    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
		    this._renderBorders(ctx);
		    this._renderGrid(ctx);

		    // Reset scale
		    //ctx.scale(1/scaleX, 1/scaleY);
		  },

		  _renderOverlay: function(ctx) {
		    var canvas = ctx.canvas;

		    //
		    //    x0    x1        x2      x3
		    // y0 +------------------------+
		    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
		    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
		    // y1 +------+---------+-------+
		    //    |\\\\\\|         |\\\\\\\|
		    //    |\\\\\\|    0    |\\\\\\\|
		    //    |\\\\\\|         |\\\\\\\|
		    // y2 +------+---------+-------+
		    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
		    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
		    // y3 +------------------------+
		    //
/*
		    var x0 = Math.ceil(-this.width / 2 - this.left);
		    var x1 = Math.ceil(-this.width / 2);
		    var x2 = Math.ceil(this.width / 2);
		    var x3 = Math.ceil(this.width / 2 + (canvas.width - this.width - this.left));

		    var y0 = Math.ceil(-this.height / 2 - this.top);
		    var y1 = Math.ceil(-this.height / 2);
		    var y2 = Math.ceil(this.height / 2);
		    var y3 = Math.ceil(this.height / 2 + (canvas.height - this.height - this.top));

*/
		    var x0 = 0;
		    var x1 = this.left ;
		    var x2 = this.left + this.width * this.scaleX ;
		    var x3 = canvas.width ;

		    var y0 = 0 ;
		    var y1 = this.top;
		    var y2 = this.top + this.height * this.scaleY ;
		    var y3 = canvas.height ;

		    ctx.beginPath();

		    // Draw outer rectangle.
		    // Numbers are +/-1 so that overlay edges don't get blurry.
		    ctx.moveTo(x0 - 1, y0 - 1);
		    ctx.lineTo(x3 + 1, y0 - 1);
		    ctx.lineTo(x3 + 1, y3 + 1);
		    ctx.lineTo(x0 - 1, y3 - 1);
		    ctx.lineTo(x0 - 1, y0 - 1);
		    ctx.closePath();

		    // Draw inner rectangle.
		    ctx.moveTo(x1, y1);
		    ctx.lineTo(x1, y2);
		    ctx.lineTo(x2, y2);
		    ctx.lineTo(x2, y1);
		    ctx.lineTo(x1, y1);

		    ctx.closePath();
		    ctx.fill();
		  },

		  _renderBorders: function(ctx) {
		    ctx.beginPath();
		    /*
		    ctx.moveTo(-this.width/2, -this.height/2); // upper left
		    ctx.lineTo(this.width/2, -this.height/2); // upper right
		    ctx.lineTo(this.width/2, this.height/2); // down right
		    ctx.lineTo(-this.width/2, this.height/2); // down left
		    ctx.lineTo(-this.width/2, -this.height/2); // upper left
		    */
		    ctx.moveTo(this.left, this.top); // upper left
		    ctx.moveTo(this.left + this.width * this.scaleX, this.top); // upper right
		    ctx.moveTo(this.left + this.width * this.scaleX, this.top + this.height * this.scaleY); // down right
		    ctx.moveTo(this.left, this.top + this.height) * this.scaleY; // down left
		    ctx.moveTo(this.left, this.top); // upper left

		    ctx.stroke();
		  },

		  _renderGrid: function(ctx) {


		    var x0 = this.left;
		    var x1 = this.left + this.width * this.scaleX * 1/3;
		    var x2 = this.left + this.width * this.scaleX * 2/3 ;
		    var x3 = this.left + this.width * this.scaleX ;

		    var y0 = this.top ;
		    var y1 = this.top + this.height * this.scaleY * 1/3;
		    var y2 = this.top + this.height * this.scaleY * 2/3;
		    var y3 = this.top + this.height * this.scaleY ;

		    // Vertical lines
		    ctx.beginPath();
		    ctx.moveTo(x1, y0);
		    ctx.lineTo(x1, y3);
		    ctx.stroke();
		    ctx.beginPath();
		    ctx.moveTo(x2, y0);
		    ctx.lineTo(x2, y3);
		    ctx.stroke();
		    // Horizontal lines
		    ctx.beginPath();
		    ctx.moveTo(x0, y1);
		    ctx.lineTo(x3, y1);
		    ctx.stroke();
		    ctx.beginPath();
		    ctx.moveTo(x0, y2);
		    ctx.lineTo(x3, y2);
		    ctx.stroke();
		}
	});
})(jQuery, mw, fabric, ext_imageAnnotator);




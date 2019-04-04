
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wfarrow2line = fabric.util.createClass(fabric.Wfline, {
			shapeName: 'wfarrow2line',
			type: 'wfarrow2line',

	    /**
	     * Recalculates line points given width and height
	     * @private
	     */
	    calcLinePoints: function() {
	      var xMult = this.x1 <= this.x2 ? -1 : 1,
	          yMult = this.y1 <= this.y2 ? -1 : 1,
	          x1 = (xMult * this.width * 0.5),
	          y1 = (yMult * this.height * 0.5),
	          x2 = (xMult * this.width * -0.5),
	          y2 = (yMult * this.height * -0.5);

	      var lx = Math.abs (this.x1 - this.x2);
	      var ly = Math.abs (this.y1 - this.y2);
	      var l = Math.sqrt (lx * lx + ly * ly);

	      var d1Factor = xMult == -1 && yMult == -1 ? -1 : 1;
	      var d3Factor = xMult == 1 && yMult == 1 ? -1 : 1;

	      var 	x2a = x2 - (40 * x2 /l) + (d3Factor * 8 * ly / l),
				y2a = y2 - (40 * y2 /l) + (d1Factor * 8 * lx / l) ,
		  		x2b = x2 - (40 * x2 /l) - (d3Factor * 8 * ly / l),
		  		y2b = y2 - (40 * y2 /l) - (d1Factor * 8 * lx / l);

	      return {
	        x1: x1,
	        x2: x2,
	        y1: y1,
	        y2: y2,
	        x2a: x2a,
	        y2a: y2a,
	        x2b: x2b,
	        y2b: y2b
	      };
	    },

	   /**
	    *  bad : overload of a 'private' function
	     * @private
	     * @param {CanvasRenderingContext2D} ctx Context to render on
	     */
	    _render: function(ctx) {
	      ctx.beginPath();

	      if (!this.strokeDashArray || this.strokeDashArray && supportsLineDash) {
	        // move from center (of virtual box) to its left/top corner
	        // we can't assume x1, y1 is top left and x2, y2 is bottom right
	        var p = this.calcLinePoints();

	        ctx.moveTo(p.x1, p.y1);
	        ctx.lineTo(p.x2, p.y2);
	        ctx.lineTo(p.x2a, p.y2a);
	        ctx.moveTo(p.x2, p.y2);
	        ctx.lineTo(p.x2b, p.y2b);
	      }

	      ctx.lineWidth = this.strokeWidth;

	      // TODO: test this
	      // make sure setting "fill" changes color of a line
	      // (by copying fillStyle to strokeStyle, since line is stroked, not filled)
	      var origStrokeStyle = ctx.strokeStyle;
	      ctx.strokeStyle = this.stroke || ctx.fillStyle;
	      this.stroke && this._renderStroke(ctx);
	      ctx.strokeStyle = origStrokeStyle;
	      ctx.lineCap = this.strokeLineCap;
	    },

	    /**
	     * Returns svg representation of an instance
	     * @return {Array} an array of strings with the specific svg representation
	     * of the instance
	     */
	    toSVG: function(reviver) {
	      var p = this.calcLinePoints();

	      var poly = new fabric.Polyline([
	    	    { x: p.x1, y: p.y1 },
	    	    { x: p.x2, y: p.y2 },
	    	    { x: p.x2a, y: p.y2a },
	    	    { x: p.x2, y: p.y2 },
	    	    { x: p.x2b, y: p.y2b }
	    	  ], {
	    	  stroke: this.stroke,
	    	  left: this.left,
	    	  top: this.top,
				originX:  this.originX,
				originY:  this.originY,
				strokeWidth:  this.strokeWidth,
				borderWidth:  this.borderWidth,
				fill:  this.fill,
	    	});

	      //this.callSuper('toSVG', reviver);
	      return poly.toSVG();
	    }
	});

	// for clone()
	ext_imageAnnotator.shapes.Wfarrow2line.fromObject = function(object, callback) {

		var klass = this.prototype.constructor;
		object = fabric.util.object.clone(object, true);

		var instance = new klass(object);
        callback && callback(instance);
	}

	// For objects that are contained in other objects, fabric.util.enlivenObjects()
	// will look for classes within fabric. 
	fabric.Wfarrow2line = ext_imageAnnotator.shapes.Wfarrow2line;

})(jQuery, mw, fabric, ext_imageAnnotator);




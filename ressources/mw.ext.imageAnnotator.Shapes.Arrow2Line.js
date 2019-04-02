
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wfarrow2line = fabric.util.createClass(fabric.Line, {
			shapeName: 'wfarrow2line',
			type: 'wfarrow2line',
			originX: 'center',
			originY: 'center',
			strokeWidth: 3,
			borderWidth: 4,
			fill: 'rgba(255,0,0,0)',
			left: 0,
			top: 0,
			selectable:true,
			lockRotation: true,
			lockScalingX: true,
		   lockScalingY: true,
		   hasControls: false,
		   hasBorders: false,
			//borderColor: 'black',
			//cornerColor: 'rgba(200,200,200,1)',

	   /**
	     * Constructor
	     */
	    initialize: function(options) {

	      var points = [50,50, 150, 50];

	      if(options['left'] && options['x1']) {
	    	  points[0] = options['left'] + options['x1'];
	    	  points[1] = options['top'] + options['y1'];
	    	  points[2] = options['left'] + options['x2'];
	    	  points[3] = options['top'] + options['y2'];
	      }

	      this.callSuper('initialize', points, options);
	      this._onEvents();
	    },

	    setP1 : function ( x, y) {
	    	this.set({ 'x1': x, 'y1': y });
	    },

	    setP2 : function ( x, y) {
	    	this.set({ 'x2': x, 'y2': y });
	    },

	   render: function(ctx) {
	      this.callSuper('render', ctx);
	   },

	   _onEvents() {

	   	  this.on('added', function (e) {
	      		this._addCircles();
	      });

	      this.on('moving', function(e) {

	      		var points = this.calcLinePoints();

	            this.c1.set('left',this.get('left') + points.x1);
	            this.c1.set('top',this.get('top') + points.y1);
	            this.c2.set('left',this.get('left') + points.x2);
	            this.c2.set('top',this.get('top') + points.y2);            
	      });

	      this.on('moved', function(e) {

	      		// this should solve the unselectability
	      		this.setCoords();
	      		this.c1.setCoords();
	      		this.c2.setCoords();

	      		this._updatePoints();
	      });

	      this.on('rotating', function(e) {
	      		var p = this.calcLinePoints();

	      		this.c1.set('left',this.get('left') + points.x1);
	            this.c1.set('top',this.get('top') + points.y1);
	            this.c2.set('left',this.get('left') + points.x2);
	            this.c2.set('top',this.get('top') + points.y2);
	      });

	      this.on('deselected', function(e) {

	      		// after rotation
	      		if (this.angle && this.angle != 0) {
	      			this.angle = 0;
	      		}

	      		this._updatePoints();
	      });
	   },

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

	      var 	x2a = x2 - (30 * x2 /l) + (d3Factor * 5 * ly / l),
				y2a = y2 - (30 * y2 /l) + (d1Factor * 5 * lx / l) ,
		  		x2b = x2 - (30 * x2 /l) - (d3Factor * 5 * ly / l),
		  		y2b = y2 - (30 * y2 /l) - (d1Factor * 5 * lx / l);

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
	    },

	    _updatePoints: function() {
	    	this.setP1(this.c1.left, this.c1.top);
	    	this.setP2(this.c2.left, this.c2.top);
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
	    },

	    _addCircles: function () {

	    	var top = this.get('top'), left = this.get('left');

	    	if (this.group) {

	    		// That means object was copy-pasted while being in an
	    		// ActiveSelection object. Since objects in groups have 
	    		// relative coordinates, we must first get the absolute
	    		// coordinates before adding circles since they rely on 
	    		// them.

	    		// see fabric.Object.prototype._restoreObjectState()
	    		var matrix = this.calcTransformMatrix(),
		          options = fabric.util.qrDecompose(matrix),
		          center = new fabric.Point(options.translateX, options.translateY),
	          	  position = this.translateToOriginPoint(
	          			this.translateToCenterPoint(center, 'center', 'center'),
	          			 this.originX, this.originY);

	          	left = position.x;
	          	top = position.y;
	    	}
	    	
	    	// calculate line points
	    	var points = this.calcLinePoints();

			var c1 = new ext_imageAnnotator.shapes.Wfarrow2circle({
				left : left + points.x1,
				top : top + points.y1,
				radius : 8,
				line1 : this,
			});

			var c2 = new ext_imageAnnotator.shapes.Wfarrow2circle({
				left : left + points.x2,
				top : top + points.y2,
				radius : 8,
				line2 : this,
			});

			// attach them to this object
			this.c1 = c1;
			this.c2 = c2;

			this.c1.setCoords();
			this.c2.setCoords();

			// add them to the canvas
      		this.canvas.add(this.c1);
			this.canvas.add(this.c2);

			// if object in a group, forget not to add the circles to it
			this.group && this.group.addWithUpdate(this.c1);
			this.group && this.group.addWithUpdate(this.c2);

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




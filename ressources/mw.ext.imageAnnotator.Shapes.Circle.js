var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wfcircle = fabric.util.createClass(fabric.Circle, {
	   shapeName: 'wfcircle',
	   type: 'wfcircle',
	   strokeWidthOriginal: 3,
	   strokeWidth: 3,
	   borderWidth: 4,
	   padding: 5,
	   originX: 'center',
	   originY: 'center',
	   transparentCorners:false,
		borderColor: 'black',
		cornerColor: 'rgba(200,200,200,1)',

	   // Min and Max size to enforce (false == no enforcement)
	   minSize: 10,
	   maxSize: 590,

	   centerTransform: true,

	   outlineWidth: 1,
	   outlineStyle: '#FFF',

	   _stroke: function() {
	      this.strokeWidth = this.strokeWidthOriginal / this.scaleX;
	   },

	   render: function(ctx) {
		  this._limitSize();
		  this._stroke();
	      this.callSuper('render', ctx);
	   },

	   /**
	    * Resizes this shape using the two mouse coords (first is treated as the
	    * center, second is the outside edge.
	    */
	   sizeByMousePos: function(x1, y1, x2, y2) {
	      var xdiff = x2 - this.left;
	      var ydiff = y2 - this.top;
	      var radius = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
	      this.scaleToWidth(radius * 2);
	      this.setCoords();
	   },

	   /**
	    * Enforce the min / max sizes if set.
	    */
	   _limitSize: function() {

	      var newRadiusX = this.getRadiusX();
	      var newRadiusY = this.getRadiusY();

	      if (this.minSize !== false && newRadiusX < this.minSize) {
	         this.scaleX = this.minSize / this.radius;
	      } else if (this.maxSize !== false && newRadiusX > this.maxSize) {
	         this.scaleX = this.maxSize / this.radius;
	      }
	      if (this.minSize !== false && newRadiusY < this.minSize) {
		         this.scaleY = this.minSize / this.radius;
		      } else if (this.maxSize !== false && newRadiusY > this.maxSize) {
		         this.scaleY = this.maxSize / this.radius;
		      }
	      // change the stroke width to look same
	      //this.setStrokeWidth(3 *2 / (this.scaleX + this.scaleY) );
	      this.setCoords();
	   }
	});

	// for clone()
	ext_imageAnnotator.shapes.Wfcircle.fromObject = function(object, callback) {

		var klass = this.prototype.constructor;
		object = fabric.util.object.clone(object, true);

		var instance = new klass(object);
        callback && callback(instance);
        
	}

	// For objects that are contained in other objects, fabric.util.enlivenObjects()
	// will look for classes within fabric. 
	fabric.Wfcircle = ext_imageAnnotator.shapes.Wfcircle;

})(jQuery, mw, fabric, ext_imageAnnotator);




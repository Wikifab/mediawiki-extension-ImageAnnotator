
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wfrect = fabric.util.createClass(fabric.Rect, {
	   shapeName: 'wfrect',
	   type: 'wfrect',
	   strokeWidth: 3,
	   borderWidth: 4,
	   padding: 5,
	   originX: 'center',
	   originY: 'center',
		transparentCorners:false,
		borderColor: 'black',
		cornerColor: 'rgba(200,200,200,1)',

	   // Min and Max size to enforce (false == no enforcement)
	   minSize: 15,
	   maxSize: 200,

	   centerTransform: true,

	   render: function(ctx) {
	      this._limitSize();
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

	      if (this.minSize !== false && this.width * this.scaleX < this.minSize) {
	         this.scaleX = this.minSize / this.width;
	      } else if (this.maxSize !== false && this.width * this.scaleX > this.maxSize) {
	         this.scaleX = this.maxSize / this.width;
	      }
	      if (this.minSize !== false && this.height * this.scaleY < this.minSize) {
	         this.scaleY = this.minSize / this.height;
	      } else if (this.maxSize !== false && this.width * this.scaleY > this.maxSize) {
	         this.scaleY = this.maxSize / this.height;
	      }

	      // change the stroke width to look same
	      this.setStrokeWidth(3 *2 / (this.scaleX + this.scaleY) );
	      this.setCoords();
	   }
	});

})(jQuery, mw, fabric, ext_imageAnnotator);




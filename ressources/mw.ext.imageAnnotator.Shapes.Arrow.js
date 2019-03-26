
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wfarrow = fabric.util.createClass(fabric.Polyline, {
			shapeName: 'wfarrow',
			type: 'wfarrow',
			originX: 'center',
			originY: 'center',
			strokeWidth: 3,
			borderWidth: 4,
			fill: 'rgba(255,0,0,0)',
			left: 120,
			top: 120,
			angle: -90,
			transparentCorners:false,
			borderColor: 'black',
			cornerColor: 'rgba(200,200,200,1)',


	   // Min and Max size to enforce (false == no enforcement)
	   minScale: 0.5,
	   maxScale: 3,

	   centerTransform: true,

	   /**
	     * Constructor
	     */
	    initialize: function( options) {

		  var x = 0;
		  var y = 0;
	      var points = [
			    { x: x + 10, y: y + 10 },
			    { x: x + 10, y: y + 100 },
			    { x: x + 5, y: y + 90 },
			    { x: x + 10, y: y + 100 },
			    { x: x + 15, y: y + 90 }
		  ];
	      this.callSuper('initialize', points, options);
	    },

	   render: function(ctx) {
	      this._limitSize();
	      this.callSuper('render', ctx);
	   },

	   /**
	    * Enforce the min / max sizes if set.
	    */
	   _limitSize: function() {

	      if (this.minScale !== false && this.scaleX < this.minScale) {
	         this.scaleX = this.minScale;
	      } else if (this.maxScale !== false && this.scaleX > this.maxScale) {
	         this.scaleX = this.maxScale;
	      }
	      if (this.minScale !== false && this.scaleY < this.minScale) {
	         this.scaleY = this.minScale;
	      } else if (this.maxScale !== false && this.scaleY > this.maxScale) {
	         this.scaleY = this.maxScale;
	      }

	      // change the stroke width to look same
	      //this.setStrokeWidth(3 *2 / (this.scaleX + this.scaleY) );
	      this.setCoords();
	   },

	   /**
	    * yet another hack  : toSVG function use type property, but must be polyline instead of wfarray
	    */
	   toSVG: function(reviver) {
		   var type = this.type;
		   this.type = 'polyline';
		   var result = this.callSuper('toSVG', reviver);
		   this.type = type;
		   return result;
	   }
	});

})(jQuery, mw, fabric, ext_imageAnnotator);





var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}


	ext_imageAnnotator.shapes.Wfarrow2Arrow = fabric.util.createClass(fabric.Polyline, {
			shapeName: 'wfarrow2arrow',
			type: 'wfarrow2arrow',
			originX: 'center',
			originY: 'center',
			strokeWidth: 3,
			borderWidth: 4,
			fill: 'rgba(255,0,0,0)',
			left: 0,
			top: 0,
			selectable:false,
			hasborder:false,
			hasControls:false,
			statefullCache: true,



	   /**
	     * Constructor
	     */
	    initialize: function( inputPoints, options) {

	      var points = [
			    { x: inputPoints[0], y: inputPoints[1] },
			    { x: inputPoints[2], y: inputPoints[3] }
		  ];
	      this.callSuper('initialize', points, options);
	    },

	    setP1 : function ( x, y) {
	    	this.points[0] = { x: x, y: y };
	    },

	    setP2 : function ( x, y) {
	    	this.points[2] = { x: x, y: y };
	    },

	   render: function(ctx) {
	      this.callSuper('render', ctx);
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
	   },
	});

})(jQuery, mw, fabric, ext_imageAnnotator);




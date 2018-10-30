
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wfarrow2 = fabric.util.createClass(fabric.Group, {
			shapeName: 'wfarrow2',
			type: 'wfarrow2',
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

		    subTargetCheck: true,

	   // Min and Max size to enforce (false == no enforcement)
	   minScale: 0.5,
	   maxScale: 3,

	   centerTransform: true,

	   /**
	     * Constructor
	     */
	    initialize: function( options) {

	    	function makeCircle(left, top, line1, line2) {
			    var c = new fabric.Circle({
			      left: left,
			      top: top,
			      strokeWidth: 5,
			      radius: 12,
			      fill: '#fff',
			      stroke: '#666'
			    });
			    c.hasControls = c.hasBorders = false;

			    c.line1 = line1;
			    c.line2 = line2;

			    return c;
			  }

			  function makeLine(coords) {
			    return new fabric.Line(coords, {
			      fill: 'red',
			      stroke: 'red',
			      strokeWidth: 5,
			      selectable: false,
			      evented: false,
			    });
			  }

			  var line = makeLine([ 150, 75, 150, 75 ]);

			  var objects = [];
			  objects[0] = line;
			  objects[1] = makeCircle(line.get('x1'), line.get('y1'), null, line);
			  objects[2] = makeCircle(line.get('x2'), line.get('y2'), line, null);


			  /*canvas.on('object:moving', function(e) {
			    var p = e.target;
			    p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top });
			    p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top });
			    canvas.renderAll();
			  });*/
			 var isAlreadyGrouped = false;

	      this.callSuper('initialize', objects, options, isAlreadyGrouped);
	    },

	   /**
	    * yet another hack  : toSVG function use type property, but must be polyline instead of wfarray
	    */
	   toSVG: function(reviver) {
		   var type = this.type;
		   this.type = 'group';
		   var result = this.callSuper('toSVG', reviver);
		   this.type = type;
		   return result;
	   },
	});

})(jQuery, mw, fabric, ext_imageAnnotator);




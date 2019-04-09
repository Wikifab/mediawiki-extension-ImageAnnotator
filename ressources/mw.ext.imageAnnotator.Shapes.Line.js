
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wfline = fabric.util.createClass(fabric.Line, {
			shapeName: 'wfline',
			type: 'wfline',
			originX: 'center',
			originY: 'center',
			strokeWidth: 4,
			borderWidth: 4,
			strokeLineCap: 'round',
			fill: 'rgba(255,0,0,0)',
			left: 0,
			top: 0,
			selectable:true,
			lockRotation: true,
			lockScalingX: true,
		   lockScalingY: true,
		   hasControls: false,
		   hasBorders: false,
		   padding: 5,
			//borderColor: 'black',
			//cornerColor: 'rgba(200,200,200,1)',

	   /**
	     * Constructor
	     */
	    initialize: function(options) {

	      var points = [50,50, 150, 50];

	      if(options['left'] != undefined && options['x1'] != undefined) {
	    	  points[0] = options['left'] + options['x1'];
	    	  points[1] = options['top'] + options['y1'];
	    	  points[2] = options['left'] + options['x2'];
	    	  points[3] = options['top'] + options['y2'];
	      }

	      this.callSuper('initialize', points, options);

	      // the line must move as a whole, that is the line itself and its circles, 
	      // so make sure both its control circles are included in the selection
	      // Note : it's safe since when selected is triggered, _objects of the 
	      // group already contains all the selected objects 
	      this.on('selected', function (e) {
	      	if (this.group != undefined && this.group.type === 'activeSelection') {
	      		
	      		var selection = this.group;

	      		if (!selection.contains(this.c1)) selection.addWithUpdate(this.c1);
	      		if (!selection.contains(this.c2)) selection.addWithUpdate(this.c2);
	      	}
	      });
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

	      this.on('deselected', function(e) {

	      		// after rotation
	      		if (this.angle && this.angle != 0) {
	      			this.angle = 0;
	      		}

	      		this._updatePoints();
	      });
	   },

	    _updatePoints: function() {
	    	this.setP1(this.c1.left, this.c1.top);
	    	this.setP2(this.c2.left, this.c2.top);
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
	ext_imageAnnotator.shapes.Wfline.fromObject = function(object, callback) {

		var klass = this.prototype.constructor;
		object = fabric.util.object.clone(object, true);

		var instance = new klass(object);
        callback && callback(instance);
	}

	// For objects that are contained in other objects, fabric.util.enlivenObjects()
	// will look for classes within fabric. 
	fabric.Wfline = ext_imageAnnotator.shapes.Wfline;

})(jQuery, mw, fabric, ext_imageAnnotator);




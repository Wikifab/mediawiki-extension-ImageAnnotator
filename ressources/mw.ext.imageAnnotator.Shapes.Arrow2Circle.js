
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}


	ext_imageAnnotator.shapes.Wfarrow2circle = fabric.util.createClass(
		fabric.Circle, {
		shapeName : 'wfarrow2circle',
		type : 'wfarrow2circle',
		originX: 'center',
		originY: 'center',
		hasControls : false,
		hasBorders : false,
	    strokeWidth : 0,
	    radius : 8,
	    fill : '#aaa',
	    stroke : '#666',
		opacity:0.5,

		/**
		 * Constructor
		 */
		initialize : function(options) {
			this.callSuper('initialize', options);

			// dirty hack : we let ActiveSelection recreate the object
			// so that it doesn't complain ("cannot add 'group' on undefined)
			// but then remove it afterwards. ArrowCircles are never created 
			// directly, always from Arrow2Line.
			this.on('added', function() {
				if (this.line1 == undefined && this.line2 == undefined) {
					this.group && this.group.removeWithUpdate(this);
					this.canvas && this.canvas.remove(this);
				}
			});
		},

		render : function(ctx) {
			this.callSuper('render', ctx);
		},

		set: function(key, value) {

			var lockedAttr = ['scaleX', 'scaleY', 'stroke', 'fill'];

		   if( lockedAttr.indexOf(key) != -1 ) {
			   return this;
		   }
		   
		   return this.callSuper('set', key, value);
	   },

		/**
		 * bypass toSVG function, to not display those dots in display
		 * mode (those are edit tools only) TODO : do not save same in
		 * json, this would avoid to do this
		 */
	   toSVG: function(reviver) {
		   return '';
	   }


	});

	// for clone()
	ext_imageAnnotator.shapes.Wfarrow2circle.fromObject = function(object, callback) {
		
  		var klass = this.prototype.constructor;
		object = fabric.util.object.clone(object, true);

		object.isClone = true;

		var instance = new klass(object);
        callback && callback(instance);
	}

	// For objects that are contained in other objects, fabric.util.enlivenObjects()
	// will look for classes within fabric. 
	fabric.Wfarrow2circle = ext_imageAnnotator.shapes.Wfarrow2circle;

})(jQuery, mw, fabric, ext_imageAnnotator);




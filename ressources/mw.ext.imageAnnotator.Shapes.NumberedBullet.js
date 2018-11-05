
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.WfNumberedBullet = fabric.util.createClass(fabric.Group, {

		type: 'wfnumberedbullet',
	   // Min and Max size to enforce (false == no enforcement)
	   minSize: 15,
	   maxSize: 200,

	   centerTransform: true,
	   lockRotation: true,
	   lockScalingX: true,
	   lockScalingY: true,
	   hasControls: false,

	   initialize: function(objects, optionsopt, isAlreadyGroupedopt) {

		   var color = optionsopt['stroke'];
		   this.number = optionsopt['number'];

		   var circle = new fabric.Circle({
				  radius: 12,
				  fill: color,
				  originX: 'center',
				  originY: 'center'
				});

		   var textColor = 'rgba(0,0,0,255)';
		   switch (color) {
			   case	"black":
				   textColor = 'rgba(255,255,255,255)';
				   break;
			   case	"yellow":
			   case	"blue":
			   case	"white":
			   default:
				   textColor = 'rgba(0,0,0,255)';
			   	break;
		   }


			var text = new fabric.Text('' + this.number, {
			  fontSize: 14,
			  originX: 'center',
			  originY: 'center',
			  fontFamily: 'arial',
			  fill: textColor
			});

			objects.push(circle);
			objects.push(text);
			this.callSuper('initialize', objects, optionsopt, isAlreadyGroupedopt);
	   },

	   render: function(ctx) {
	      this._limitSize();
	      this.callSuper('render', ctx);
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
	      //this.setStrokeWidth(3 *2 / (this.scaleX + this.scaleY) );
	      this.setCoords();
	   },

	   toJSON: function(propertiesToInclude) {
		   if(! propertiesToInclude) {
			   propertiesToInclude = [];
		   }
		   propertiesToInclude.push('number');
		   return this.callSuper('toJSON', propertiesToInclude);
	   },
	   toObject: function(propertiesToInclude) {
		   if(! propertiesToInclude) {
			   propertiesToInclude = [];
		   }
		   propertiesToInclude.push('number');
		   return this.callSuper('toObject', propertiesToInclude);

	   }
	});

})(jQuery, mw, fabric, ext_imageAnnotator);




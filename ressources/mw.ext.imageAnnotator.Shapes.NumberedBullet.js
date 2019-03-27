
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


		   var textColor = this.getTextColor(color);

			var text = new fabric.Text('' + this.number, {
			  fontSize: 14,
			  originX: 'center',
			  originY: 'center',
			  fontFamily: 'arial',
			  fill: textColor
			});

			this.circleObj = circle;
			this.textObj = text;

			objects.push(circle);
			objects.push(text);
			this.callSuper('initialize', objects, optionsopt, isAlreadyGroupedopt);
	   },

	   clone: function (callback) {

			var clone = new ext_imageAnnotator.shapes.WfNumberedBullet([], 
				{ stroke : this.circleObj.fill, number : this.textObj.text });

			clone.top = this.top;
			clone.left = this.left;

			if (typeof callback === "function") {
			    callback(clone);
			}
		},

		_hexToRgbA: function(hex){
		    var c;
		    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
		        c= hex.substring(1).split('');
		        if(c.length== 3){
		            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
		        }
		        c= '0x'+c.join('');
		        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
		    }
		    throw new Error('Bad Hex');
		},

	   getTextColor: function(fillColor) {

	   		var black = 'rgba(0,0,0,255)';
	   		var white = 'rgba(255,255,255,255)';
			var textColor = black;

			// hex pattern
			var regex = /#([A-F0-9]{2})([A-F0-9]{2})([A-F0-9]{2})/i;

			var match = regex.exec(fillColor);

			// fillColor must be in hex format
			if (!match) {
				console.log("Color not in right format. Must be in hex format.");
				return textColor;
			}

			var fillColorrgba = this._hexToRgbA(fillColor);

			// rgba pattern
			regex = /rgba\(([0-9]{1,3}),([0-9]{1,3}),([0-9]{1,3}),[0-9]{1}\)/;

			match = regex.exec(fillColorrgba);

			if (match) {

				var red = match[1];
				var green = match[2];
				var blue = match[3];

				// threshold is set here to 150, set it at your convenience
				if ( (red*0.299 + green*0.587 + blue*0.114) > 150 ){
					textColor = black;
				} else {
					textColor = white;
				}
			}

			return textColor;
	   },

	   set: function(key, value) {
		   if( key == 'stroke') {
			   // update circle color when change object color
			   this.circleObj.set('fill', value);
			   var textColor = this.getTextColor(value);
			   this.textObj.set('fill', textColor);
		   }
		   return this.callSuper('set', key, value);
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





var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wftextbox = fabric.util.createClass(fabric.Textbox, {

		type: "wftextbox",

		clone: function (callback) {

			var clone;

			clone = new ext_imageAnnotator.shapes.Wftextbox(this.text, {
				originX: this.originX,
				originY: this.originY,
				top: this.top,
				left: this.left,
				//fontWeight: this.fontWeight,
				fontFamily: this.fontFamily,
				fontSize: this.fontSize,
				stroke: this.stroke,
				fill: this.fill,
				borderColor: this.borderColor,
				cornerColor: this.cornerColor,
				transparentCorners: this.transparentCorners,
				scaleX: this.scaleX,
				scaleY: this.scaleY,
				angle: this.angle,
				height: this.height,
				width: this.width
				//lockUniScaling: this.lockUniScaling,
				//fill: this.fill
			});

			if (typeof callback === "function") {
			    callback(clone);
			}
		}
	});

})(jQuery, mw, fabric, ext_imageAnnotator);




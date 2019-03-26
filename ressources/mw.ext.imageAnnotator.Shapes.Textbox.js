
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wftextbox = fabric.util.createClass(fabric.Textbox, {

		clone: function () {

			return new this.constructor(this.text, {
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
				transparentCorners: this.transparentCorners
				//lockUniScaling: this.lockUniScaling,
				//fill: this.fill
			});
		}
	});

})(jQuery, mw, fabric, ext_imageAnnotator);




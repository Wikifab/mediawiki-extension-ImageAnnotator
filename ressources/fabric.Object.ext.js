
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric ) {
	'use strict';

	fabric.Object.prototype.addToCanvas = function () {

		if (this.canvas) {
			this.canvas.add(this);
		}
	}

})(jQuery, mw, fabric);




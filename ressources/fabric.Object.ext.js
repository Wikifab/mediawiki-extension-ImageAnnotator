
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric ) {
	'use strict';

	fabric.Object.prototype.addToCanvas = function (canvas) {

		if (canvas && canvas.add) {
			canvas.add(this);
		}
	}

	fabric.Object.prototype.clone = function (callback) {

		var clone = fabric.util.object.clone(this);

		this._clearCache();

		if (typeof callback === "function") {
		    callback(clone);
		}
	}

	fabric.Object.prototype._clearCache = function () {

		// so to ensure that each copied object has its own cache environment
		this._cacheCanvas = null;
	    this.cacheWidth = 0;
	    this.cacheHeight = 0;
	}

})(jQuery, mw, fabric);




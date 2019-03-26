
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}


	ext_imageAnnotator.shapes.Wfarrow2Circle = fabric.util.createClass(
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
				},

				render : function(ctx) {
					this.callSuper('render', ctx);
				},

				clone: function(callback) {

					var arrowLine;

					if (this.line1) {
						arrowLine = fabric.util.object.clone(this.line1);
					} else if (this.line2) {
						arrowLine = fabric.util.object.clone(this.line2);
					}

					arrowLine._clearCache();

					arrowLine.c1 = null;
					arrowLine.c2 = null;

					if (typeof callback === "function") {
					    callback(arrowLine);
					}
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

})(jQuery, mw, fabric, ext_imageAnnotator);




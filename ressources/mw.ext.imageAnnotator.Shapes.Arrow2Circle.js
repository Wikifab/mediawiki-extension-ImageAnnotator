
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

			});

})(jQuery, mw, fabric, ext_imageAnnotator);




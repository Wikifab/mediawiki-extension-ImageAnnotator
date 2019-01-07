
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wfcustompic = fabric.util.createClass(fabric.Image, {

	   // Min and Max size to enforce (false == no enforcement)
	   minSize: 10,
	   maxSize: 200,

	});

})(jQuery, mw, fabric, ext_imageAnnotator);




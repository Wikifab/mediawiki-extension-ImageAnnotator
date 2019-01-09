
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

	ext_imageAnnotator.shapes.Wfcustompic = fabric.util.createClass(fabric.Image, {

	   // Min and Max size to enforce (false == no enforcement)
	   minSize: 10,
	   maxSize: 200,

	   borderWidth: 4,
	   padding: 5,
	   originX: 'center',
	   originY: 'center',
	   transparentCorners:false,
	   borderColor: 'black',
	   cornerColor: 'rgba(200,200,200,1)',

	   type: 'wfcustompic',

	   // the filename use to create icon
	   // (must match a File:<filename> uploaded on mediawiki )
	   filename: '',
	   fileurl: '',

	   initialize : function(element, options) {


			options || (options = {});

			if (typeof options['filename'] !== 'undefined') {
				this.filename = options['filename'];
			}
			if (typeof options['fileurl'] !== 'undefined') {
				this.fileurl = options['fileurl'];
			}
			// element should contain img div used to display image
			if(! $(element).is( "img" )) {
				// if it is not, (when loaded from Json)
				// we must build it

				this.filename = element['filename'];
				this.fileurl = element['fileurl'];
				options['top'] = element['top'];
				options['left'] = element['left'];
				options['width'] = element['width'];
				options['height'] = element['height'];
				options['scaleX'] = element['scaleX'];
				options['scaleY'] = element['scaleY'];
				options['angle'] = element['angle'];
				options['flipX'] = element['flipX'];
				options['flipY'] = element['flipY'];

				var imgElement = $('.ia-custompics[data-imgid="'+this.filename + '"]').get(0);
				element = imgElement;
				// TODO : case where imgElement not found (appends when list of images has changed)
			}
			this.callSuper('initialize', element, options);
		},


	   toJSON: function(propertiesToInclude) {
		   if(! propertiesToInclude) {
			   propertiesToInclude = [];
		   }
		   propertiesToInclude.push('filename');
		   propertiesToInclude.push('fileurl');
		   return this.callSuper('toJSON', propertiesToInclude);
	   },
	   toObject: function(propertiesToInclude) {
		   if(! propertiesToInclude) {
			   propertiesToInclude = [];
		   }
		   propertiesToInclude.push('filename');
		   propertiesToInclude.push('fileurl');
		   return this.callSuper('toObject', propertiesToInclude);

	   }


	});

})(jQuery, mw, fabric, ext_imageAnnotator);




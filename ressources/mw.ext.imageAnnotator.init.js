/**
 * this script is the start point of all JS actions
 *
 * on edit page, this script look for every class "editableImageDataInput",
 * it create an editor class un each of them, and add a button to open the editor,
 * it also watch even of adding or removing image to add/remove corresponding editor
 *
 * on view pages, it will simply launch the editor class to display annotations
 */


ext_imageAnnotator = ext_imageAnnotator || {};



//$(document).ready(function (mw, ext_imageAnnotator ) {
( function ( $, mw , ext_imageAnnotator) {

	var editLinkRegister = ext_imageAnnotator.getEditLinkRegister();

	function isValidImageType(image) {
		if( ! image || image.length == 0) {
			return false;
		}
		return true;
	}

	/* utility function for checking ratio */
	function respectsAspectRatio(a, b, w, h) {

		function greatestCommonDivisor(a,b) {
			if (b == 0) {
				return a
			}
		    return greatestCommonDivisor(b, a % b)
		}

		var gcd = greatestCommonDivisor(a,b);

		return a / gcd === w && b / gcd === h;
	}

	mw.ext_imageAnnotator = mw.ext_imageAnnotator || {};

	/**
	 * this enable an outside extension to call ImageAnnotator with this function
	 */
	mw.ext_imageAnnotator.createNewEditor = function (container, img, content, updateCallBack, options) {

		this.popup = new ext_imageAnnotator.EditorBlock(container, img, content, updateCallBack, options );

		return this.popup;
	}

	/**
	 * this enable an outside extension to call ImageAnnotator with this function
	 */
	mw.ext_imageAnnotator.createAnnotatedImage = function (imagePreview, content, image) {

		return new ext_imageAnnotator.Editor( imagePreview, canvasId = null, content, image ) ;
	}


	// edition :
	$('.editableImageDataInput').each(function () {

		//find target Image :
		var targetInputName = $(this).attr('data-targetname');

		//find imagePreview :

		var imageInput = $("input[name='"+targetInputName + "']");
		var imageInputId = imageInput.attr('id');
		var imagePreview = $("#" +imageInputId + "_imagepreview");

		// correct img size :
		imagePreview.find('img').width("100%");

		var canvasId = null;//imageInputId + "_overlaycanvas";
		var content = $(this).val();
		var image = imagePreview.find('img');

		if( ! isValidImageType(image)) {
			// if the is not an image (a video for instance) we do not add editor
			return ;
		}


		// load static canvas
		var staticEditor = new ext_imageAnnotator.Editor( imagePreview, canvasId = null, content, image ) ;

		var editLink = new ext_imageAnnotator.EditLink( imagePreview, this, image, staticEditor);

		editLinkRegister.registerEditLink(editLink, $(this).attr('name'));

	});

	mw.hook('pmg.secondaryGallery.itemRemoved').add( function(li) {
		editLinkRegister.removeEditLinkInput(li);

	});
	mw.hook('pmg.secondaryGallery.itemChanged').add( function(input, li) {

		//the input is the image input, we must get the data input :
		//find target Image :
		var inputName = $(input).attr('name');

		var dataInput = $("input[data-targetname='"+inputName + "']");

		editLinkRegister.updateEditLinkInput (li, $(dataInput).attr('name')) ;

	});


	mw.hook('pmg.secondaryGallery.newImageAdded').add( function(imageInput,li,secondaryGallery) {

		// hook to add edit link on image dropped on step :

		// TODO : this doesn't work, see why !
		//find target Image :
		//var targetInputName = $(this).attr('data-targetname');

		//find imagePreview :

		//var imageInput = $("input[name='"+targetInputName + "']");
		var targetInputName = $(imageInput).attr('name');
		var dataInput = $("input[data-targetname='"+targetInputName + "']");
		var imageInputId = $(imageInput).attr('id');
		var imagePreview = $(li).find('.pfImagePreviewWrapper');
		var buttonBar = $(li).find('.file-buttonbar');

		// correct img size :
		imagePreview.find('img').width("100%");

		var canvasId = null;//imageInputId + "_overlaycanvas";
		var content = $(dataInput).val();
		var image = imagePreview.find('img');

		if( ! isValidImageType(image)) {
			// if the is not an image (a video for instance) we do not add editor
			return ;
		}

		// load static canvas
		var staticEditor = new ext_imageAnnotator.Editor( imagePreview, canvasId = null, content, image ) ;

		var editLink = new ext_imageAnnotator.EditLink( buttonBar, dataInput, image, staticEditor);

		editLinkRegister.registerEditLink(editLink, $(dataInput).attr('name'));

		if (editLink.predefinedFormat) { /* Imposed ratio : the image must be cropped before being added. */

			// Trick to get the actual width and height of the image.
			$("<img>").attr("src", $(image).attr("src")).load(function(){
	            var imgRealWidth = this.width;
	            var imgRealHeight = this.height;

	            var regex = /(\d{1,2})_(\d{1,2})/i;
				var match = regex.exec(editLink.predefinedFormat);
				var ratio_width = parseInt(match[1]);
				var ratio_height = parseInt(match[2]);

				// If it already has the right ratio, don't do anything.
				if (!respectsAspectRatio(imgRealWidth, imgRealHeight, ratio_width, ratio_height)) {

					var ratio = editLink.predefinedFormat;

					// open the editor popup (it will be closed by the crop popup)
					editLink.openEditor();

					// get crop position
					var cropPosition = editLink.popup.editor.getCropedImagePosition();

					// open the crop popup (pass the ratio to it)
					var cropPopup = new ext_imageAnnotator.CropPopup(editLink.popup.editor, editLink.popup.editor.image, cropPosition, [editLink.popup.editor, editLink.popup.editor.applyCrop ], editLink.popup.$editorPopup, false, ratio);

					//Prevents closure with esc
					var popupOptions = cropPopup.cropPopup.data('popupoptions');
					popupOptions.escape = false;
					cropPopup.cropPopup.data('popupoptions', popupOptions);

					/* redefine these methods */
					cropPopup.save = function () {
						// the initial function
						ext_imageAnnotator.CropPopup.prototype.save.call(this);
						// close the editor popup, too
						editLink.popup.save();
					};

					cropPopup.cancel = function () {
						// the initial function
						ext_imageAnnotator.CropPopup.prototype.cancel.call(this);
						// close the editor popup, too
						editLink.popup.$editorPopup.popup('hide');

						// remove the added image
						secondaryGallery.removeImg(li);
					};
				}
	        });
		}

	});


	// display image annotation on view page :
	$('.annotatedImageContainer').each(function () {
		var annotatedContent = $(this).find('.annotatedcontent').attr('data-annotatedcontent');
		var image = $(this).find('img');

		if( image && annotatedContent) {
			try {
				// check that this is json (not json when field doesn't exist)
				// it trigger an exception if so
				var jsonObject = jQuery.parseJSON(annotatedContent);
				// we add editor only for existing images
				var staticEditor = new ext_imageAnnotator.Editor( this, canvasId = null, annotatedContent, image ) ;
				$(this).find('a').css('display','inline-block');
			}
			catch(e) {
				// occur for empty field, which set annotatedContent = {{{<fieldName>}}} (not JSON)
				return;
			}
		}
	});

	$('.annotationlayer').each(function () {
        $(this).css('filter', 'blur(0)');
        $(this).parent().next().hide();
    });

}( jQuery, mediaWiki , ext_imageAnnotator) );




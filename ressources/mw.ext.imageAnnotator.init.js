
ext_imageAnnotator = ext_imageAnnotator || {};



//$(document).ready(function (mw, ext_imageAnnotator ) {
( function ( $, mw , ext_imageAnnotator) {
	
	var editLinkRegister = ext_imageAnnotator.getEditLinkRegister();
	
	
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
		var image = imagePreview.find('img')

		console.log("create canvas " + imageInputId);
		console.log(content);
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
	
	
	mw.hook('pmg.secondaryGallery.newImageAdded').add( function(imageInput,li) {
		
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
		
		console.log('add image ');
		console.log('imageInput');
		console.log(buttonBar);
		
		// correct img size :
		imagePreview.find('img').width("100%");
		
		var canvasId = null;//imageInputId + "_overlaycanvas";
		var content = $(dataInput).val();
		var image = imagePreview.find('img')

		console.log("create canvas " + imageInputId);
		console.log(content);
		// load static canvas
		var staticEditor = new ext_imageAnnotator.Editor( imagePreview, canvasId = null, content, image ) ;
		
		var editLink = new ext_imageAnnotator.EditLink( buttonBar, dataInput, image, staticEditor);
		
		editLinkRegister.registerEditLink(editLink, $(dataInput).attr('name'));
		
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

}( jQuery, mediaWiki , ext_imageAnnotator) );




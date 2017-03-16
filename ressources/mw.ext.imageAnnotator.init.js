var mw = mw || {};
mw.ext = mw.ext || {};
mw.ext.imageAnnotator = mw.ext.imageAnnotator || {};


$(document).ready(function () {

	
	var editLinkRegister = mw.ext.imageAnnotator.getEditLinkRegister();
	
	
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
		var staticEditor = new mw.ext.imageAnnotator.Editor( imagePreview, canvasId = null, content, image ) ;
		
		var editLink = new mw.ext.imageAnnotator.EditLink( imagePreview, this, image, staticEditor);
		
		editLinkRegister.registerEditLink(editLink, $(this).attr('name'));
		
	});

	mw.hook('pmg.secondaryGallery.itemRemoved').add( function(input) {
		//editLinkRegister.registerEditLink(editLink, $(this).attr('name'));
		
	});
	mw.hook('pmg.secondaryGallery.itemChanged').add( function(input, li) {
		// we reorder thumb, we must change the input used to store the json data
		//editLinkRegister.registerEditLink(editLink, $(this).attr('name'));
		
	});

	/*
	mw.hook('pmg.secondaryGallery.newThumbAdded').add( function(li) {
		console.log('add thumb !!');
		console.log(li);
		// get image preview div
		var imagePreview = $(li).find('.pfImagePreviewWrapper');
		if (imagePreview.length != 1) {
			return;
		}
		
		if ($(li).find('.mw-ia-editButton').length > 0 ) {
			console.log ('edit link allready created');
			return;
		}
		console.log(imagePreview);
		var inputId = imagePreview.attr('id');
		if(inputId) {
			inputId = inputId.replace('_imagepreview','');
		} else {
			console.log ('fail to get input Id');
			return;
		}
		// get image element
		var image = imagePreview.find('img');
		console.log("look for " + inputId);
		// get data input element
		var inputName = $('#' + inputId).attr('name');
		console.log( 'attr name ' + inputName);
		var dataInput = $('input.editableImageDataInput[data-targetname="' +inputName + '"]');
		console.log(dataInput);
		
		imagePreview.find('img')
		// load static canvas
		var staticEditor = new mw.ext.imageAnnotator.Editor( imagePreview, null, dataInput.val(), image ) ;
		
		new mw.ext.imageAnnotator.EditLink( imagePreview, dataInput, image, staticEditor);
		
		//check if link already there
		// create editor
		// create editlink
		
	});*/
	
	
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
				var staticEditor = new mw.ext.imageAnnotator.Editor( this, canvasId = null, annotatedContent, image ) ;
				$(this).find('a').css('display','inline-block');
			}
			catch(e) {
				// occur for empty field, which set annotatedContent = {{{<fieldName>}}} (not JSON)
				return;
			}
		}
	});
});







var mw = mw || {};
mw.ext = mw.ext || {};
mw.ext.imageAnnotator = mw.ext.imageAnnotator || {};


$( document ).ready(function() {
    console.log( "ready!" );
});

$(document).ready(function () {
		
	
	console.log('START ImageAnnotator ' );
	
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
		
		console.log('new Editor on ' + targetInputName + ' : ' + canvasId);

		// load static canvas
		var staticEditor = new mw.ext.imageAnnotator.Editor( imagePreview, canvasId = null, content, image ) ;
		
		
		// TODO :  set link between edit link and static Canvas, and create save button
		new mw.ext.imageAnnotator.EditLink( imagePreview, this, image, staticEditor);
		
	});
	
	
	// display image annotation on view page :
	$('.annotatedImageContainer').each(function () {
		var annotatedContent = $(this).find('.annotatedcontent').attr('data-annotatedcontent');
		var image = $(this).find('img');
		console.log('annotatedImage');
		console.log(annotatedContent);
		if (annotatedContent) {
			var staticEditor = new mw.ext.imageAnnotator.Editor( this, canvasId = null, annotatedContent, image ) ;
		}
		$(this).find('a').css('display','inline-block');
	});
});







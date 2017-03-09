var mw = mw || {};
mw.ext = mw.ext || {};
mw.ext.imageAnnotator = mw.ext.imageAnnotator || {};

( function ( $, mw, fabric ) {
	'use strict';


	/**
	 * @class
	 * @constructor
	 * @param {jQuery} container container to put editor in it
	 * @param {jQuery} inputElement Where canvas data is registered
	 * @param {jQuery} imageElement 
	 * @param {fabric.StaticCanvas} static editor, (make image param useless ?)
	 */
	mw.ext.imageAnnotator.EditLink = function ( container, dataInput, image, staticEditor ) {
		
		
		var editor = this; 
		this.container = container;
		this.image = image;
		this.staticEditor = staticEditor;
		this.dataInput = dataInput;
		
		var button = $('<span class="image-button mw-ia-editButton"></span>');

		button.click(function() {
			setTimeout(function() {
				editor.openEditor();
			}, 10);
			return false;
		});
		this.container.append(button);
	}
	
	mw.ext.imageAnnotator.EditLink.prototype.openEditor = function () {
		
		this.popup = new mw.ext.imageAnnotator.EditorPopup( this.image, $(this.dataInput).val(), this.staticEditor, this.dataInput );
		
	}


})(jQuery, mw, fabric);




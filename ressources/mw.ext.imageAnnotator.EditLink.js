var mw = mw || {};
mw.ext = mw.ext || {};
mw.ext.imageAnnotator = mw.ext.imageAnnotator || {};

( function ( $, mw, fabric ) {
	'use strict';


	var editLinkCounter = 0;
	/**
	 * @class
	 * @constructor
	 * @param {jQuery} container container to put editor in it
	 * @param {jQuery} inputElement Where canvas data is registered
	 * @param {jQuery} imageElement 
	 * @param {fabric.StaticCanvas} static editor, (make image param useless ?)
	 */
	mw.ext.imageAnnotator.EditLink = function ( container, dataInput, image, staticEditor ) {
		
		editLinkCounter ++;
		
		this.editLinkId = editLinkCounter;
		
		
		var editor = this; 
		this.container = container;
		this.image = image;
		this.staticEditor = staticEditor;
		this.dataInput = dataInput;
		
		var button = $('<span class="image-button mw-ia-editButton"></span>').attr('id', this.getId());

		button.click(function() {
			setTimeout(function() {
				editor.openEditor();
			}, 10);
			return false;
		});
		this.container.append(button);
		console.log (this.getId());
	}
	
	mw.ext.imageAnnotator.EditLink.prototype.getId = function () {
		return 'iaEditLink' + this.editLinkId;
	}
	
	/**
	 * this function allow to change the dataInput linked to this button
	 * for instance, if after reorder images elements, image is move into another input
	 * 
	 * @param [Object] datainput
	 */
	mw.ext.imageAnnotator.EditLink.prototype.updateDataInput = function (dataInput) {
		this.dataInput = dataInput;
	}
	
	mw.ext.imageAnnotator.EditLink.prototype.openEditor = function () {
		
		this.popup = new mw.ext.imageAnnotator.EditorPopup( this.image, $(this.dataInput).val(), this.staticEditor, this.dataInput );
		
	}


})(jQuery, mw, fabric);




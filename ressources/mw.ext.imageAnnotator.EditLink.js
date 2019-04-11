var mw = mw || {};
mw.ext = mw.ext || {};
ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
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
	ext_imageAnnotator.EditLink = function ( container, dataInput, image, staticEditor ) {

		editLinkCounter ++;

		this.editLinkId = editLinkCounter;


		var editor = this;
		this.container = container;
		this.image = image;
		this.staticEditor = staticEditor;
		this.dataInput = dataInput;
		this.content = $(this.dataInput).val();

		/* ratio, if any */
		var imageInput = $("input[name='"+ $(dataInput).data('targetname') + "']");
		var className = $(imageInput).attr('class');
		// get ratio, if any
		var regex = /\bratio(\d{1,2}_\d{1,2})\b/;
		var match = regex.exec(className);
		if (match) {
			this.predefinedFormat = match[1];
		}

		var button = $('<span class="image-button mw-ia-editButton"></span>').attr('id', this.getId());

		button.click(function() {
			setTimeout(function() {
				editor.openEditor();
			}, 10);
			return false;
		});
		this.container.append(button);
	}

	ext_imageAnnotator.EditLink.prototype.getId = function () {
		return 'iaEditLink' + this.editLinkId;
	}

	/**
	 * this function allow to change the dataInput linked to this button
	 * for instance, if after reorder images elements, image is move into another input
	 *
	 * @param [Object] datainput
	 */
	ext_imageAnnotator.EditLink.prototype.updateDataInput = function (dataInput) {
		this.dataInput = dataInput;
		$(this.dataInput).val(this.content);
	}

	ext_imageAnnotator.EditLink.prototype.openEditor = function () {

		this.popup = new ext_imageAnnotator.EditorPopup(this, this.image, $(this.dataInput).val() );

	}

	ext_imageAnnotator.EditLink.prototype.updateData = function (content) {
		this.content = content;
		$(this.dataInput).val(content)

		this.staticEditor.updateData(content);
	}


})(jQuery, mw, fabric, ext_imageAnnotator);




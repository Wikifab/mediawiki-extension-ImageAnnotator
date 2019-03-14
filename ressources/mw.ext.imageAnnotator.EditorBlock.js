/**
 *
 * this class is en equivalent of EditorPopup, but it open the editor in a simple dic, not in a popup
 *
 */

ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator) {
	'use strict';


	ext_imageAnnotator.EditorBlock_mainDiv = null;

	/**
	 * @class
	 * @constructor
	 * @param {jQuery} container container to put editor in it
	 * @param {string} [content='']
	 */
	ext_imageAnnotator.EditorBlock = function (containerDiv, image, content, updateDataCallBack ) {

		this.containerdiv = containerDiv;
		this.updateDataCallBack = updateDataCallBack;
		this.initBlock();
		this.image = image;
		this.content = content;


		this.clonedImage = $(image).clone();
		this.clonedImage.appendTo(this.imagediv);

		this.launchEditor();
	}

	ext_imageAnnotator.EditorBlock.prototype.hide = function() {
	}

	ext_imageAnnotator.EditorBlock.prototype.launchEditor = function () {
		var editorBlock = this;

		var options = {
				'toolbarContainer' : this.toolbar
		};
		this.editor = new ext_imageAnnotator.Editor( this.imagediv, null, this.content, this.clonedImage, true, options );

		$(this.imagediv).css('width', ext_imageAnnotator.standardWidth + 'px');
		$(this.imagediv).css("background-image", "url('" + this.clonedImage.attr('src') +"')");
		$(this.imagediv).css("background-repeat", "no");
		$(this.imagediv).css("background-size", "100% 100%");
		this.clonedImage.hide();


		console.log('launchEditor');
		console.log(this.clonedImage);
		// add cancel button
		this.buttonbar.append($('<button >' +mw.message( 'imageannotator-button-cancel' ).text() + '</button>').addClass('cancelButton').click(function () {
			setTimeout(function () {
				editorBlock.hide();
			}, 10);
			return false;
		}));

		// add save button
		this.buttonbar.append($('<button>' +mw.message( 'imageannotator-button-save' ).text() + '</button>').addClass('saveButton').click(function () {
			setTimeout(function () {
				editorBlock.save();
			}, 10);
			return false;
		}));

	}

	/**
	 * this init container, (it erase content if any)
	 */
	ext_imageAnnotator.EditorBlock.prototype.initBlock = function () {
		var editorBlock = this;

		this.containerdiv.html('');

		this.maindiv = $( '<div>' )
			.addClass( 'mw-ia-popup-main' )
			.appendTo(this.containerdiv);
		this.toolbar = $( '<div>' )
			.addClass( 'mw-ia-popup-toolbar' )
			.appendTo(this.maindiv);
		this.imagediv = $( '<div>' )
			.addClass( 'mw-ia-popup-image' )
			.appendTo(this.maindiv);
		this.buttonbar = $( '<div>' )
			.addClass( 'mw-ia-popup-buttonbar' )
			.appendTo(this.maindiv);

		ext_imageAnnotator.EditorBlock_mainDiv = this.maindiv;
	};

	/**
	 * save modifications into original input
	 */
	ext_imageAnnotator.EditorBlock.prototype.save = function () {
		var jsonData = this.editor.getJson();
		// update thumb is call within update Data, must not been called twice :
		//this.editor.generateThumbUsingAPI(jsonData);
		this.updateDataCallBack(this, jsonData);
		//this.editLink.updateData(jsonData);

	}
	/**
	 * generate thumb using api, after generation, the call back is calle, with image url in param
	 */
	ext_imageAnnotator.EditorBlock.prototype.generateThumb = function (callback) {
		var jsonData = this.editor.getJson();
		this.editor.generateThumbUsingAPI(jsonData, callback);
	}

})(jQuery, mediaWiki, fabric, ext_imageAnnotator);
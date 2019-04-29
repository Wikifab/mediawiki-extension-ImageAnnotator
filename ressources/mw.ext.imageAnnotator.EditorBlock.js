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
	ext_imageAnnotator.EditorBlock = function (containerDiv, image, content, updateDataCallBack, options ) {

		this.containerdiv = containerDiv;
		this.updateDataCallBack = updateDataCallBack;
		this.options = options;
		this.initBlock();
		this.image = image;
		this.content = content;

		this.editorWidth = options['custom-dimensions'] ? options['custom-dimensions'].width : ext_imageAnnotator.standardWidth;

		console.log('editor dimention : ' + this.editorWidth);


		this.clonedImage = $(image).clone();

		// check that image is an original size :
		var imgSrc = this.clonedImage.attr('src');
		var regex = new RegExp('/thumb/([a-z0-9A-Z])/([a-z0-9A-Z]{2})/([^/]+)/([^/]+)$');
		if (imgSrc.match(regex)) {
			console.log("EditorBlock construct");
			console.log('Warning : image source should not be thumbnail, filename changed to original');
			console.log(imgSrc);
			imgSrc = imgSrc.replace(regex, '/$1/$2/$3');
			this.clonedImage.attr("src",imgSrc);
		}


		this.clonedImage.appendTo(this.imagediv);

		this.launchEditor();
	}

	ext_imageAnnotator.EditorBlock.prototype.launchEditor = function () {
		var editorBlock = this;

		var options = {
				'toolbarContainer' : this.toolbar
		};
		if (this.options['custom-dimensions']) {
			options['custom-dimensions'] = this.options['custom-dimensions'];
		}
		this.editor = new ext_imageAnnotator.Editor( this.imagediv, null, this.content, this.clonedImage, true, options );

		$(this.imagediv).css('width', this.editorWidth + 'px');
		//$(this.imagediv).css("background-image", "url('" + this.clonedImage.attr('src') +"')");
		$(this.imagediv).css("background-repeat", "no");
		$(this.imagediv).css("background-size", "100% 100%");
		this.clonedImage.hide();


		//console.log('launchEditor');
		//console.log(this.clonedImage);

		if ( ! this.options || ! this.options['no-controlbar']) {
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
	 * cancel edition
	 */
	ext_imageAnnotator.EditorBlock.prototype.hide = function() {
		// call an cancel action
		console.log("EditorBlock.prototype.hide");
	}

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
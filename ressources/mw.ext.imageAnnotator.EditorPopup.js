ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator) {
	'use strict';


	ext_imageAnnotator.EditorPopup_isInit = false;
	ext_imageAnnotator.EditorPopup_mainDiv = null;

	/**
	 * @class
	 * @constructor
	 * @param {jQuery} container container to put editor in it
	 * @param {string} [content='']
	 */
	ext_imageAnnotator.EditorPopup = function (editLink, image, content ) {
		this.editLink = editLink;
		this.initPopup();
		this.image = image;
		this.content = content;
		this.$editorPopup = $('#mw-ia-popup-div');

		this.clonedImage = $(image).clone();
		this.clonedImage.appendTo(this.imagediv);

		this.$editorPopup.popup({
		  blur: false // do not close when clicking outside the popup
		});

		this.$editorPopup.popup('show');
		this.launchEditor();
	}

	ext_imageAnnotator.EditorPopup.prototype.hide = function() {
		this.$editorPopup.popup('hide');
	}

	ext_imageAnnotator.EditorPopup.prototype.launchEditor = function () {
		var editorPopup = this;

		var options = {
				'toolbarContainer' : this.toolbar
		};

		if (this.editLink.freeCropping) {
			options['free-cropping'] = true;
		} else {
			if (this.editLink.predefinedFormat) options['predefinedFormat'] = this.editLink.predefinedFormat;
		}

		this.editor = new ext_imageAnnotator.Editor( this.imagediv, null, this.content, this.clonedImage, true, options );

		//$(this.imagediv).css('width', ext_imageAnnotator.standardWidth + 'px');
		//$(this.imagediv).css("background-image", "url('" + this.clonedImage.attr('src') +"')");
		$(this.imagediv).css("background-repeat", "no");
		$(this.imagediv).css("background-size", "100% 100%");
		this.clonedImage.hide();


		// add cancel button
		this.buttonbar.append($('<button >' +mw.message( 'imageannotator-button-cancel' ).text() + '</button>').addClass('cancelButton').click(function () {
			setTimeout(function () {
				editorPopup.hide();
			}, 10);
			return false;
		}));

		// add save button
		this.buttonbar.append($('<button>' +mw.message( 'imageannotator-button-save' ).text() + '</button>').addClass('saveButton').click(function () {
			setTimeout(function () {
				editorPopup.save();
			}, 10);
			return false;
		}));

	}

	/**
	 * this init popups div, if one popup has previously been launch, it erase content
	 */
	ext_imageAnnotator.EditorPopup.prototype.initPopup = function () {
		var editorPopup = this;
		if (ext_imageAnnotator.EditorPopup_isInit) {
			this.containerdiv = this.$editorPopup;
			this.maindiv = ext_imageAnnotator.EditorPopup_mainDiv;
			this.toolbar = this.maindiv.find('.mw-ia-popup-toolbar');
			this.imagediv = this.maindiv.find('.mw-ia-popup-image');
			this.buttonbar = this.maindiv.find('.mw-ia-popup-buttonbar');
			this.toolbar.html('');
			this.imagediv.html('');
			this.buttonbar.html('');
			return true;
		}


		this.containerdiv = $( '<div id="mw-ia-popup-div">' )
			.addClass( 'mw-ia-popup-container' );
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



		this.hiddendiv = $( '<div>' ).css('display', 'none').append(this.containerdiv);
		this.hiddendiv.appendTo($('body'));

		ext_imageAnnotator.EditorPopup_mainDiv = this.maindiv;
		ext_imageAnnotator.EditorPopup_isInit = true;
	};

	/**
	 * save modifications into original input
	 */
	ext_imageAnnotator.EditorPopup.prototype.save = function () {
		var jsonData = this.editor.getJson();
		// update thumb is call within update Data, must not been called twice :
		//this.editor.generateThumbUsingAPI(jsonData);
		this.editLink.updateData(jsonData);
		this.$editorPopup.popup('hide');

	}

})(jQuery, mediaWiki, fabric, ext_imageAnnotator);
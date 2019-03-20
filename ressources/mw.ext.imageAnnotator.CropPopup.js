ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator) {
	'use strict';


	ext_imageAnnotator.CropPopup_isInit = false;
	ext_imageAnnotator.CropPopup_mainDiv = null;

	/**
	 * @class
	 * @constructor
	 * @param {jQuery} container container to put editor in it
	 * @param {string} [content='']
	 */
	ext_imageAnnotator.CropPopup = function (editLink, image, cropPosition, cropCallback, sourcePopup ) {
		this.editLink = editLink;
		this.initPopup();
		this.image = image;
		this.cropPosition = cropPosition;
		this.content = '';
		this.sourcePopup = sourcePopup;
		this.cropCallback = cropCallback;


		this.clonedImage = $(image).clone();
		this.clonedImage.appendTo(this.imagediv);

		if (sourcePopup) {
			$('#mw-ia-croppopup-div').popup({
				onclose: function( event, ui ) {
					sourcePopup.show();
				}
			});
			sourcePopup.hide();
		}

		$('#mw-ia-croppopup-div').popup('show');

		this.launchEditor();

	}

	ext_imageAnnotator.CropPopup.prototype.hide = function() {
		$('#mw-ia-croppopup-div').popup('hide');
		this.sourcePopup.show();
	}

	ext_imageAnnotator.CropPopup.prototype.launchEditor = function () {
		var cropPopup = this;

		var options = {
				'toolbarContainer' : this.toolbar,
				'cropMode' : true,
				'fixedHeight' : 500
		};
		this.editor = new ext_imageAnnotator.Editor( this.imagediv, null, this.content, this.clonedImage, true, options );

		$(this.imagediv).css('width', ext_imageAnnotator.standardWidth + 'px');
		//$(this.imagediv).css("background-image", "url('" + this.clonedImage.attr('src') +"')");
		$(this.imagediv).css("background-repeat", "no");
		$(this.imagediv).css("background-size", "100% 100%");
		this.clonedImage.hide();

		this.editor.addCropZone(this.cropPosition);

		// add cancel button
		this.buttonbar.append($('<button >' +mw.message( 'imageannotator-button-cancel' ).text() + '</button>').addClass('cancelButton').click(function () {
			setTimeout(function () {
				cropPopup.hide();
			}, 10);
			return false;
		}));

		// add save button
		this.buttonbar.append($('<button>' +mw.message( 'imageannotator-button-crop' ).text() + '</button>').addClass('saveButton').click(function () {
			setTimeout(function () {
				cropPopup.save();
			}, 10);
			return false;
		}));

	}

	/**
	 * this init popups div, if one popup has previously been launch, it erase content
	 */
	ext_imageAnnotator.CropPopup.prototype.initPopup = function () {
		var cropPopup = this;
		if (ext_imageAnnotator.CropPopup_isInit) {
			this.containerdiv = $('#mw-ia-croppopup-div');
			this.maindiv = ext_imageAnnotator.CropPopup_mainDiv;
			this.toolbar = this.maindiv.find('.mw-ia-popup-toolbar');
			this.imagediv = this.maindiv.find('.mw-ia-popup-image');
			this.buttonbar = this.maindiv.find('.mw-ia-popup-buttonbar');
			this.toolbar.html('');
			this.imagediv.html('');
			this.buttonbar.html('');
			return true;
		}


		this.containerdiv = $( '<div id="mw-ia-croppopup-div">' )
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

		ext_imageAnnotator.CropPopup_mainDiv = this.maindiv;
		ext_imageAnnotator.CropPopup_isInit = true;
	};

	/**
	 * save modifications into original input
	 */
	ext_imageAnnotator.CropPopup.prototype.save = function () {

		var cropPositions = this.editor.getCropPosition();

		this.cropCallback[1].call(this.cropCallback[0], cropPositions);

		this.hide();

	}

})(jQuery, mediaWiki, fabric, ext_imageAnnotator);
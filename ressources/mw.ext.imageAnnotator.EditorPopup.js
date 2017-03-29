 var mw = mw || {};
mw.ext = mw.ext || {};
mw.ext.imageAnnotator = mw.ext.imageAnnotator || {};

( function ( $, mw, fabric ) {
	'use strict';


	mw.ext.imageAnnotator.EditorPopup_isInit = false;
	mw.ext.imageAnnotator.EditorPopup_mainDiv = null;
	
	/**
	 * @class
	 * @constructor
	 * @param {jQuery} container container to put editor in it
	 * @param {string} [content='']
	 */
	mw.ext.imageAnnotator.EditorPopup = function (editLink, image, content ) {
		this.editLink = editLink;
		this.initPopup();
		this.image = image;
		this.content = content;
		

		this.clonedImage = $(image).clone();
		this.clonedImage.appendTo(this.imagediv);

		$('#mw-ia-popup-div').popup('show');
		this.launchEditor();
	}
	
	mw.ext.imageAnnotator.EditorPopup.prototype.launchEditor = function () {
		var editorPopup = this;
/*
		console.log('width : ' + this.image.width());
		console.log('height : ' + this.image.height());
		console.log('width : ' + this.clonedImage.width());
		console.log('height : ' + this.clonedImage.height());*/
		var options = {
				'toolbarContainer' : this.toolbar
		};
		this.editor = new mw.ext.imageAnnotator.Editor( this.imagediv, null, this.content, this.clonedImage, true, options );

		$(this.imagediv).css('width', mw.ext.imageAnnotator.standardWidth + 'px');
		$(this.imagediv).css("background-image", "url('" + this.clonedImage.attr('src') +"')");
		$(this.imagediv).css("background-repeat", "no");
		$(this.imagediv).css("background-size", "100% 100%");
		this.clonedImage.hide();
		
		this.buttonbar.append($('<button>Save</button>').click(function () {
			setTimeout(function () {
				editorPopup.save();
			}, 10);
			return false;
		}));
	}
		
	/**
	 * this init popups div, if one popup has previously been launch, it erase content
	 */
	mw.ext.imageAnnotator.EditorPopup.prototype.initPopup = function () {
		var editorPopup = this;
		if (mw.ext.imageAnnotator.EditorPopup_isInit) {
			this.containerdiv = $('#mw-ia-popup-div');
			this.maindiv = mw.ext.imageAnnotator.EditorPopup_mainDiv;
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
		
		mw.ext.imageAnnotator.EditorPopup_mainDiv = this.maindiv;
		mw.ext.imageAnnotator.EditorPopup_isInit = true;
	};
	
	/**
	 * save modifications into original input
	 */
	mw.ext.imageAnnotator.EditorPopup.prototype.save = function () {
		this.editLink.updateData(this.editor.getJson());
		$('#mw-ia-popup-div').popup('hide');
		
	}

})(jQuery, mw, fabric);
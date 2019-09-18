
ext_imageAnnotator_maintenance = ext_imageAnnotator_maintenance || {};


( function ( $, mw, fabric, ext_imageAnnotator_maintenance ) {

	ext_imageAnnotator_maintenance.maintenance = ext_imageAnnotator_maintenance.maintenance || {};

	// parse semantic data of a page to extract images
	ext_imageAnnotator_maintenance.maintenance.buildImage = function (includedAnnotatedImage, callback) {

		var buildImage = this;
		buildImage.includedAnnotatedImage = includedAnnotatedImage;
		buildImage.callback = callback;


		this.container = $('<div>BuildingImage</div>');
		ext_imageAnnotator_maintenance.maintenance.buildingContainer.$element.append(this.container);

		buildImage.imagePreview = $('<div class="pfImagePreviewWrapper">');
		buildImage.imgelement = $('<img style="min-height:30px;">');
		this.container.append(buildImage.imagePreview);
		buildImage.imagePreview.append(buildImage.imgelement);


		var params = {
				action: 'query',
				titles: 'File:' + includedAnnotatedImage.image,
				prop: 'imageinfo',
				iiprop: 'url'
			};

		var api = new mediaWiki.Api();
		api.post(params).done( function (data) {
			buildImage.getImageUrlCallBack(data);
		} ).fail( self.listImagesFail );

	};
	// parse semantic data of a page to extract images
	ext_imageAnnotator_maintenance.maintenance.buildImage.prototype.getImageUrlCallBack = function (data) {
		var buildImage = this;
		var img_url = null;

		$.each(data.query.pages, function(index, value) {
			if ( value.imageinfo && !value.imageinfo[0] && value.imageinfo[0].url){
				img_url = value.imageinfo[0].url;
			}
		});

		if (! img_url) {
			console.log ('fail to get url of source image ' + this.includedAnnotatedImage.image);
			if (this.callback) {
				this.callback(false);
			}
		}

		buildImage.imgelement.attr('src',img_url);
		var imgContent = buildImage.includedAnnotatedImage['annotation'];

		try {
			var editor = new mw.ext_imageAnnotator.createAnnotatedImage(buildImage.imagePreview, imgContent,  buildImage.imgelement)

			editor.generateThumbUsingAPI(imgContent, function () {
				buildImage.generationEnded();
			}, true);
		} catch ( e) {
			this.callback(false);
		}

		//var staticEditor = new mw.ext_imageAnnotator.Editor( buildImage.imagePreview, canvasId = null, imgContent, buildImage.imgelement ) ;
	}
	// parse semantic data of a page to extract images
	ext_imageAnnotator_maintenance.maintenance.buildImage.prototype.generationEnded = function () {
		// removing image from dom :
		this.container.remove();
		if (this.callback) {
			this.callback(true);
		}
	}



})(jQuery, mediaWiki, fabric, ext_imageAnnotator_maintenance);

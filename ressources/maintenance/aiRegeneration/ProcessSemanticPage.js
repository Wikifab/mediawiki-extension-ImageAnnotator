
ext_imageAnnotator_maintenance = ext_imageAnnotator_maintenance || {};

( function ( $, mw, fabric, ext_imageAnnotator_maintenance ) {

	ext_imageAnnotator_maintenance.maintenance = ext_imageAnnotator_maintenance.maintenance || {};

	// parse semantic data of a page to extract images
	ext_imageAnnotator_maintenance.maintenance.processSemanticPage = function (semanticData, callback) {
		this.callback = callback;
		var processSemanticPage = this;

		var content = semanticData.content;
		this.includedAnnotatedImages = [];
		this.parseContent(content);

		this.nbImageToBuild = this.includedAnnotatedImages.length;
		console.log('processSemanticPage ' + semanticData.title +  'nb image to build : ' + this.nbImageToBuild);

		this.nbImageBuilded = 0;
		this.includedAnnotatedImages.forEach(function (item) {
			processSemanticPage.buildImage(item);
		});
		if (this.includedAnnotatedImages.length == 0) {
			this.callback(true);
		}
	};

	// parse data, and look for '_annotation' image filled
	ext_imageAnnotator_maintenance.maintenance.processSemanticPage.prototype.parseContent = function (content) {
		var processSemanticPage = this;

		$.each(content, function(index, value) {
			if (Array.isArray(value) || (typeof value === "object")) {
				processSemanticPage.parseContent(value);
			} else if(typeof index == "string"){
				if (index.endsWith('_annotation') && value) {
					var imageIndex = index.replace('_annotation','');
					if (content[imageIndex]) {
						var imageFounded = {
								imageIndex: imageIndex,
								image: content[imageIndex],
								annotation: value,
						}
						processSemanticPage.includedAnnotatedImages.push(imageFounded);
					}
				}
			}
		});
	};

	// parse data, and look for '_annotation' image filled
	ext_imageAnnotator_maintenance.maintenance.processSemanticPage.prototype.buildImage = function (includedAnnotatedImage) {
		var processSemanticPage = this;

		var buildImage = new ext_imageAnnotator_maintenance.maintenance.buildImage(includedAnnotatedImage, function (success) {
			processSemanticPage.buildImageCallBack(success)
		});

	};

	// parse data, and look for '_annotation' image filled
	ext_imageAnnotator_maintenance.maintenance.processSemanticPage.prototype.buildImageCallBack = function (success) {

		this.nbImageBuilded = this.nbImageBuilded + 1;
		console.log('image building : ' + this.nbImageBuilded + ' / ' + this.nbImageToBuild);
		if (this.nbImageBuilded >= this.nbImageToBuild ) {
			console.log('End of page building');
			this.callback(true);
		}
	};

})(jQuery, mediaWiki, fabric, ext_imageAnnotator_maintenance);


ext_imageAnnotator_maintenance = ext_imageAnnotator_maintenance || {};

( function ( $, mw, fabric, ext_imageAnnotator_maintenance ) {

	ext_imageAnnotator_maintenance.maintenance = ext_imageAnnotator_maintenance.maintenance || {};

	// parse semantic data of a page to extract images
	ext_imageAnnotator_maintenance.maintenance.processVEPage = function (pageTitle, callback) {
		this.callback = callback;

		var processVEPage = this;

		this.pageTitle =pageTitle;

		console.log('processVEPage ' + pageTitle );

		var params = {
				action: 'query',
				titles: pageTitle,
				// apfrom: form.wpDraftToken.value,
				// apnamespace: 0,
				prop:'revisions',
				rvprop:'content'
			};

		var api = new mediaWiki.Api();
		api.post(params).done( function (data) {

			var pages = Object.values(data.query.pages);
			if (pages) {
				var pageData = pages.pop();
				processVEPage.pageDataProcessResults(pageData);
			} else {
				console.log('no page data found');
				console.log(data);
				processVEPage.callback(false);
			}
		}).fail( function (data) {
			console.log('fail getting page revision');
			processVEPage.callback(false);
		});
	};

	ext_imageAnnotator_maintenance.maintenance.processVEPage.prototype.extractAnnotatedImage = function (content) {


		// find string like :
		// {{#annotatedImageLight:Fichier:F700 tête axe Z 1.jpg
//		|0=1094px
//		|hash=607b248ea554bd47ae8df13d559d805a
//		|jsondata={"version":....:820.5,"width":1094}
//		|mediaClass=Image|type=frameless|align=center
//		|src=/w/images/thumb/b/ba/F700_tête_axe_Z_1.jpg/ia-607b248ea554bd47ae8df13d559d805a-px-F700_tête_axe_Z_1.jpg.png
//		|href=./Fichier:F700 tête axe Z 1.jpg|resource=./Fichier:F700 tête axe Z 1.jpg|caption=|size=1094px
//		}}

		//var regex = /\{\{\#annotatedImageLight(Fichier|File):([^\|\}]+)\|/g;
		var regex = /\{\{\#annotatedImageLight:(Fichier|File):([^\|\}]+)\|(.+)}}/g;
		var processVEPage = this;

		this.annotatedImages = [];

		console.log(content);

		console.log(content.matchAll(regex));

		return;

		var array = [...content.matchAll(regex)];
		//var array = content.matchAll(regex);

		array.forEach(function (match) {
			var filetitle = match[2];

			var annotatedImageParams = {};

			var params = match[3].split('|');
			params.forEach(function (param) {
				var i = param.search("=");
				if (i === false) {
					return;
				}
				var key = param.substring(0,i);
				var value = param.substring(i+1);
				annotatedImageParams[key] = value;
			});
			annotatedImageParams.image = filetitle;
			annotatedImageParams.annotation = annotatedImageParams["jsondata"];

			processVEPage.annotatedImages.push(annotatedImageParams);
		} );
	}


	ext_imageAnnotator_maintenance.maintenance.processVEPage.prototype.buildNextImage = function () {

		var nextImage = this.annotatedImages.pop();
		var processVEPage = this;

		if (nextImage) {
			try {
				//console.log('nextImage');
				//console.log(nextImage);
				var buildImage = new ext_imageAnnotator_maintenance.maintenance.buildImage(nextImage, function (success) {
					processVEPage.buildNextImage();
				});
			} catch (e) {
				console.error(e);
				processVEPage.buildNextImage()
			}
		} else {
			processVEPage.callback(false);
		}
	}



	ext_imageAnnotator_maintenance.maintenance.processVEPage.prototype.pageDataProcessResults = function (data) {
		var processVEPage = this;

		var pageRevision = data.revisions.pop();

		if (!pageRevision ) {
			console.log('no page revision foud');
			processVEPage.callback(false);
			return;
		}

		var content = pageRevision['*'];
		if ( ! content) {
			console.log('fail to get page content');
			console.log(pageRevision);
			this.buildNextImage();
			return;
		}

		this.extractAnnotatedImage(content);

		console.log("building images for page " + this.pageTitle + "(" + this.annotatedImages.length +" )");
		this.buildNextImage();
	}


})(jQuery, mediaWiki, fabric, ext_imageAnnotator_maintenance);

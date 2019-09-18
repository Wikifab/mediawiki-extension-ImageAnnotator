

var ext_imageAnnotator_maintenance = ext_imageAnnotator_maintenance || {};

( function ( $, mw, fabric, ext_imageAnnotator_maintenance ) {

	ext_imageAnnotator_maintenance.maintenance = ext_imageAnnotator_maintenance.maintenance || {};



	ext_imageAnnotator_maintenance.maintenance.processPage = function (nsId, pageName) {

		this.counter = 0;
		var processPage = this;

		var url = mw.config.get('wgArticlePath').replace('$1', "Spécial:ExportSemanticJson");


		console.log('processPage');
		console.log(url);
		var params = {
				pages: pageName,
			};
		$.ajax({
			  url: url,
			  data: params
		}).done(function(result) {
			processPage.processData(result)
		});
	};



	ext_imageAnnotator_maintenance.maintenance.listImages = function () {

		this.counter = 0;
		this.continuePage = null;

		ext_imageAnnotator_maintenance.maintenance.buildingContainer =  new OO.ui.PanelLayout( {
		    expanded: false,
		    framed: true,
		    padded: true
		} );

		$('#ia-regenerationoutput').append(ext_imageAnnotator_maintenance.maintenance.buildingContainer.$element);

		this.nextList();

	};
	ext_imageAnnotator_maintenance.maintenance.listImages.prototype.nextList = function () {
		var self = this;
		console.log("listImages query");
		var params = {
				action: 'query',
				list: 'allpages',
				// apfrom: form.wpDraftToken.value,
				// apnamespace: 0,
			};
		if (this.continuePage) {
			params.apfrom = this.continuePage;
		}

		// Performs asynchronous save on server
		var api = new mediaWiki.Api();
		api.post(params).done( function (data) {
			self.listImagesResults(data);
		}).fail( self.listImagesFail );
	}


	ext_imageAnnotator_maintenance.maintenance.listImages.prototype.listImagesResults = function (data) {
		console.log("listImages results");
		this.continuePage = data.continue.apcontinue;
		var listImage = this;
		var pages = data.query.allpages;
		var pageslist = '';
		console.log('nb pages to do : ' + pages.length);

		pages.forEach(function (item, index){
			listImage.counter++;
			pageslist = pageslist + item.title + "\n";
		});
		var pageListProcess = new ext_imageAnnotator_maintenance.maintenance.processPageList(pageslist, function (sucess) {
			console.log('Page list processed, getting new one');
			console.log(listImage.continuePage);
			if (listImage.continuePage) {
				listImage.nextList();
			}
		});
	}

	ext_imageAnnotator_maintenance.maintenance.listImages.prototype.listImagesFail = function (data) {
		console.log("listImages results fail");
		console.log(data);
	}

	$('#ia-start-regeneration').click(function () {
		console.log("start !");

		var listImage = new ext_imageAnnotator_maintenance.maintenance.listImages();
	});


})(jQuery, mediaWiki, fabric, ext_imageAnnotator_maintenance);


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

		this.pageParsingRunning = 0;

		this.pagesToParse = [];

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
				prop:'revisions',
				rvprop:'content'
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

	ext_imageAnnotator_maintenance.maintenance.listImages.prototype.parseNextPage = function () {

		var listImages = this;
		var title = this.pagesToParse.pop();

		if ( ! title) {
			console.log( 'END of pages to parse');
			return;
		}

		console.log ('Parsing page ('  + this.pagesToParse.length + ' remaining)');

		var pageListProcess = new ext_imageAnnotator_maintenance.maintenance.processVEPage(title, function (sucess) {

			listImages.parseNextPage();
		});
	}



	ext_imageAnnotator_maintenance.maintenance.listImages.prototype.listImagesResults = function (data) {
		console.log("listImages results");
		if (data.continue) {
			this.continuePage = data.continue.apcontinue;
		} else {
			this.continuePage = false;
		}
		var listImage = this;
		var pages = data.query.allpages;
		var pageslist = '';
		console.log('nb pages to do : ' + pages.length);

		var processSemanticAnnotatedImages = $('#ia-regeneration-semantic').prop('checked');
		var processVEAnnotatedImages = $('#ia-regeneration-vepage').prop('checked');


		pages.forEach(function (item, index){
			listImage.counter++;
			pageslist = pageslist + item.title + "\n";
			if (processVEAnnotatedImages) {
				listImage.pagesToParse.push(item.title);
			}
		});

		if (processSemanticAnnotatedImages) {
			var pageListProcess = new ext_imageAnnotator_maintenance.maintenance.processPageList(pageslist, function (sucess) {
				console.log('Page list processed, getting new one');
				if (listImage.continuePage) {
					listImage.nextList();
				} else {
					console.log('annotated images regeneration list OVER');

					// launch parser for VE ;
					listImage.parseNextPage();
				}
			});
		} else {
			listImage.parseNextPage();
		}

	}

	ext_imageAnnotator_maintenance.maintenance.listImages.prototype.listImagesFail = function (data) {
		console.log("listImages results fail");
		console.log(data);
	}

	var listImage ;

	$('#ia-start-regeneration').click(function () {
		console.log("start !");

		listImage = new ext_imageAnnotator_maintenance.maintenance.listImages();
//
//
//		ext_imageAnnotator_maintenance.maintenance.buildingContainer =  new OO.ui.PanelLayout( {
//		    expanded: false,
//		    framed: true,
//		    padded: true
//		} );
//
//		$('#ia-regenerationoutput').append(ext_imageAnnotator_maintenance.maintenance.buildingContainer.$element);
//
//		var pageListProcess = new ext_imageAnnotator_maintenance.maintenance.processPageList("Test_d'image,_avec_caractères_spéciaux", function (sucess) {
//
//		});
	});

	$('#ia-continue-regeneration').click(function () {
		console.log("continue !");

		listImage.nextList();
	});
	$('#ia-continue-pageparsing').click(function () {
		console.log("restart page parsing !");

		listImage.parseNextPage();
	});


	$('document').ready(function () {
		ext_imageAnnotator_maintenance.maintenance.buildingContainer =  new OO.ui.PanelLayout( {
		    expanded: false,
		    framed: true,
		    padded: true
		} );
		$('#ia-regenerationoutput').append(ext_imageAnnotator_maintenance.maintenance.buildingContainer.$element);

		//new ext_imageAnnotator_maintenance.maintenance.processVEPage("Dsf", function() {});

	});


})(jQuery, mediaWiki, fabric, ext_imageAnnotator_maintenance);
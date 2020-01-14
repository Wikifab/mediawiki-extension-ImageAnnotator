
ext_imageAnnotator_maintenance = ext_imageAnnotator_maintenance || {};


( function ( $, mw, fabric, ext_imageAnnotator_maintenance ) {

	ext_imageAnnotator_maintenance.maintenance = ext_imageAnnotator_maintenance.maintenance || {};

	// request to get all semantic data of a pagelist
	ext_imageAnnotator_maintenance.maintenance.processPageList = function (pages, callback) {
		var processPageList = this;
		this.callback = callback;

		var url = mw.config.get('wgArticlePath').replace('$1', "Special:ExportSemanticJson");

		this.pageDoneCounter = 0;

		console.log('get page list json data');

		var params = {
				pages: pages,
			};
		$.ajax({
			  url: url,
			  data: params
		}).done(function (data) {
			processPageList.processPageListCallback(data);
		});
	};

	ext_imageAnnotator_maintenance.maintenance.processPageList.prototype.processPageListCallback = function (data) {
		console.log("processPageList" );
		var processPageList = this;
		processPageList.nbPageToDo = data.results.length;
		data.results.forEach(function (item, index){
			new ext_imageAnnotator_maintenance.maintenance.processSemanticPage(item, function (success) {
				processPageList.pageDoneCallBack();
			});
		});
	}

	ext_imageAnnotator_maintenance.maintenance.processPageList.prototype.pageDoneCallBack = function (success){
		var processPageList = this;
		this.pageDoneCounter = this.pageDoneCounter + 1;
		console.log('nb page dones : ' + this.pageDoneCounter + ' / ' + processPageList.nbPageToDo);
		if (this.pageDoneCounter == processPageList.nbPageToDo) {
			this.callback(true);
		}
	}

})(jQuery, mediaWiki, fabric, ext_imageAnnotator_maintenance);

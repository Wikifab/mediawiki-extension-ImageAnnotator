<?php


namespace ImageAnnotator;

/**
 * model class to represent an annotated image
 *
 * @author Pierre Boutet
 */
class AnnotatedImage {

	protected $imageName;
	protected $annotatedContent;
	protected $file;
	protected $sourceImageUrl;

	public function __construct($image, $annotatedContent) {

		if (preg_match('/\[\[File:([^\|\]]+)(\|.*)?\]\]/',$image, $matches)) {
			$this->imageName = $matches[1];
		} else {
			$this->imageName = null;
			return;
		}
		$this->annotatedContent = $annotatedContent;
		$this->file = wfLocalFile(\Title::newFromDBkey('File:' . $this->imageName));
		if ($this->file ) {
			$this->sourceImageUrl = $this->file->getFullUrl();
		}
	}

	protected function getHash() {
		return md5($this->annotatedContent);
	}

	/**
	 *
	 * @param string $image full url of source image
	 * @return array
	 */
	protected function getImageInfo() {
		global $wgResourceBasePath;
		// TODO : use real repo url instead of wgRessouceBasePAth

		$image = $this->sourceImageUrl;

		$regexp1 = $wgResourceBasePath.'/images/([a-z0-9]+)/([a-z0-9]{2})/([^/]+)$';
		$regexp1 = str_replace('/','\/', $regexp1);
		$regexp2 = $wgResourceBasePath.'/images/thumb/([a-z0-9]+)/([a-z0-9]{2})/([^/]+)/([^/]+)$';
		$regexp2 = str_replace('/','\/', $regexp2);

		if (preg_match('/' . $regexp1 . '/', $image, $matches)) {
			// image original
			return [
					'imgUrl' => $image,
					'hashdir' => $matches[1] . '/' . $matches[2],
					'filename' => $matches[3]
			];
		} else if (preg_match('/' . $regexp2 . '/', $image, $matches)) {
			// image thumbs
			return [
					'imgUrl' => $image,
					'hashdir' => $matches[1] . '/' . $matches[2],
					'filename' => $matches[3],
					'thumbfilename' => $matches[4]
			];
		} else {
			return false;
		}
	}

	protected function getOutFilename ( ) {
		global $wgUploadDirectory, $wgResourceBasePath;

		$imageInfo = $this->getImageInfo();
		$hash = $this->getHash();

		$outfilename = 'ia-' . $hash ."-px-".$imageInfo['filename'] . '.png';

		$subFilePath = 'thumb/' . $imageInfo['hashdir']
		. '/' .  $imageInfo['filename']
		. '/' . $outfilename;
		$outfilepathname = $wgUploadDirectory .'/' . $subFilePath;
		$outfileurl = $wgResourceBasePath .'/images/' . $subFilePath;


		return [
				'filename' => $outfilename,
				'filepath' => $outfilepathname,
				'fileurl' => $outfileurl
		];
	}

	public function hasCroppedImage() {

		if (strpos($this->annotatedContent, '"type":"image",') !== false) {
			return true;
		} else {
			return false;
		}
	}
	public function exists() {
		if ($this->imageName) {
			$outimage = $this->getOutFilename();
			return file_exists($outimage['filepath']);
		}
		return false;
	}
	public function getImgUrl() {

		if ($this->imageName) {
			$r = $this->getOutFilename();
			return $r['fileurl'];
		}
	}
	public function getPageUrl() {

		return $this->getImgUrl();

		/*
		 * this wa to set link to image page, but not works well with mediaviewer
		if ($this->file) {
			return $this->file->getUrl();
		}*/
	}

	public function makeHtmlImageLink($parser) {
		$imgDim = '';

		// if dimention are set into annotated content, set it for multimediaviewer
		$jsonData = json_decode($this->annotatedContent);
		if ($jsonData && $jsonData->height && $jsonData->width) {
			$imgDim = ' data-file-width="'.$jsonData->width.'" data-file-height="'.$jsonData->height.'" ';
		}

		$out = '<img class="annotationlayer" ' . $imgDim  . ' src="'. $this->getImgUrl() . '"/>';
		$out = "<a class='image' href=". $this->getPageUrl() ." >$out</a>";
		/*
			'<a href="/wiki/Fichier:Test_de_tuto_LB_Final.jpg" class="image" title="annotation:Modèle:Main Picture annotation}"
			style="display: inline-block; position: relative;">
			<img alt="annotation:Modèle:Main Picture annotation}"
			src="/w/images/thumb/7/7a/Test_de_tuto_LB_Final.jpg/800px-Test_de_tuto_LB_Final.jpg"
			class="thumbborder"
			srcset="/w/images/7/7a/Test_de_tuto_LB_Final.jpg 1.5x"
			data-file-width="1200"
			data-file-height="900"
			width="800"
			height="600">
			<img class="annotationlayer" src="/w/images/thumb/7/7a/Test_de_tuto_LB_Final.jpg/ia-ceb9d8e5c28d6c7e7cb2e9e350aa3fa2-px-Test_de_tuto_LB_Final.jpg.png" style="width: 100%; position: absolute; top: 0px; left: 0px;">
			</a>';
			*/
		return $out;


	}

}

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
		$this->sourceImageUrl = $this->file->getFullUrl();
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
			return true;
		}
		return false;
	}
	public function getImgUrl() {

		if ($this->imageName) {
			$r = $this->getOutFilename();
			return $r['fileurl'];
		}
	}

}
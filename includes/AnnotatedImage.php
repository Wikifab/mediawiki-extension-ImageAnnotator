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
	protected $svgData;
	protected $file;
	protected $sourceImageUrl;
	protected $thumbFile;
	protected $thumbsFiles;

	public function __construct($image, $annotatedContent) {

		$this->thumbFile = null;

		//TODO : file and Fichier are hard code, set it to works with all language
		if (preg_match('/\[\[(File|Fichier):([^\|\]]+)(\|.*)?\]\]/',$image, $matches)) {
			$this->imageName = $matches[2];
		} else if(preg_match('/(File|Fichier):([^\|\]\[\\\{\}]+)$/',$image, $matches)) {
			$this->imageName = $matches[2];
		} else {
			$this->imageName = null;
			return;
		}

		$this->annotatedContent = $annotatedContent;

		$this->file = wfLocalFile(\Title::newFromDBkey('File:' . $this->imageName));
		if ($this->file ) {
			$this->sourceImageUrl = $this->file->getFullUrl();
		}

		if ($annotatedContent && substr($annotatedContent, 0,1) != '{' ){
			// if $annotatedContent is a hash, load from DB :
			$this->loadFromBdd($annotatedContent);
		} else if($annotatedContent) {
			$this->loadFromBdd(md5(trim($annotatedContent)));
		}
	}

	public function loadFromBdd($hash) {
		if( ! $hash) {
			$hash = md5($this->annotatedContent);
		}

		$list = array();
		$dbr = wfGetDB( DB_SLAVE );

		$this->thumbFile = null;

		if(!$this->file || ! $this->file->getTitle()) {
			trigger_error('source File is not defined in ImageAnnotation', E_USER_WARNING);
			return false;
		}

		$res = $dbr->select(
				'annotatedimages',
				array(
					'ai_filename',
					'ai_data_json',
					'ai_data_svg',
					'ai_thumbfile',
				),
				array(
						'ai_page_id' => $this->file->getTitle()->getArticleID(),
						'ai_hash' => $hash,
				),
				__METHOD__,
				array()
				);

		$pages = array();
		if ( $res->numRows() > 0 ) {
			foreach ( $res as $row ) {
				$this->imageName = $row->ai_filename;
				$this->annotatedContent = $row->ai_data_json;
				$this->svgData = $row->ai_data_svg;
				$this->file = wfLocalFile(\Title::newFromDBkey('File:' . $this->imageName));
				if ($this->file ) {
					$this->sourceImageUrl = $this->file->getFullUrl();
				} else {
					$this->sourceImageUrl = null;
				}
				$this->thumbFile = $row->ai_thumbfile;

				$res->free();
				return true;
			}
			$res->free();
		}
		return false;
	}

	protected function getHash() {
		return md5(trim($this->annotatedContent));
	}

	/**
	 *
	 * @param string $image full url of source image
	 * @return array
	 */
	protected function getImageInfo() {
		global $wgUploadPath;
		// TODO : use real repo url instead of wgRessouceBasePAth

		$image = $this->sourceImageUrl;

		$regexp1 = $wgUploadPath.'/([a-z0-9]+)/([a-z0-9]{2})/([^/]+)$';
		$regexp1 = str_replace('/','\/', $regexp1);
		$regexp2 = $wgUploadPath.'/thumb/([a-z0-9]+)/([a-z0-9]{2})/([^/]+)/([^/]+)$';
		$regexp2 = str_replace('/','\/', $regexp2);

		if (preg_match('/' . $regexp1 . '/', $image, $matches)) {
			// image original
			return [
					'imgUrl' => urldecode($image),
					'hashdir' => $matches[1] . '/' . $matches[2],
					'filename' => urldecode($matches[3])
			];
		} else if (preg_match('/' . $regexp2 . '/', $image, $matches)) {
			// image thumbs
			return [
					'imgUrl' => urldecode($image),
					'hashdir' => $matches[1] . '/' . $matches[2],
					'filename' => urldecode($matches[3]),
					'thumbfilename' => urldecode($matches[4])
			];
		} else {
			return false;
		}
	}

	protected function getOutFilename ($size = '' ) {
		global $wgUploadDirectory, $wgUploadPath;

		$imageInfo = $this->getImageInfo();
		$hash = $this->getHash();

		$outfilename = 'ia-' . $hash ."-".$size."px-".$imageInfo['filename'] . '.png';

		if ($this->thumbFile ) {
			$outfilename = basename($this->thumbFile);
			$subFilePath = $this->thumbFile;

			// insert size in filename :
			$pattern = '@^(thumb/[a-z0-9]/[a-z0-9]{2}/[^/]+)/ia-([a-z0-9]+)-px-(.*)$@';
			if (preg_match(''.$pattern.'', $subFilePath, $matches)) {
				$outfilename = "ia-{$matches[2]}-{$size}px-{$matches[3]}";
				$subFilePath = "{$matches[1]}/$outfilename";
			}

		} else {
			$subFilePath = 'thumb/' . $imageInfo['hashdir']
			. '/' .  $imageInfo['filename']
			. '/' . $outfilename;
		}
		$outfilepathname = $wgUploadDirectory .'/' . $subFilePath;
		$outfileurl = $wgUploadPath .'/' . $subFilePath;


		return [
				'filename' => $outfilename,
				'filepath' => $outfilepathname,
				'fileurl' => $outfileurl
		];
	}

	public function getAnnotatedContent() {
		return $this->annotatedContent;
	}
	public function getSvgData() {
		return $this->svgData;
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
	public function getSourceImgUrl() {

		if ($this->sourceImageUrl) {
			return $this->sourceImageUrl;
		}
	}
	public function getImgUrl() {

		if ($this->imageName) {
			$r = $this->getOutFilename();
			return $r['fileurl'];
		}
	}
	public function getImgThumbsUrl() {
		global $wgThumbLimits;

		$result = [];

		foreach ($wgThumbLimits as $size) {
			$r = $this->getOutFilename($size);
			if (!file_exists($r['filepath'])) {
				continue;
			}
			$result[] = [
					'size' => $size,
					'fileurl' => $r['fileurl']
			];
		}
		return $result;
	}
	public function getPageUrl() {

		// if there is thumb, we return the bigger one :
		$thumbs = $this->getImgThumbsUrl();
		if ($thumbs) {
			$thumb = array_pop($thumbs);
			return $thumb['fileurl'];
		}

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

		$out = '<img class="annotationlayer" style="filter: blur(5px)" ' . $imgDim  . ' src="'. $this->getImgUrl() . '"/>';
		$out = "<a class='image' href=\"". $this->getPageUrl() ."\" >$out</a>";

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

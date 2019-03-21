<?php

namespace ImageAnnotator;

/**
 * add fonctions to generate annotated image thumbs
 *
 * @author Pierre Boutet
 */
class ApiImageAnnotatorThumb extends \ApiBase {
	public function __construct($query, $moduleName) {
		parent::__construct ( $query, $moduleName );
	}
	public function getAllowedParams() {
		return array (
				'image' => array (
						\ApiBase::PARAM_TYPE => 'string',
						\ApiBase::PARAM_REQUIRED => true
				),
				'jsondata' => array (
						\ApiBase::PARAM_TYPE => 'string',
						\ApiBase::PARAM_REQUIRED => true
				),
				'svgdata' => array (
						\ApiBase::PARAM_TYPE => 'string',
						\ApiBase::PARAM_REQUIRED => false
				)
		);
	}
	public function getParamDescription() {
		return [ ];
	}
	public function getDescription() {
		return false;
	}

	/**
	 *
	 * @param string $image full url of source image
	 * @return array
	 */
	public  function getImageInfo($image) {
		global $wgUploadPath;
		// TODO : use real repo url instead of wgRessouceBasePAth

		$regexp1 = $wgUploadPath.'/([a-z0-9]+)/([a-z0-9]{2})/([^/]+)$';
		$regexp1 = str_replace('/','\/', $regexp1);
		$regexp2 = $wgUploadPath.'/thumb/([a-z0-9]+)/([a-z0-9]{2})/([^/]+)/([^/]+)$';
		$regexp2 = str_replace('/','\/', $regexp2);


		if (preg_match('/' . $regexp1 . '/', $image, $matches)) {
			// image original
			return [
					'imgUrl' => $image,
					'hashdir' => $matches[1] . '/' . $matches[2],
					'filename' => urldecode ($matches[3])
			];
		} else if (preg_match('/' . $regexp2 . '/', $image, $matches)) {
			// image thumbs
			$imgUrl = $wgUploadPath.'/'.$matches[1] . '/' . $matches[2].'/'.$matches[3];
			return [
					'imgUrl' => $imgUrl,
					'thumbUrl' => $image,
					'hashdir' => $matches[1] . '/' . $matches[2],
					'filename' => urldecode ($matches[3]),
					'thumbfilename' =>urldecode ( $matches[4])
			];
		} else {
			return false;
		}
	}

	/**
	 * @deprecated use class AnnotatedImage instead
	 *
	 * @param unknown $imageInfo
	 * @param unknown $size
	 * @param unknown $hash
	 * @return string[]
	 */
	protected function getOutFilename ($imageInfo, $size, $hash) {
		global $wgUploadDirectory, $wgUploadPath;
		$outfilename = 'ia-' . $hash ."-{$size}px-".$imageInfo['filename'] . '.png';

		$subFilePath = 'thumb/' . $imageInfo['hashdir']
				. '/' .  $imageInfo['filename']
				. '/' . $outfilename;
		$outfilepathname = $wgUploadDirectory .'/' . $subFilePath;
 		$outfileurl = $wgUploadPath .'/' . $subFilePath;


		return [
				'filename' => $outfilename,
				'relative_filepath' => $subFilePath,
				'filepath' => $outfilepathname,
				'fileurl' => $outfileurl
		];
	}


	public function correctSvgIncludedRessourcePathBeforeConversion($svg, $fileIncluded, $hash, $tmpDir, &$tempFiles) {
		global $wgUploadDirectory, $wgServer;

		// replace url encoded string of filename :
		$svg = str_replace(urlencode($fileIncluded['filename']), $fileIncluded['filename'], $svg);

		// replace ALL files url by relative filepath
		$filesToReplaces = [];
		$filesToReplaces[] = [
				'filename' => $fileIncluded['filename'],
				'url' => $wgServer . $fileIncluded['imgUrl'],
				'path' => $wgUploadDirectory . '/' . $fileIncluded['hashdir']. '/' .  $fileIncluded['filename']
		];
		$filesToReplaces[] = [
				'filename' => $fileIncluded['filename'],
				'url' => $fileIncluded['imgUrl'],
				'path' => $wgUploadDirectory . '/' . $fileIncluded['hashdir']. '/' .  $fileIncluded['filename']
		];
		if(isset($fileIncluded['thumbUrl']) && $fileIncluded['thumbUrl'] ) {

			$filesToReplaces[] = [
					'filename' => $fileIncluded['filename'],
					'url' => $wgServer .$fileIncluded['thumbUrl'],
					'path' => $wgUploadDirectory . '/' . $fileIncluded['hashdir']. '/' .  $fileIncluded['filename']
			];
			$filesToReplaces[] = [
					'filename' => $fileIncluded['filename'],
					'url' => $fileIncluded['thumbUrl'],
					'path' => $wgUploadDirectory . '/' . $fileIncluded['hashdir']. '/' .  $fileIncluded['filename']
			];
		}

		// get custom pictures :
		$customsPics = CustomsAnnotation::getCustomsPictures();

		foreach ($customsPics as $customsPic) {
			$file = wfFindFile($customsPic);

			$path = $wgUploadDirectory . '/' . $file->getHashPath() .  $file->getName();
			$filesToReplaces[] = [
					'filename' => $file->getName(),
					'url' => $file->getFullUrl(),
					'path' => $path
			];
		}

		$tempFiles = [];
		foreach ($filesToReplaces as $fileToReplace) {
			// replace file url by file's relative path :

			// if file path as a quote (') in it, it cause trouble during svg conversion
			// we must copy the file to a temp path without quote
			if (strpos($fileToReplace['path'], "'") !== false) {
				$tmpSourceFileName = $hash. '-' .  $fileToReplace['filename'];
				$tmpSourceFileName = str_replace("'", '_', $tmpSourceFileName);
				$tmpSourceFilePath = $tmpDir . "/" . $tmpSourceFileName;
				copy($fileToReplace['path'], $tmpSourceFilePath);
				$fileToReplace['path'] = $tmpSourceFilePath;
				$tempFiles[] = $tmpSourceFilePath;
			}
			if ($fileToReplace['url']) {
				// we should never have empty url, why this appends ?
				$svg = str_replace('"' . $fileToReplace['url'], '"' . $fileToReplace['path'], $svg);
			}
		}

		return $svg;

	}

	public function svgToPngConvert($svg, $fileIncluded, $fileOut, $hash) {
		global $wgUploadDirectory, $wgServer;

		/*
		$fileIncluded =
		[
			'imgUrl' =>	"http://demo-dokit.localtest.me/w/images/thumb/7/7a/Test_de_tuto_LB_Final.jpg/800px-Test_de_tuto_LB_Final.jpg"
			'thumbUrl' =>	"http://...." // if defined
			'hashdir' =>	"7/7a"
			'filename' =>	"Test_de_tuto_LB_Final.jpg"
			'thumbfilename' =>	"800px-Test_de_tuto_LB_Final.jpg"
		]
		*/

		$subDir = 'fel';

		$tmpDir = $wgUploadDirectory . '/imagesAnnotationTemp/' . $subDir;
		if (!file_exists($tmpDir)) {
			mkdir($tmpDir, 0755, true);
		}

		$tempFiles = [];

		$svg = $this->correctSvgIncludedRessourcePathBeforeConversion($svg, $fileIncluded, $hash, $tmpDir, $tempFiles);

		//create svg tmp file
		$svgInFile = $tmpDir . "/$hash.svg";
		file_put_contents($svgInFile, $svg);

		// convert to png :
		// TODO : determine png size according to request
		$width = 800;
		$cmd = "inkscape -z -f ". escapeshellarg ($svgInFile) ." -w $width --export-background-opacity=0,0 --export-png=". escapeshellarg ($fileOut) ."";

		if (!file_exists(dirname($fileOut))) {
			mkdir(dirname($fileOut), 0755, true);
		}

		exec($cmd, $output, $execCode);

		// for a strange reason, unlink trigger a warning saying that file doesn't exists
		// so add @ to hide this error
		@unlink($svgInFile);
		foreach ($tempFiles as $tempFile ) {
			unlink($tempFile);
		}

		if($execCode == 0) {
			// success
			return [
					'success' => true,
					'fileout' => $fileOut,
					$fileIncluded
			];
		}

		return [
				'success' => false,
				'message' => 'error while executing svg conversion command '
		];
	}

	public function execute() {
		global $wgServer;
		$params = $this->extractRequestParams ();
		$image = $params ['image'];
		$jsondata = $params ['jsondata'];
		$svgdata = $params['svgdata'];
		$size = '';

		$result = 'not implemented';


		if (substr($image,0,1) == '/') {
			// if image is a relative url, add the domain :
			$image = $wgServer . $image;
			// this should not occur if url is fully given into api params
		}

		// TODO : check in bdd if result already builded

		// TODO : get source image

		$imageInfo = $this->getImageInfo($image);
		/* exemple image info :
		[
			'imgUrl' =>	"http://demo-dokit.localtest.me/w/images/thumb/7/7a/Test_de_tuto_LB_Final.jpg/800px-Test_de_tuto_LB_Final.jpg"
			'hashdir' =>		"7/7a"
			'filename' =>		"Test_de_tuto_LB_Final.jpg"
			'thumbfilename' =>		"800px-Test_de_tuto_LB_Final.jpg"
		]
		*/

		// determine output filename
		$hash = md5($jsondata);
		$fileOutputPaths = $this->getOutFilename ($imageInfo, $size, $hash);

		$fileOut = $fileOutputPaths['filepath'];
		$fileUrl = $fileOutputPaths['fileurl'];
		$fileOutRelative = $fileOutputPaths['relative_filepath'];


		// TODO : convert svg to png
		$convertResult = $this->svgToPngConvert($svgdata, $imageInfo, $fileOut, $hash);


		// TODO : store result in bdd

		$r = [ ];
		if ($convertResult['success']) {
			$this->storeInDatabase($imageInfo['filename'], $hash, $jsondata, $svgdata, $fileOutRelative);
			$r ['success'] = 1;
			$r ['result'] = 'OK';
			$r ['image'] = $fileUrl;
			$r ['hash'] = $hash;
		} else {
			$r ['result'] = 'fail';
			$r ['details'] = $convertResult['message'];
		}

		$this->getResult ()->addValue ( null, $this->getModuleName (), $r );
	}

	public function storeInDatabase($fileName, $hash, $jsonData, $svgData, $thumbFile) {
		$dbw = wfGetDB( DB_MASTER );
		$rows = array();

		$title = \Title::newFromDBkey('File:'  . $fileName);

		$added = array();

		$rows = [
			'ai_page_id' => $title->getArticleID() ,
			'ai_filename' => $fileName,
			'ai_hash' => $hash,
			'ai_data_json' => $jsonData,
			'ai_data_svg' => $svgData,
			'ai_thumbfile' => $thumbFile,
		];

		$dbw->insert( 'annotatedimages', $rows, __METHOD__, 'IGNORE' );

	}



	public function needsToken() {
		return 'csrf';
	}
}
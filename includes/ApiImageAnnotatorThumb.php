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
	protected function getImageInfo($image) {
		global $wgResourceBasePath;
		// TODO : use real repo url instead of wgRessouceBasePAth

		$regexp1 = $wgResourceBasePath.'/images/([a-z0-9]+)/([a-z0-9]{2})/([^/]+)$';
		$regexp1 = str_replace('/','\/', $regexp1);
		$regexp2 = $wgResourceBasePath.'/images/thumb/([a-z0-9]+)/([a-z0-9]{2})/([^/]+)/([^/]+)$';
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
			return [
					'imgUrl' => $image,
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
		global $wgUploadDirectory, $wgResourceBasePath;
		$outfilename = 'ia-' . $hash ."-{$size}px-".$imageInfo['filename'] . '.png';

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

	public function svgToPngConvert($svg, $fileIncluded, $fileOut, $hash) {
		global $wgUploadDirectory;

		/*
		$fileIncluded =
		[
			'imgUrl' =>	"http://demo-dokit.localtest.me/w/images/thumb/7/7a/Test_de_tuto_LB_Final.jpg/800px-Test_de_tuto_LB_Final.jpg"
			'hashdir' =>	"7/7a"
			'filename' =>	"Test_de_tuto_LB_Final.jpg"
			'thumbfilename' =>	"800px-Test_de_tuto_LB_Final.jpg"
		]
		*/

		$subDir = 'fel';

		$tmpDir = $wgUploadDirectory . '/imagesAnnotationTemp/' . $subDir;
		mkdir($tmpDir, 0755, true);

		// replace url by relative filepath in svg data
		$url = $fileIncluded['imgUrl'];
		$relativeFileName = $wgUploadDirectory . '/' . $fileIncluded['hashdir']. '/' .  $fileIncluded['filename'];


		// TODO : if file path as a quote (') in it, it cause trouble during svg conversion
		// we must copy the file to a temp path without quote

		$useTempSourceImageFile = false;
		if (strpos($relativeFileName, "'") !== false) {
			$useTempSourceImageFile = true;
			$tmpSourceFileName = $hash. '-' .  $fileIncluded['filename'];
			$tmpSourceFileName = str_replace("'", '_', $tmpSourceFileName);
			$tmpSourceFilePath = $tmpDir . "/" . $tmpSourceFileName;
			copy($relativeFileName, $tmpSourceFilePath);
			$relativeFileName = $tmpSourceFilePath;
		}

		$svg = str_replace($url, $relativeFileName, $svg);

		//create svg tmp file
		$svgInFile = $tmpDir . "/$hash.svg";
		file_put_contents($svgInFile, $svg);

		// convert to png :
		// TODO : determine png size according to request
		$width = 800;
		$cmd = "inkscape -z -f '$svgInFile' -w $width --export-background-opacity=0,0 --export-png='$fileOut'";


		mkdir(dirname($fileOut), 0755, true);

		exec($cmd, $output, $execCode);

		unlink($svgInFile);
		if($useTempSourceImageFile) {
			unlink($tmpSourceFilePath);
		}

		if($execCode == 0) {
			// success
			return [
					'success' => true,
					'fileout' => $outFile,
					$fileIncluded
			];
		}

		return [
				'success' => false,
				'message' => 'error while executing svg conversion command '
		];
	}

	public function execute() {
		$params = $this->extractRequestParams ();
		$image = $params ['image'];
		$jsondata = $params ['jsondata'];
		$svgdata = $params['svgdata'];

		$result = 'not implemented';

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

		// TODO : convert svg to png
		$convertResult = $this->svgToPngConvert($svgdata, $imageInfo, $fileOut, $hash);


		// TODO : store result in bdd

		$r = [ ];
		if ($convertResult['success']) {
			$r ['success'] = 1;
			$r ['result'] = 'OK';
			$r ['image'] = $fileUrl;
		} else {
			$r ['result'] = 'fail';
			$r ['details'] = $convertResult['message'];
		}

		$this->getResult ()->addValue ( null, $this->getModuleName (), $r );
	}
	public function needsToken() {
		return 'csrf';
	}
}
<?php
namespace ImageAnnotator;

class Hooks {


	public static function onRegistration() {
	}

	public static function initialize() {
		global $wgPageFormsFormPrinter;
		$wgPageFormsFormPrinter->setInputTypeHook('editableImage', 'ImageAnnotator\InputEditableImage', array());
	}


	public static function annotatedImageParser( $input, $image, $annotatedContent) {
		global $wgOut;

		// add module for display annotations
		$wgOut->addModules( [
				'ext.imageannotator.editor'
		] );


		$useBackendGeneration = true;

		if ($useBackendGeneration  ) {
			// using backend generation (for image including cropped images)
			// image must have been generated before (during edition)
			$annotatedImage = new AnnotatedImage($image, $annotatedContent);
			if ($annotatedImage->exists()) {
				$out = '<div><img src="' . $annotatedImage->getImgUrl() . '"/> </div>';
				$out = $annotatedImage->makeHtmlImageLink($input);
				return array( $out, 'noparse' => true, 'isHTML' => true );
			} else {
				// if image doesn't exists, fallback on default behaviour
				// if has cropped image,us svg default behaviour because there is no image behind transparency
				$out = '<div class="annotatedImageContainer">' . $image
				. '<div class="annotatedcontent" data-annotatedcontent=\''.$annotatedContent.'\'> </div></div>';
				return $out;
			}
			return array( $out, 'noparse' => true, 'isHTML' => true );

		} else {
			// using js frontside generation :
			$out = '<div class="annotatedImageContainer">' . $image
				. '<div class="annotatedcontent" data-annotatedcontent=\''.$annotatedContent.'\'> </div></div>';
			return $out;
		}
	}

	/**
	 * initialize JavaScript
	 *
	 * @param OutputPage $output the OutputPage object
	 */
	private static function initJS( $output ) {

		global $wgImageAnnotatorColors;

		$imageAnnotatorParams = [];

		if (isset($wgImageAnnotatorColors) && $wgImageAnnotatorColors)
			$imageAnnotatorParams['imageAnnotatorColors'] = $wgImageAnnotatorColors;

		$output->addJsConfigVars( 'ImageAnnotator', $imageAnnotatorParams );
		$output->addModules( 'ext.imageannotator.editor' );
	}

	public static function onBeforePageDisplay( &$oOutputPage, &$oSkin ) {

		self::initJS( $oOutputPage );

		return true;
	}


	public static function onParserFirstCallInit($parser) {

		$parser->setFunctionHook( 'annotatedImage', array('ImageAnnotator\\Hooks', 'annotatedImageParser' ));
	}

	public static function start() {
		global $wgOut;

		// add module for image edition
		$wgOut->addModules( [
				'ext.imageannotator.editor'
		] );
	}

	/**
	 * recursive function to add annotated img url in an array,
	 * for each key '*_annotation'
	 *
	 * @param array $data
	 */
	private static function addAnnotatedImageInData(&$data) {
		foreach ($data as $key => $value) {
			if (is_array($value)) {
				self::addAnnotatedImageInData($data[$key]);
			} else {
				if (preg_match('/_annotation$/', $key) && $value) {
					// add annotatedImageurl :
					$sourceImgKey = str_replace('_annotation', '', $key);
					if(isset($data[$sourceImgKey])) {
						$sourceImg = $data[$sourceImgKey];
						$image = "[[File:" . $sourceImg ."]]";
						$annotatedImage = new AnnotatedImage($image, $value);
						$data[$sourceImgKey . '_annotatedImageUrl'] = $annotatedImage->getImgUrl();
					}
				}
			}
		}
	}

	public static function onSemanticJsonExportBeforeSerializePage($title, &$data) {

		self::addAnnotatedImageInData($data);
	}
}
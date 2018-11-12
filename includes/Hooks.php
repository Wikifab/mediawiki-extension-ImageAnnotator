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
			if ($annotatedImage->exists() && $annotatedImage->hasCroppedImage()) {
				$out = '<div><img src="' . $annotatedImage->getImgUrl() . '"/> </div>';
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


	public static function onBeforePageDisplay( &$oOutputPage, &$oSkin ) {
		$oOutputPage->addModules( 'ext.imageannotator.editor' );
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
}
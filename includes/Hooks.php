<?php
namespace ImageAnnotator;

class Hooks {


	public static function onRegistration() {
	}

	public static function initialize() {
		global $wgPageFormsFormPrinter;
		$wgPageFormsFormPrinter->setInputTypeHook('editableImage', 'ImageAnnotator\InputEditableImage::editableImageOverlayInput', array());
	}


	public static function annotatedImageParser( $input, $image, $annotatedContent) {
		global $wgOut;

		// add module for display annotations
		$wgOut->addModules( [
				'ext.imageannotator.editor'
		] );

		$out = '<div class="annotatedImageContainer">' . $image
			. '<div class="annotatedcontent" data-annotatedcontent=\''.$annotatedContent.'\'> </div></div>';

		return $out;
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
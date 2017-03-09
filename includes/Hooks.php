<?php
namespace ImageAnnotator;

class Hooks {


	public static function onRegistration() {
	}

	public static function initialize() {
		global $wgPageFormsFormPrinter;
		$wgPageFormsFormPrinter->setInputTypeHook('editableImage', 'ImageAnnotator\InputEditableImage::editableImageOverlayInput', array());
	}

	public static function start() {
		global $wgOut;

		$wgOut->addModules( [
				'ext.imageannotator.editor'
		] );
	}
}
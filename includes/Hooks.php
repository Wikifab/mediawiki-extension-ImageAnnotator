<?php
namespace ImageAnnotator;

class Hooks {


	public static function onRegistration() {
	}

	public static function initialize() {
		global $wgPageFormsFormPrinter;
		$wgPageFormsFormPrinter->setInputTypeHook('editableImage', 'ImageAnnotator\InputEditableImage', array());
	}


	/**
	 * first verison of the parsing function :
	 * the function use 2 param : the html image (generated with [[File:...]] ) and the jsonannotation
	 * @param unknown $input
	 * @param unknown $image
	 * @param unknown $annotatedContent
	 * @return boolean[]|string[]|string
	 */
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
	 * 2nd version of the parsing function :
	 * the function use 2 param :
	 * - the image name
	 * -  the jsonannotation
	 *
	 * @param Parser $input
	 * @param unknown $image
	 * @param unknown $annotatedContent
	 * @return boolean[]|string[]|string
	 */
	public static function annotatedImageLightParser( $input, $image ) {

		$annotatedContent = '';
		$hash = null;
		$args = func_get_args();
		array_shift($args);
		// we add 'frameless' option, to be default
		//array_unshift($args, 'frameless');
		array_unshift($args, 'link=');

		foreach ($args as $arg) {
			if (substr($arg, 0,5) == 'hash:') {
				$hash = substr($arg, 5);
			} else if (substr($arg, 0,5) == 'hash=') {
				$hash = substr($arg, 5);
			} else if (substr($arg, 0,9) == 'jsondata=') {
				$annotatedContent = substr($arg, 9);
			} else if (substr($arg, 0,9) == 'jsondata:') {
				$annotatedContent = substr($arg, 9);
			}
		}

		// image must have been generated before (during edition)
		if ($hash) {
			$annotatedImage = new AnnotatedImage($image, $hash);
			$annotatedContent = $annotatedImage->getAnnotatedContent();
		} else {
			$annotatedImage = new AnnotatedImage($image, $annotatedContent);
		}

		$caption = null;

		foreach ($args as $key => $arg) {

			$exploded = explode('=', $arg);
			if (is_numeric($exploded[0])) {
				$args[$key] = str_replace($exploded[0] . '=', '', $arg);
			}

			if (strpos($arg, 'align=') !== false) {
				$args[$key] = str_replace('align=', '', $arg);
			}
			if (strpos($arg, 'type=') !== false) {
				$args[$key] = str_replace('type=', '', $arg);
			}
			if (strpos($arg, 'caption=') !== false) {
				$caption = str_replace('caption=', '', $arg);
			}
		}

		if (! $annotatedImage->exists() && ! $annotatedContent) {

			$fileTitle = \Title::newFromText($image, NS_FILE);
			$file = wfFindFile( $fileTitle );
			$srcImgUrl = $file->getFullUrl();;
			$imageOptions = implode('|',$args);
			if($caption !== null) {
				$imageOptions .= '|' . $caption;
			}

			$html = $input->makeImage( $fileTitle , $imageOptions);

			$imgWrapper = '<span >'.$html.'</span>';
			$out = '<div class="annotatedImageDiv" typeof="Image" data-resource="'.$image.'" data-sourceimage="'.addslashes($srcImgUrl).'">'.$imgWrapper.'</div>';
			//$out = $annotatedImage->makeHtmlImageLink($input);
			//return array( $out, 'isHTML' => true );
			return array( $out, 'noparse' => true, 'isHTML' => true );
		}

		//var_dump($annotatedImage->exists());
		if ($annotatedImage->exists()) {
			$fileTitle = \Title::newFromText($image, NS_FILE);
			$file = wfFindFile( $fileTitle );
			$srcImgUrl = $file->getFullUrl();;
			$imageOptions = implode('|',$args);
			if($caption !== null) {
				$imageOptions .= '|' . $caption;
			}
			$srcImgUrl = $annotatedImage->getSourceImgUrl();
			// TODO : add element such ass title, alt, caption, align, width, height, class...
			$attributs = ' ';
			$sourceImgElement = $input->makeImage( $fileTitle , $imageOptions);

			// replace img source by img annotated image :
			$imgElement = preg_replace('@src="([^"]+)"@', 'src="'.$annotatedImage->getImgUrl() . '"', $sourceImgElement);

			//$imgElement = '<img src="' . $annotatedImage->getImgUrl() . '"  data-jsondata=\''. str_replace("'","\\'",$annotatedContent) .'\' />';
			$imgWrapper = '<span >'.$imgElement.'</span>';
			$out = '<div class="annotatedImageDiv" typeof="Image" data-resource="'.$image.'" data-sourceimage="'.addslashes($srcImgUrl).'">'.$imgWrapper.'</div>';
			//$out = $annotatedImage->makeHtmlImageLink($input);
			//return array( $out, 'isHTML' => true );
			return array( $out, 'noparse' => true, 'isHTML' => true );
		} else {
			//var_dump($annotatedImage->getOutFilename());
			//var_dump($annotatedImage);
			// if image doesn't exists, fallback on default behaviour
			// if has cropped image,us svg default behaviour because there is no image behind transparency
			$out = '<div class="annotatedImageContainer">missing file</div>';
			return $out;
		}
	}

	public static function onBeforePageDisplay( &$oOutputPage, &$oSkin ) {
		$oOutputPage->addModules( 'ext.imageannotator.editor' );
		return true;
	}


	public static function onLoadExtensionSchemaUpdates( \DatabaseUpdater $updater ) {

		$updater->addExtensionTable( 'annotatedimages',
				__DIR__ . '/../sql/table.sql' );

		return true;
	}


	public static function onParserFirstCallInit($parser) {

		$parser->setFunctionHook( 'annotatedImage', array('ImageAnnotator\\Hooks', 'annotatedImageParser' ));
		$parser->setFunctionHook( 'annotatedImageLight', array('ImageAnnotator\\Hooks', 'annotatedImageLightParser' ));
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
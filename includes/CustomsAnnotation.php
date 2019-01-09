<?php


namespace ImageAnnotator;

use Revision;
use Title;
use WikiPage;

/**
 * class to get custom picture which can be included in annotated images
 *
 * @author Pierre Boutet
 */
class CustomsAnnotation {

	static $result = false;

	private static function getCustomsPictureFromContent($content) {

		$fieldName = 'CustomImage';

		$pattern = "/\|".$fieldName."\=([^\|\}]*)/s";
		preg_match_all($pattern, $content, $matches);

		if($matches) {
			return array_map('rtrim',$matches[1]);
		}
		return [];
	}

	public static function getCustomsPictures() {

		if (self::$result !== false) {
			// even if no cache, result can be stored to avoid multiple requests
			return self::$result;
		}
		// TODO : use Cache

		// page where is stored all custom annotations :
		$pageName ='CustomImages';

		// get Page Data :
		$pageTitle = Title::newFromDBkey($pageName);
		$wikiPage = new WikiPage($pageTitle);
		$revision = $wikiPage->getRevision();
		if ( $revision) {
			$content = $revision->getContent(Revision::RAW)->getNativeData();
		} else {
			$content = null;
		}

		if( ! $content) {
			self::$result = [];
		} else {
			// get customs pictures names from page data
			self::$result = self::getCustomsPictureFromContent($content);
		}

		return self::$result;
	}
}

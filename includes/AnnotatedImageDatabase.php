<?php


namespace ImageAnnotator;

/**
 * class to manage read/write in DB
 *
 * @author Pierre Boutet
 */
class AnnotatedImageDatabase {

	/**
	 * @var AnnotatedImageDatabase
	 */
	static private $instance = null;

	/**
	 * @return AnnotatedImageDatabase
	 */
	public static function getInstance() {
		if (! self::$instance) {
			self::$instance = new AnnotatedImageDatabase();
		}
		return self::$instance;
	}


	public function getByFileHashSize($filename, $hash, $size = 600) {
		$dbw = wfGetDB( DB_MASTER );
		$fields = [
				'ai_id',
				'ai_image_page_id',
				'ai_image_name',
				'ai_hash',
				'ai_data_json',
				'ai_data_svg',
				'ai_size',
				'ai_created',
				'ai_job_queued',
				'ai_job_end',
				'ai_is_generated'
		];
		$conds = [
				'ai_image_name' => $filename,
				'ai_hash' => $hash,
				'ai_size' => $size
		];

		$rows = $dbw->select( 'annotatedimages', $fields, $conds);
		foreach ($rows as $row) {
			return $row;
		}
		return null;
	}


	public function insertNew( AnnotatedImage $annotatedImage, $svgData ) {
		$dbw = wfGetDB( DB_MASTER );
		$rows = array();

		$added = array();

		$now = $dbw->timestamp(wfTimestampNow());

		$row = [];
		$row['ai_image_page_id']  = $annotatedImage->getImageTitle()->getArticleID();
		$row['ai_image_name'] = $annotatedImage->getImageName();
		$row['ai_hash'] = $annotatedImage->getHash();
		$row['ai_data_json'] = $annotatedImage->getJsonAnnotatedContent();
		$row['ai_data_svg'] = $svgData;
		$row['ai_size'] =$annotatedImage->getSize() ;
		$row['ai_created'] = $now;
		//$row['ai_job_queued'] =;
		//$row['ai_job_end'] =;
		//$row['ai_is_generated'] =;

		$added = $dbw->insert( 'annotatedimages', [$row], __METHOD__, 'IGNORE' );
		return $added;
	}

	public function markGenerated($ai) {

		$id = $ai->ai_id;
		if (! $id) {
			trigger_error(E_USER_WARNING, 'id undefined');
			return false;
		}
		$dbw = wfGetDB( DB_MASTER );
		$now = $dbw->timestamp(wfTimestampNow());
		$values = [
				'ai_job_end' => $now,
				'ai_is_generated' => 1
		];
		$conds = [
				'ai_id' => $id,
		];

		return $dbw->update( 'annotatedimages', $values, $conds);
	}
}
<?php


namespace ImageAnnotator\Maintenance;

use ImageAnnotator\ApiImageAnnotatorThumb;
use ImageAnnotator\AnnotatedImage;


$basePath = getenv( 'MW_INSTALL_PATH' ) !== false ? getenv( 'MW_INSTALL_PATH' ) : __DIR__ . '/../../..';

require_once $basePath . '/maintenance/Maintenance.php';

/**
 * Recreates all the annotated images, in all dimensions defined in $wgThumbLimits
 *
 * @author Pierre Boutet
 */
class GenerateAnnotatedImages extends \Maintenance {

	public function __construct() {
		parent::__construct();

		$this->addDescription( "\n" .
			"Recreates all annotated images, by cycling through all \n" .
			"image recorded in the annotated image table. \n"
		);

		$this->addOption( 'v', 'Be verbose about the progress', false );
		$this->addOption( 's', '<startid> start generating at given image id', false );
	}


	/**
	 * @see Maintenance::execute
	 */
	public function execute() {

		global $wgUploadDirectory, $wgThumbLimits;

		if ( $this->hasOption( 'v' ) ) {
			$this->output( "rebuild all annotaged image ...\n" );
		}

		$dbr = wfGetDB( DB_SLAVE );

		$res = $dbr->select(
				'annotatedimages',
				array(
						'ai_page_id',
						'ai_hash',
						'ai_filename',
						'ai_data_json',
						'ai_data_svg',
						'ai_thumbfile',
				),
				array(
				//		'ai_page_id' => $this->file->getTitle()->getArticleID(),
				//		'ai_hash' => $hash,
				),
				__METHOD__,
				array()
				);

		$pages = array();

		$totalCount = $res->numRows();
		$this->output( "Nb Image To build :" . $totalCount . "\n");

		$this->apiClass = new ApiImageAnnotatorThumb(new \ApiMain(), 'ApiImageAnnotatorThumb');

		$i = 0;
		$successCount = 0;
		$errorCount = 0;
		$existsCount = 0;
		if ( $res->numRows() > 0 ) {
			foreach ( $res as $row ) {
				$i++;
				if($i%10 == 0) {
					$this->output( "... $i / $totalCount \n");
				}
				//$this->output( $row->ai_filename . "\n");

				// build title and url of source image :

				$file = wfFindFile($row->ai_filename);
				$svgData = $row->ai_data_svg;

				if (!$svgData) {
					$errorCount ++;
					$this->output( "svgData empty \n");
					continue;
				}
				if (!$file) {
					$errorCount ++;
					$this->output( "File not found : {$row->ai_filename} \n");
					continue;
				}
				$image = $file->getFullUrl();
				$imageInfo = $this->apiClass->getImageInfo($image);

				$annotatedImage = new AnnotatedImage("[[File:{$row->ai_filename}]]", $row->ai_data_json);

				$hash = $annotatedImage->getHash();

				ob_start();
				$result = $this->generateFile($annotatedImage, $svgData, '', $imageInfo);
				ob_end_clean();

				if ($result === -1) {
					$existsCount ++;
				} else if (! $result) {
					$errorCount ++;
					$this->output( "Fail to generate image : {$result['message']} \n");
				} else {
					$successCount ++;
				}


				if ($wgThumbLimits) {
					foreach ($wgThumbLimits as $width) {
						$result = $this->generateFile($annotatedImage, $svgData, $width, $imageInfo);

						if ($result === -1) {
							$existsCount ++;
						} else if (! $result) {
							$errorCount ++;
						} else {
							$successCount++;
						}
					}
				}
			}
			$res->free();
		}
		$this->output( "\n Image generated : $successCount \n errors : $errorCount\n");
		$this->output( "allready exists : $existsCount\n");

		return true;
	}

	protected function generateFile($annotatedImage, $svgData, $width, $imageInfo) {


		$hash = $annotatedImage->getHash();

		$fileOutputPaths = $annotatedImage->getOutFilename ($width);
		$fileOut = $fileOutputPaths['filepath'];


		if(file_exists($fileOut)) {
			return -1;
		}

		$width = $width ? $width : 600;

		$result = $this->apiClass->svgToPngConvert($svgData, $width, $imageInfo, $fileOut, $hash);

		if (! $result["success"]) {
			$this->output( "Fail to generate image : {$result['message']} \n");
			return false;
		} else {
			return true;
		}

	}

}

$maintClass = 'ImageAnnotator\Maintenance\GenerateAnnotatedImages';
require_once ( RUN_MAINTENANCE_IF_MAIN );

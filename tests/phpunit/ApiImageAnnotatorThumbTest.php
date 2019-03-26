<?php

namespace ImageAnnotator\Tests;

use ImageAnnotator\ApiImageAnnotatorThumb;

/**
 * @uses \Bootstrap\BootstrapManager
 *
 * @ingroup Test
 *
 * @group extension-bootstrap
 * @group mediawiki-databaseless
 *
 * @license GNU GPL v3+
 * @since 1.0
 *
 * @author mwjames
 */
class HooksTest extends \PHPUnit_Framework_TestCase {

	protected $wgResourceModules = null;
	protected $wgLang = null;

	protected  $instance = null;

	protected function setUp() {
		parent::setUp();

		$apiMain = new \ApiMain();

		$subDir = 'fel';

		$this->wgUploadDirectory = $GLOBALS['wgUploadDirectory'];
		$this->wgServer = $GLOBALS['wgServer'];

		$GLOBALS['wgUploadDirectory'] = dirname(__DIR__,4) . '/images';
		$GLOBALS['wgServer'] = 'http://demo-dokit.localtest.me';

		$this->tmpDir = $GLOBALS['wgUploadDirectory'] . '/imagesAnnotationTemp/' . $subDir;

		$this->instance = new ApiImageAnnotatorThumb($apiMain, 'iaThumbs');
	}

	protected function tearDown() {

		// set back to initial Value :
		$GLOBALS['wgUploadDirectory'] = $this->wgUploadDirectory;
		$GLOBALS['wgServer'] = $this->wgServer;

		parent::tearDown();
	}


	public function testOne( ) {

		$targetContent = "Toto";

		$expectedContent = "Toto";

		$this->assertEquals($expectedContent, $targetContent);

	}

	public function testcorrectSvgIncludedRessourceQuoted( ) {
		global $wgUploadDirectory;
		global $wgServer;

		$tmpDir = $this->tmpDir;

		$svgIn = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="600" height="338" viewBox="0 0 600 338" xml:space="preserve">
<desc>Created with Fabric.js 2.4.1</desc>
<defs>
</defs>
<g transform="translate(300 168.75) scale(0.75 0.75)">
	<image xlink:href="' . $wgServer . '/w/images/thumb/2/2b/Remplacer_la_cassette_d%27un_v%C3%A9lo_Step_05a.jpg/800px-Remplacer_la_cassette_d%27un_v%C3%A9lo_Step_05a.jpg" x="-400" y="-225" style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" width="800" height="450"></image>
</g>
<polyline points="0,-45 0,45 -5,35 0,45 5,35 " style="stroke: rgb(255,0,0); stroke-width: 2.26; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,0,0); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" transform="translate(45.26 173.44) rotate(21.31) scale(1.48 1.18) "/>
</svg>';


		$fileIncluded =
		[
				'imgUrl' =>	"http://demo-dokit.localtest.me/w/images/thumb/2/2b/Remplacer_la_cassette_d'un_vélo_Step_05a.jpg/800px-Remplacer_la_cassette_d'un_vélo_Step_05a.jpg",
				'thumbUrl' =>	"http://demo-dokit.localtest.me/w/images/thumb/2/2b/Remplacer_la_cassette_d'un_vélo_Step_05a.jpg/800px-Remplacer_la_cassette_d'un_vélo_Step_05a.jpg", // if defined
				'hashdir' =>	"2/2b",
				'filename' =>	"Remplacer_la_cassette_d'un_vélo_Step_05a.jpg",
				'thumbfilename' =>	"800px-Remplacer_la_cassette_d'un_vélo_Step_05a.jpg"
		];

		$hash = md5($svgIn);
		$tempFiles = [];
		$svgCorrected = $this->instance->correctSvgIncludedRessourcePathBeforeConversion($svgIn, $fileIncluded, $hash, $tmpDir, $tempFiles);

		$replacedFile = $tempFiles[0];
		$svgExpected = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="600" height="338" viewBox="0 0 600 338" xml:space="preserve">
<desc>Created with Fabric.js 2.4.1</desc>
<defs>
</defs>
<g transform="translate(300 168.75) scale(0.75 0.75)">
	<image xlink:href="' . $replacedFile . '" x="-400" y="-225" style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" width="800" height="450"></image>
</g>
<polyline points="0,-45 0,45 -5,35 0,45 5,35 " style="stroke: rgb(255,0,0); stroke-width: 2.26; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,0,0); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" transform="translate(45.26 173.44) rotate(21.31) scale(1.48 1.18) "/>
</svg>';
		$this->assertEquals($svgExpected, $svgCorrected);

	}

	public function testcorrectSvgIncludedRessourceNonQuoted( ) {
		global $wgUploadDirectory;
		global $wgServer;

		$svgIn = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="600" height="338" viewBox="0 0 600 338" xml:space="preserve">
<desc>Created with Fabric.js 2.4.1</desc>
<defs>
</defs>
<g transform="translate(300 168.75) scale(0.75 0.75)">
	<image xlink:href="' . $wgServer . '/w/images/thumb/2/2b/Remplacer_la_cassette_v%C3%A9lo_Step_05a.jpg/800px-Remplacer_la_cassette_v%C3%A9lo_Step_05a.jpg" x="-400" y="-225" style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" width="800" height="450"></image>
</g>
<polyline points="0,-45 0,45 -5,35 0,45 5,35 " style="stroke: rgb(255,0,0); stroke-width: 2.26; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,0,0); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" transform="translate(45.26 173.44) rotate(21.31) scale(1.48 1.18) "/>
</svg>';

		$svgExpected = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="600" height="338" viewBox="0 0 600 338" xml:space="preserve">
<desc>Created with Fabric.js 2.4.1</desc>
<defs>
</defs>
<g transform="translate(300 168.75) scale(0.75 0.75)">
	<image xlink:href="'.$wgUploadDirectory.'/2/2b/Remplacer_la_cassette_vélo_Step_05a.jpg" x="-400" y="-225" style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" width="800" height="450"></image>
</g>
<polyline points="0,-45 0,45 -5,35 0,45 5,35 " style="stroke: rgb(255,0,0); stroke-width: 2.26; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,0,0); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" transform="translate(45.26 173.44) rotate(21.31) scale(1.48 1.18) "/>
</svg>';

		$fileIncluded =
		[
				'imgUrl' =>	"http://demo-dokit.localtest.me/w/images/thumb/2/2b/Remplacer_la_cassette_vélo_Step_05a.jpg/800px-Remplacer_la_cassette_vélo_Step_05a.jpg",
				'thumbUrl' =>	"http://demo-dokit.localtest.me/w/images/thumb/2/2b/Remplacer_la_cassette_vélo_Step_05a.jpg/800px-Remplacer_la_cassette_vélo_Step_05a.jpg", // if defined
				'hashdir' =>	"2/2b",
				'filename' =>	"Remplacer_la_cassette_vélo_Step_05a.jpg",
				'thumbfilename' =>	"800px-Remplacer_la_cassette_vélo_Step_05a.jpg"
		];

		$hash = md5($svgIn);
		$tmpDir = $this->tmpDir;
		$tempFiles = [];
		$svgCorrected = $this->instance->correctSvgIncludedRessourcePathBeforeConversion($svgIn, $fileIncluded, $hash, $tmpDir, $tempFiles);

		$this->assertEquals($svgExpected, $svgCorrected);

	}

}

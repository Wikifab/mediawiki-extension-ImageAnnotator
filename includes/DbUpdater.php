<?php

namespace ImageAnnotator;

use DatabaseUpdater;

/**
 * class to update database
 *
 * @author Pierre Boutet
 */
class DbUpdater {
	static function dbUpdate( DatabaseUpdater $updater ) {
		$updater->addExtensionTable( 'annotatedimages', __DIR__ . '/db/table.sql', true );
	}
}
<?php

namespace ImageAnnotator;

use SpecialPage;
use ErrorPageError;

class SpecialAnnotatedImageMaintenance extends SpecialPage{

    protected $categories;

    public function __construct() {
        parent::__construct("AnnotatedImageMaintenance");
    }

    /**
     * @param null|string $par
     * @throws ErrorPageError
     */
    public function execute($par ) {
        $this->setHeaders();
        $this->outputHeader();

        // Check permissions first
        $this->checkPermissions();

        $out = $this->getOutput();
        $out->addModules(['ext.imageannotator.maintenance']);

        $out->addHTML('<div><button id="ia-start-regeneration">Start semantic annotated</button>');
        $out->addHTML('<div><button id="ia-continue-regeneration">Continue after bug</button></div>');
        $out->addHTML('<div><button id="ia-continue-pageparsing">Continue PAge Parsing</button></div>');
        $out->addHTML('<div><input id="ia-force-regeneration" type=checkbox >Force regeneration of images</input></div>');
        $out->addHTML('<div><input id="ia-regeneration-semantic" type=checkbox checked="check" >regenerate semantic annotated images</input></div>');
        $out->addHTML('<div><input id="ia-regeneration-vepage" type=checkbox checked="check" >regenerate annotated images in VE</input></div>');
        $out->addHTML('<div id="ia-regenerationoutput"></div>');
    }


    /**
     * Prevent access to this page
     * @throws ErrorPageError
     */
    public function checkPermissions()
    {
        $user = $this->getUser();

        // Check permissions
        if (!$user->isAllowed('annotated-image-maintenance')) {
            throw new ErrorPageError('error', 'badaccess');
        }
    }

}
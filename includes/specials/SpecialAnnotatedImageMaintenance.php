<?php

namespace ImageAnnotator;

use SpecialPage;

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

        $out->addHTML('<button id="ia-start-regeneration">Start</button>');
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
        /*if (!$user->isAllowed('usecategorymanager')) {
            throw new ErrorPageError(
                'categorymanager-permissions-accessdenied-title',
                'categorymanager-permissions-accessdenied-content'
            );
        }*/
    }

}
<?php


namespace ImageAnnotator;

class InputEditableImage extends \PFFormInput {

	public static function getName() {
		return 'editableImage';
	}
	/**
	 * Returns the HTML code to be included in the output page for this input.
	 */
	public function getHtmlText() {
		return self::getHTML(
				$this->mCurrentValue,
				$this->mInputName,
				$this->mIsMandatory,
				$this->mIsDisabled,
				$this->mOtherArgs
				);
	}

	/**
	 * find target html input Name
	 *
	 * @param string $curInputName
	 * @param string $targetName
	 * @return string
	 */
	private static function getTargetInputName($curInputName, $target) {
		// we got something like :
		// $target =  "Main_Picture"
		// $curInputName = "Tuto Details[Main_Picture_editable]"

		// we must find target input name, which is : "Tuto Details[Main_Picture]"

		if (preg_match('/^.*\[([^\[\]]+)\]$/', $curInputName, $matches)) {
			$result = str_replace($matches[1], $target, $curInputName);
		} else {
			$result = $target;
		}
		return $result;
	}

	/**
	 *
	 * hook function to define a new input in PageForms, to add overlays on an image
	 *
	 * @param string $cur_value The actual value of input
	 * @param string $input_name The html input name
	 * @param boolean $is_mandatory	True if user must fill the input
	 * @param boolean $is_disabled if true, input is disabled
	 * @param unknown $field_args others args
	 */
	public static function getHTML( $cur_value, $input_name, $is_mandatory, $is_disabled, $field_args ) {
	//public static function editableImageOverlayInput($cur_value, $input_name, $is_mandatory, $is_disabled, $field_args) {


		$target = isset($field_args['target']) ? $field_args['target'] :'';

		$targetInputName = self::getTargetInputName($input_name, $target);

		$inputAttrs = [
				'class' => 'editableImageDataInput',
				'data-target' => $target,
				'data-targetName' => $targetInputName
		];
		$text = \Html::input( $input_name, $cur_value, 'hidden', $inputAttrs );

		$text .= self::getCustomPicsHtml();

		return $text;

	}

	public static function getCustomPicsHtml() {

		$customsPics = CustomsAnnotation::getCustomsPictures();

		$r = "<div class='ia-custompics-container' style='display:none;'>\n";

		foreach ($customsPics as $picName) {
			$idName = preg_replace('/[^a-zA-Z0-9]+/', '-', $picName);
			$classname = 'ia-custompics-' . $idName;
			$imageObj = wfFindFile( $picName );
			if (!$imageObj) {
				continue;
			}
			$url = $imageObj->getFullUrl();
			$r .= "	<img class='ia-custompics $classname ' data-imgid='$picName' src='$url'/>\n";
		}
		//$r .= "	<img class='ia-custompics ia-custompics-test ' data-imgid='test' src='/test.png'/>\n";
		//$r .= "	<img class='ia-custompics ia-custompics-1188 ' data-imgid='1188' src='/1188.png'/>\n";
		$r .= "</div>";
		return $r;
	}
}
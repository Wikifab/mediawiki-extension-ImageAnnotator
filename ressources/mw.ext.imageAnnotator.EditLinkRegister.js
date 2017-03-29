
ext_imageAnnotator = ext_imageAnnotator || {};


/**
 * the register edit link role is to manage EditLink creation/modification/suppression
 * for instance, when element are reordered using drag and drop, edit links must be reasign to appropriate input
 * 
 */
( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';

	var editLinkRegisterInstance = null;
	

	/**
	 * @class
	 * @constructor
	 */
	ext_imageAnnotator.EditLinkRegister = function (  ) {
		this.editLinks = {};
		this.inputsManaged = {};
	}
	
	/**
	 * factory to get the register instance
	 */
	ext_imageAnnotator.getEditLinkRegister = function (  ) {
		if (editLinkRegisterInstance == null) {
			editLinkRegisterInstance = new ext_imageAnnotator.EditLinkRegister();
		}
		return editLinkRegisterInstance;
	}

	/**
	 * register a new edit link
	 */
	ext_imageAnnotator.EditLinkRegister.prototype.registerEditLink = function (editLink, dataInputName) {
		var editLinkId = editLink.getId();
		
		this.editLinks[editLinkId] = editLink;
		this.inputsManaged[editLinkId] = dataInputName;
		
		console.log("register " + editLinkId + " -> " + dataInputName);
	}

	/**
	 * update the input target linked to the editLink
	 */
	ext_imageAnnotator.EditLinkRegister.prototype.updateEditLinkInputId = function (editLinkId, dataInputId) {

		this.inputsManaged[editLinkId] = dataInputId;
		console.log("update " + editLinkId + " -> " + dataInputName);
	}
	
	/**
	 * update the input target linked to the editLink
	 */
	ext_imageAnnotator.EditLinkRegister.prototype.updateEditLinkInput = function (container, dataInputName) {

		var editLinkId = $(container).find('.mw-ia-editButton').attr('id');
		this.inputsManaged[editLinkId] = dataInputName;
		
		this.editLinks[editLinkId].updateDataInput($("input[name='"+dataInputName + "']"));
		console.log("Update edit link id:" + editLinkId + " inputName:" + dataInputName);
	}
	
	/**
	 * update the input target linked to the editLink
	 */
	ext_imageAnnotator.EditLinkRegister.prototype.removeEditLinkInput = function (container) {

		var editLinkId = $(container).find('.mw-ia-editButton').attr('id');
		console.log("Remove edit link ");
	}
	


})(jQuery, mw, fabric, ext_imageAnnotator);




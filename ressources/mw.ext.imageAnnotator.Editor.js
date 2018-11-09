
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';


	ext_imageAnnotator.canvasNextId = 1;
	ext_imageAnnotator.standardWidth = 600;

	/**
	 * @class
	 * @constructor
	 * @param {jQuery} container container to put editor in it
	 * @param {string} [content='']
	 */
	ext_imageAnnotator.Editor = function ( container, canvasId, content, image, editable, options ) {
		var editor = this;
		this.container = $( container);
		if (this.container.length == 0) {
			return;
		}
		this.isStatic = editable ? false : true;
		// if auto width is true, it apply a zoom to adjust canvas size
		this.isAutoWidth = this.isStatic;
		this.image = image;
		this.content = content;
		this.canvasElement = null;
		this.options = options;
		this.isCropMode = options && options['cropMode'] ? true : false;

		// default params :
		this.currentColor = 'red';
		this.toolbarDivs = {};
		var toolbarConfig = [
				{'type':'div', 'name':'tools'},
				{'type':'div', 'name':'colors'},
				{'type':'crop', 'parent':'tools'},
				{'type':'square', 'parent':'tools'},
				{'type':'circle', 'parent':'tools'},
				{'type':'arrow2', 'parent':'tools'},
				{'type':'text', 'parent':'tools'},
				{'type':'numberedbullet', 'parent':'tools'},
				{'type':'del', 'parent':'tools'},
				{'type':'color', 'color':'black', 'parent':'colors'},
				{'type':'color', 'color':'white', 'parent':'colors'},
				{'type':'color', 'color':'blue', 'parent':'colors'},
				{'type':'color', 'color':'red', 'parent':'colors'},
				{'type':'color', 'color':'yellow', 'parent':'colors'},
				{'type':'color', 'color':'green', 'parent':'colors'}
			];

		if (this.isCropMode) {
			toolbarConfig = [
				{'type':'div', 'name':'tools'},
				{'type':'div', 'name':'colors'},
				//{'type':'cropzone', 'parent':'tools'}
			];
		}

		if (canvasId) {
			this.canvasId = canvasId;
		} else {
			this.canvasId = 'ia_canvas_' + ext_imageAnnotator.canvasNextId;
			this.canvasElement = $("<canvas>").attr('id', this.canvasId ).css('border','1px solid #EEE');

			// set container position to absolut to be the positionning ref
			this.container.css('position','absolute');
			this.canvasElement.css('position','absolute');
			this.canvasElement.css('top','0');
			this.canvasElement.css('left','0');
			// .attr('width', '300').attr('height', '200')
			if (image) {

				editor.updateSize();
				//if image not loaded, with recalc size after load :
				$(image)
				    .load(function() {
				    	editor.updateSize();
				    });

			}
			this.container.append(this.canvasElement);
		}

		ext_imageAnnotator.canvasNextId += ext_imageAnnotator.canvasNextId;

		// METHOD 1
		//$(self.container).append(canvaElement);
		// METHOD 2
		//$(self.container).html("<canvas id='"+this.canvasId+ "' width='100%' height='100%' style='border:1px solid #EEE'> </canvas>");
		//var canvaElement = $("#"+this.canvasId);

		// Load Fabric.js
		if	(this.isStatic) {
			this.canvas = new fabric.StaticCanvas(this.canvasId);
		} else {
			this.canvas = new fabric.Canvas(this.canvasId);
		}

		// disable Group selection, because scaling object casues issues
		this.canvas.selection = false;

		this.canvas.selectionLineWidth = 10;

		//content = '{"objects":[{"type":"image","originX":"left","originY":"top","left":39,"top":53,"width":360,"height":258,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"","alignX":"none","alignY":"none","meetOrSlice":"meet","src":"http://files.wikifab.org/7/7b/Le_petit_robot_%C3%A9ducatif_SCOTT_by_La_Machinerie_robot-scott.jpg","filters":[],"resizeFilters":[]},{"type":"polyline","originX":"left","originY":"top","left":20,"top":20,"width":10,"height":90,"fill":"rgba(255,0,0,0)","stroke":"red","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":-90,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"points":[{"x":30,"y":30},{"x":30,"y":120},{"x":25,"y":110},{"x":30,"y":120},{"x":35,"y":110}]}]}';

		this.updateData(content);

		if( ! this.isStatic) {
			this.addToolbarDyn(toolbarConfig);
		}
		this.addEditListeners();

	}

	ext_imageAnnotator.Editor.prototype.addEditListeners = function() {
		var canvas = this.canvas;

		function objectMoved(o) {
			o.line1 && o.line1.setP1(o.left, o.top);
			o.line2 && o.line2.setP2(o.left, o.top);
		}
		this.canvas.on('object:moving', function(e) {
			var p = e.target;
			objectMoved(p);
			canvas.renderAll();
		});
		this.canvas.on('object:removed', function(e) {
			var p = e.target;
			if (p.line1) {
				canvas.remove(p.line1);
			}
			if (p.line2) {
				canvas.remove(p.line2);
			}
			// TODO : remove also the other circle
			canvas.renderAll();
		});
	}

	ext_imageAnnotator.Editor.prototype.updateSize= function () {
		var width = ext_imageAnnotator.standardWidth;
		var height = Math.round($(this.image).height() * width / $(this.image).width());

		console.log('update size');

		if (this.isAutoWidth) {
			var realwidth = $(this.image).width();
			var realHeight = Math.round(height * realwidth / width);
			console.log([width,height]);
			console.log([realwidth,realHeight]);
			width = realwidth;
			height = realHeight;
		}


		this.canvasElement.attr('width', width);
		this.canvasElement.attr('height', height);
		if (this.canvas) {
			this.canvas.renderAll();
		}
	}

	/**
	 * this function is use to load objects not managed by fabric core
	 * @param string json content to load
	 * @return string json content remaining to load
	 */
	ext_imageAnnotator.Editor.prototype.getSpecificsObjectsFromJson = function (content) {
		var data = JSON.parse(content);
		var editor = this;

		this.specificsObjectsToLoad = [];

		var specificsObjects = [
			'wfcircle',
			'wfrect',
			'wfarrow',
			'wfarrow2',
			'wfarrow2circle',
			'wfarrow2line',
			'wfnumberedbullet'
		]

		for (var x = 0; x < data['objects'].length; x++) {
			if (specificsObjects.indexOf(data['objects'][x].type) != -1) {
				var objectToload = data['objects'][x];
				data['objects'].splice(x, 1);
				x-= 1;
				this.specificsObjectsToLoad.push( objectToload);
			}
		}

		return JSON.stringify(data);
	}

	/**
	 * load object stored in var 'specificsObjectsToLoad'
	 */
	ext_imageAnnotator.Editor.prototype.loadSpecificsObjects = function () {

		if(this.specificsObjectsToLoad) {
			for (var x = 0; x < this.specificsObjectsToLoad.length; x++) {
				if (this.specificsObjectsToLoad[x].type == 'wfcircle') {
					var objectToload = this.specificsObjectsToLoad[x];
					var circle = new ext_imageAnnotator.shapes.Wfcircle(objectToload);
					this.canvas.add(circle);
				} else if (this.specificsObjectsToLoad[x].type == 'wfrect') {
					var objectToload = this.specificsObjectsToLoad[x];
					var circle = new ext_imageAnnotator.shapes.Wfrect(objectToload);
					this.canvas.add(circle);
				} else if (this.specificsObjectsToLoad[x].type == 'wfarrow') {
					var objectToload = this.specificsObjectsToLoad[x];
					var circle = new ext_imageAnnotator.shapes.Wfarrow(objectToload);
					this.canvas.add(circle);
				} else if (this.specificsObjectsToLoad[x].type == 'wfarrow2') {
					var objectToload = this.specificsObjectsToLoad[x];
					var arrow = new ext_imageAnnotator.shapes.Wfarrow2(objectToload);
					this.canvas.add(arrow);
				} else if (this.specificsObjectsToLoad[x].type == 'wfnumberedbullet') {
					var objectToload = this.specificsObjectsToLoad[x];
					// load group without inside shapes, they will be recreated in constructor
					var arrow = new ext_imageAnnotator.shapes.WfNumberedBullet([],objectToload);
					this.canvas.add(arrow);
				} else if (this.specificsObjectsToLoad[x].type == 'wfarrow2line') {
					var objectToload = this.specificsObjectsToLoad[x];
					var line = new ext_imageAnnotator.shapes.Wfarrow2Line(objectToload);
					this.canvas.add(line);

					this.addArrow2CirclesFromLine(line);
				} else {
					console.log('unknown object');
				}
			}
			this.canvas.renderAll();
		}

		return ;
	}


	ext_imageAnnotator.Editor.prototype.updateData = function (content) {
		var editor = this;

		this.content = content;
		this.canvas.remove(this.canvas.getObjects());
		if (content) {
			try {
				// extract specifics objects to be loaded afterwards
				content = editor.getSpecificsObjectsFromJson(content);

				this.canvas.loadFromJSON(content, function () {
					// add specifics objects not loaded by fabric
					editor.loadSpecificsObjects();

					var objects = editor.canvas.getObjects();
					//whe admit that there is only one image object possible : the cropped source image
					objects.forEach(function(item) {
						if (item.type == 'image') {
							item.set('selectable',false);
						}
					});

					//set width and height :
					var obj = JSON.parse(content);
					if (typeof obj.width !== 'undefined' ) {
						editor.canvasElement.attr('width', obj.width);
					}
					if (typeof obj.height !== 'undefined' ) {
						editor.canvasElement.attr('height', obj.height);
					}
					editor.canvas.renderAll();
					if ( editor.isStatic) {
						//editor.placeOverSourceImage();
					}
				});
			} catch (e) {
				console.log('Fail to load json content ');
				console.log(e);
			}
		} else {
			editor.canvas.renderAll();
			if ( editor.isStatic) {
				editor.placeOverSourceImage();
			}
		}
	}

	ext_imageAnnotator.Editor.prototype.addRectangle = function (size) {

		//var rect = new fabric.Rect({
		var rect = new ext_imageAnnotator.shapes.Wfrect({
			originX: 'center',
			originY: 'center',
			top: 120,
			left: 120,
			width: size,
			height: size,
			strokeWidth: 3,
			stroke:this.currentColor,
			fill: 'rgba(255,0,0,0)'
		})
		this.canvas.add(rect);
		this.canvas.setActiveObject(rect);
	}

	ext_imageAnnotator.Editor.prototype.addCircle = function (size) {


		//var circle = new ext_imageAnnotator.shapes.Circle({
		var circle = new ext_imageAnnotator.shapes.Wfcircle({
		//var circle = new fabric.Circle({
			originX: 'center',
			originY: 'center',
			top: 120,
			left: 120,
			radius: size,
			minSize: 10,
			maxSize: 100,
			strokeWidth: 3,
			stroke:this.currentColor,
			fill: 'rgba(255,0,0,0)'
		});

		this.canvas.add(circle);
		this.canvas.setActiveObject(circle);
	}

	ext_imageAnnotator.Editor.prototype.addText = function (size) {

		var text = new fabric.Textbox('Texte',{
			originX: 'center',
			originY: 'center',
			top: 120,
			left: 120,
			//fontWeight: 'bold',
			fontFamily: 'sans-serif',
			fontSize: 20,
			stroke:this.currentColor,
			fill:this.currentColor,
			borderColor: 'black',
			cornerColor: 'rgba(200,200,200,1)',
			transparentCorners:false
			//lockUniScaling:true
			//fill: 'rgba(255,0,0,0)' // transparent
		});
		this.canvas.add(text);
		this.canvas.setActiveObject(text);
	}

	ext_imageAnnotator.Editor.prototype.addArrow = function (size) {

		var x = 20;
		var y = 20;

		var poly = new ext_imageAnnotator.shapes.Wfarrow({
			originX: 'center',
			originY: 'center',
			strokeWidth: 3,
			stroke:this.currentColor,
			fill: 'rgba(255,0,0,0)',
			left: 120,
			top: 120,
			angle: -90,
		});
		this.canvas.add(poly);
		this.canvas.setActiveObject(poly);
	}

	ext_imageAnnotator.Editor.prototype.addArrow2CirclesFromLine = function (line) {

		var c = new ext_imageAnnotator.shapes.Wfarrow2Circle({
			left : line.get('x1'),
			top : line.get('y1'),
			radius : 8,
			line1 : line,
		});
		var c2 = new ext_imageAnnotator.shapes.Wfarrow2Circle({
			left : line.get('x2'),
			top : line.get('y2'),
			radius : 8,
			line2 : line,
		});

		this.canvas.add(c);
		this.canvas.add(c2);
	}

	ext_imageAnnotator.Editor.prototype.addArrow2 = function (size) {


		var line = new ext_imageAnnotator.shapes.Wfarrow2Line({
		//var line = new ext_imageAnnotator.shapes.Wfarrow2Arrow([x,y,x2,y2], {
			originX: 'center',
			originY: 'center',
			strokeWidth: 3,
			stroke:this.currentColor,
			fill: 'rgba(255,0,0,0)',
		});

		this.addArrow2CirclesFromLine(line);

		this.canvas.add(line);

		return;
	}

	ext_imageAnnotator.Editor.prototype.getNextBulletNumber = function() {
		var objects = this.canvas.getObjects();

		var number = 1;
		var numbers = [];

		// get the smallest number wich do not exists yet :
		objects.forEach(function(item) {
			if(item.type == 'wfnumberedbullet') {
				numbers[item.number] = item.number;
				if (number == item.number) {
					number = number + 1;
					while (typeof numbers[number] !== 'undefined') {
						number = number + 1;
					}
				}
			}
		});

		return number;
	}

	ext_imageAnnotator.Editor.prototype.addNumberedBullet = function (size) {

		var number = this.getNextBulletNumber();

		var left = 70 + (number % 10) * 30;
		var line = new ext_imageAnnotator.shapes.WfNumberedBullet(
				[],
				{
					left: left,
					top: 120,
					number: number,
					stroke:this.currentColor,
				}
		);

		this.canvas.add(line);
		return;
	}

	ext_imageAnnotator.Editor.prototype.addCropZone = function(cropPosition) {

		if ( ! cropPosition.cropzonetop) {
			cropPosition = {};
			cropPosition.cropzonetop = 60;
			cropPosition.cropzoneleft = 60;
			cropPosition.cropzoneheight = 300;
			cropPosition.cropzonewidth = 400;
			cropPosition.cropzonescaleX = 1;
			cropPosition.cropzonescaleY = 1;
		}

		// canvas dim :
		var canvasWidth = ext_imageAnnotator.standardWidth;
		var canvasHeight = ext_imageAnnotator.standardWidth
							* parseInt(this.canvasElement.attr('height'))
							/ parseInt(this.canvasElement.attr('width'));

		//var circle = new ext_imageAnnotator.shapes.Circle({
		var circle = new ext_imageAnnotator.shapes.CropZone({
			top: cropPosition.cropzonetop,
			left: cropPosition.cropzoneleft,
			height: cropPosition.cropzoneheight,
			width: cropPosition.cropzonewidth,
			scaleX: cropPosition.cropzonescaleX,
			scaleY: cropPosition.cropzonescaleY,
			lockUniScaling: true,
			maxPositionX: canvasWidth,
			maxPositionY: canvasHeight
		});
		this.canvas.add(circle);
		this.canvas.setActiveObject(circle);
	}

	ext_imageAnnotator.Editor.prototype.getActiveObject = function () {
		var obj = this.canvas.getActiveObject();
		if (obj.line1) {
			obj = obj.line1;
		}
		if (obj.line2) {
			obj = obj.line2;
		}
		return obj;
	}

	ext_imageAnnotator.Editor.prototype.setColor = function (color) {
		this.currentColor = color;
		if(this.getActiveObject()) {
			this.getActiveObject().set('stroke', this.currentColor);
			if (this.getActiveObject().get('fill') != 'rgba(255,0,0,0)') {
				this.getActiveObject().set('fill', this.currentColor);
			}
			this.canvas.renderAll();
		}
		this.setActiveColorbutton();
	}

	ext_imageAnnotator.Editor.prototype.setActiveColorbutton = function () {

		// change css class on buttons :
		$(this.toolbar).find('.toolbarArea-colors button').removeClass('active');
		$(this.toolbar).find('.toolbarArea-colors button.'+this.currentColor).addClass('active');
	}

	ext_imageAnnotator.Editor.prototype.delSelection = function () {
		if(this.canvas.getActiveObject()) {

			this.canvas.remove(this.canvas.getActiveObject());
		}
	}

	/*
	 * this return croped image position, (called in the original editor)
	 * this is the invert function of getCropPosition
	 */
	ext_imageAnnotator.Editor.prototype.getCropedImagePosition = function () {

		var objects = this.canvas.getObjects();

		var number = 1;
		var result = [];

		//whe admit that there is only one image object possible : the cropped source image
		objects.forEach(function(item) {
			if (item.type == 'image') {
				result.top = item.get('top');
				result.left = item.get('left');
				result.width = item.get('width');
				result.height = item.get('height');
				result.scaleX = item.get('scaleX');
				result.scaleY = item.get('scaleY');

				var DefaultScale = ext_imageAnnotator.standardWidth / item.width;

				result.cropzonewidth = 400;
				result.cropzoneheight = 300;

				result.relativescale = result.scaleX / DefaultScale;
				// result.relativescale =  ext_imageAnnotator.standardWidth / (result.cropzonewidth * result.cropzonescaleX);

				result.cropzonescaleX = ext_imageAnnotator.standardWidth  / (result.cropzonewidth * result.relativescale );
				result.cropzonescaleY =result.cropzonescaleX;

				result.cropzonetop = - result.top / result.relativescale;
				result.cropzoneleft = - result.left / result.relativescale;

			}
		});

		return result;
	}

	ext_imageAnnotator.Editor.prototype.startCrop = function () {

		// if existing crop, load object :
		var cropPosition = this.getCropedImagePosition();

		new ext_imageAnnotator.CropPopup(this, this.image, cropPosition, [this, this.applyCrop ] );
	}

	/**
	 * this must be called after a crop is done,
	 * to insert image according to the crop
	 */
	ext_imageAnnotator.Editor.prototype.applyCrop = function (cropPosition) {

		// calc invert position (coordinate to positionnate image cropped behind canvas)
		cropPosition.relativescale =  ext_imageAnnotator.standardWidth / (cropPosition.cropzonewidth * cropPosition.cropzonescaleX);
		cropPosition.top = - cropPosition.cropzonetop * cropPosition.relativescale ;
		cropPosition.left = - cropPosition.cropzoneleft * cropPosition.relativescale;

		var height = 400; //this.canvasElement.attr('height');
		var width = 200; //this.canvasElement.attr('width');

		var imgInstance = new fabric.Image(this.image[0], {
			  left: cropPosition.left,
			  top: cropPosition.top,
			  //opacity: 0.8,
			  hasControls: false,
			  selectable: false
			});

		// scale to set image size to canvas width :
		var scale = ext_imageAnnotator.standardWidth / imgInstance.width;
		// change scale according to crop:
		scale = scale * cropPosition.relativescale ;
		// apply scale :
		imgInstance.scale(scale);


		var canvas = this.canvas;
		// remove previous images
		var objects = this.canvas.getObjects();
		objects.forEach(function(item) {
			if (item.type == 'image') {
				canvas.remove(item);
			}
		});

		this.canvas.add(imgInstance);
		imgInstance.sendToBack();
		this.canvas.renderAll();
	}

	/*
	 * this return cropZone position, (called in the cropeditor into the cropPopup)
	 * it's based on the reference width (ext_imageAnnotator.standardWidth = 600)
	 * this is the invert function of getCropedImagePosition
	 */
	ext_imageAnnotator.Editor.prototype.getCropPosition = function () {

		var objects = this.canvas.getObjects();

		var number = 1;
		var result = [];

		// get the smallest number wich do not exists yet :
		objects.forEach(function(item) {
			if (item.type == 'cropzone') {
				result.cropzoneleft = item.left;
				result.cropzonetop = item.top;
				result.cropzonewidth = item.width;
				result.cropzoneheight = item.height;
				result.cropzonescaleX = item.scaleX;
				result.cropzonescaleY = item.scaleY;

			}
		});

		return result;
	}


	ext_imageAnnotator.Editor.prototype.moveSelection =  function (dLeft, dTop) {
		if(this.canvas.getActiveObject()) {

			var width = parseInt(this.canvasElement.attr('width'));
			var height = parseInt(this.canvasElement.attr('height'));

			var left = this.canvas.getActiveObject().getLeft();
			var top = this.canvas.getActiveObject().getTop();
			left = Math.min(Math.max(left + dLeft, 0), width );
			top = Math.min(Math.max(top + dTop, 0 ), height);
			this.canvas.getActiveObject().setLeft(left);
			this.canvas.getActiveObject().setTop(top);
			this.canvas.renderAll();
		}
	}

	ext_imageAnnotator.Editor.prototype.moveLeft =  function () {
		this.moveSelection(-5,0);
	}

	ext_imageAnnotator.Editor.prototype.moveRight =  function () {
		this.moveSelection(5,0);
	}

	ext_imageAnnotator.Editor.prototype.moveUp =  function () {
		this.moveSelection(0,-5);
	}

	ext_imageAnnotator.Editor.prototype.moveDown =  function () {
		this.moveSelection(0,5);
	}

	ext_imageAnnotator.Editor.prototype.addToolbarDiv = function (params) {

		var name = params['name'];
		var div = $('<div>').addClass('editorToolbarArea').addClass('toolbarArea-'+name);
		this.toolbarDivs[name] = div;

		this.toolbar.append(div);
	}

	ext_imageAnnotator.Editor.prototype.addButton = function (type, params) {

		var editor = this;
		var label  = type;
		if (type == 'color') {
			label = params['color'];
		}
		if (type =='div') {
			return this.addToolbarDiv(params);
		}
		var tooltip = mw.message( 'imageannotator-toolbar-'+ label + '-label' ).text()
		var button = $('<button>' + '</button>').addClass('editorButton').addClass(label);
		button.attr('alt',tooltip);

		switch (type) {
		    case 'crop':
		    	button.click(function() {
					editor.startCrop();
					return false;
				});
		        break;
		    case 'cropzone':
		    	button.click(function() {
		    		editor.addCropZone();
		    		return false;
				});
		        break;
		    case 'color':
		    	var color = label;
		    	button.click(function() {
					editor.setColor(color);
					return false;
				});
		        break;
		    case 'square':
		    	button.click(function() {
					editor.addRectangle(100);
					return false;
				});
		        break;
		    case 'circle':
		    	button.click(function() {
					editor.addCircle(100);
					return false;
				});
		        break;
		    case 'arrow':
		    	button.click(function() {
					editor.addArrow(100);
					return false;
				});
		        break;
		    case 'arrow2':
		    	button.click(function() {
					editor.addArrow2(100);
					return false;
				});
		        break;
		    case 'del':
		    	button.click(function() {
					editor.delSelection();
					return false;
				});
		        break;
		    case 'text':
		    	button.click(function() {
					editor.addText();
					return false;
				});
		        break;
		    case 'numberedbullet':
		    	button.click(function() {
					editor.addNumberedBullet();
					return false;
				});
		        break;
		    default :
		    	return;
		}
		if (typeof(params['parent']) == "string") {
			this.toolbarDivs[params['parent']].append(button);
		} else {
			this.toolbar.append(button);
		}
	}

	ext_imageAnnotator.Editor.prototype.addToolbarDyn = function (buttons) {

		var editor = this;

		if (this.options.hasOwnProperty('toolbarContainer')) {
			this.toolbar = this.options.toolbarContainer;
		} else {
			this.toolbar = $('<div>').addClass('editorToolbar');
			this.container.prepend(this.toolbar);
		}

		for(var configIndex in buttons) {
			var button = buttons[configIndex];
			var type = button['type'], params = '';
			this.addButton(type, button);
		}

		// add keypress listener
		$( this.container) . find('.canvas-container')
			.attr('tabindex',1000)
			.bind('keydown', function (e) {
				editor.onKeyPress(e);
			});


		this.setActiveColorbutton();
	}

	/**
	 * handle keyPress actions
	 */
	ext_imageAnnotator.Editor.prototype.onKeyPress = function(e) {
		switch (e.keyCode) {
			case 46 :
				// DELL
			case 8 :
				// Backspace (dell for MAC)
				this.delSelection();
				break;
			case 37 : // LEFT
				this.moveLeft();
				break;
			case 38 : // UP
				this.moveUp();
				break;
			case 39 : // RIGHT
				this.moveRight();
				break;
			case 40 : // DOWN
				this.moveDown();
				break;
			default:
				return true;
		}
		e.preventDefault();
	}

	// serialization methods :

	ext_imageAnnotator.Editor.prototype.getJson = function () {
		var objectData = this.canvas.toObject();
		// we add height and width information :
		objectData.height = this.canvasElement.attr('height');
		objectData.width = this.canvasElement.attr('width');

		var json = JSON.stringify(objectData);
		// to avoid conflict with  '}}' used by semantic form, wa add spaces between multiples '{' or '}':
		// (twice for each to avoid triples)
		json = json.replace(/\{\{/g,'{ {');
		json = json.replace(/\{\{/g,'{ {');
		json = json.replace(/\}\}/g,'} }');
		json = json.replace(/\}\}/g,'} }');
		return json;
	}
	ext_imageAnnotator.Editor.prototype.getSVG = function () {

		return this.canvas.toSVG();
	}
	ext_imageAnnotator.Editor.prototype.replaceSourceImageBySVG = function () {
		$(this.image).attr('src', "data:image/svg+xml;utf8," + this.getSVG());
	}
	/**
	 * this function generate an img div with svg content of canvas, and put it over the source image
	 */
	ext_imageAnnotator.Editor.prototype.placeOverSourceImage = function ( noredim) {

		return this.copyCanvasOverSourceImage();
	}
	/**
	 * this function generate an img div with svg content of canvas, and put it over the source image
	 * this works well only if there isn't image element inside canvas (occurs when cropped image is defined in it)
	 */
	ext_imageAnnotator.Editor.prototype.exportOverSourceImage = function () {

		if(this.overlayImg) {
			$(this.overlayImg).remove();
		}
		if (this.content) {
			// display it only if content, (some browsers doesn't like empty images)
			this.overlayImg = $('<img>').attr('class','annotationlayer').attr('src', "data:image/svg+xml;utf8," + this.getSVG());

			// positioning
			$(this.image).parent().css({ position:'relative'});
			$(this.overlayImg).insertAfter(this.image);
			$(this.overlayImg).css({ width:'100%'});

			$(this.overlayImg).css({position:'absolute', width:'100%', height:'auto', top: 0, left: 0});
		}
		$('#'+this.canvasId).hide();
	}


	ext_imageAnnotator.Editor.callCount = 0;
	/**
	 * this function generate a canvas div with data copied, and put it over the source image
	 * this replace exportOverSourceImage function
	 */
	ext_imageAnnotator.Editor.prototype.copyCanvasOverSourceImage = function () {

		console.log(this.getSVG());
		if(this.overlayImg) {
			$(this.overlayImg).remove();
		}
		ext_imageAnnotator.Editor.callCount++;
		console.log(ext_imageAnnotator.Editor.callCount);
		if (ext_imageAnnotator.Editor.callCount > 20) {
			return;
		}
		if ( this.isStatic ) {
			return;
		}
		if ( this.image && this.content) {

			// display it only if content, (some browsers doesn't like empty images)
			this.overlayImg = $('<div>').attr('class','annotationlayer');

			// positioning
			$(this.image).parent().css({ position:'relative'});
			$(this.overlayImg).insertAfter(this.image);
			$(this.overlayImg).css({ width:'100%'});

			$(this.overlayImg).css({position:'absolute', width:'100%', height:'auto', top: 0, left: 0});

			try {
				// check that this is json (not json when field doesn't exist)
				// it trigger an exception if so
				var jsonObject = jQuery.parseJSON(this.content);
				// we add editor only for existing images
				var staticEditor = new ext_imageAnnotator.Editor( this.overlayImg, null, this.content, this.image, false ) ;
				$(this).find('a').css('display','inline-block');
			}
			catch(e) {
				console.log('Error : ' );
				console.log(e);
				return;
			}
		}
	}

})(jQuery, mediaWiki, fabric, ext_imageAnnotator);




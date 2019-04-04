
var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
	'use strict';


	ext_imageAnnotator.canvasNextId = 1;
	ext_imageAnnotator.standardWidth = 600;

	fabric.minCacheSideLimit = 512;

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
		this.image = image;
		this.content = content;
		this.canvasElement = null;
		this.options = options;
		this._clipboard = null;
		this.isCropMode = options && options['cropMode'] ? true : false;
		this.fixedHeight = options && options['fixedHeight'] ? options['fixedHeight']  : false;
		this.fixedBackgroundLeft = 0; // left positionning of background, (if fixedHeight )
		this.fixedBackgroundTop = 0; // top positionning of background, (if fixedHeight )
		this.fixedBackgroundScale = 1; // scale = 1 mean backgroundwidth = standardWidth
		this.originalCropPosition = false;

		// default params :
		this.currentColor = 'red';
		this.toolbarDivs = {};

		var toolbarConfig = [
				{'type':'div', 'name':'tools'},
				{'type':'crop', 'parent':'tools'},
				{'type':'square', 'parent':'tools'},
				{'type':'circle', 'parent':'tools'},
				// {'type':'ellipse', 'parent':'tools'},
				{'type':'arrow2', 'parent':'tools'},
				{'type':'line', 'parent':'tools'},
				{'type':'text', 'parent':'tools'},
				{'type':'numberedbullet', 'parent':'tools'},
				{'type':'duplicate', 'parent':'tools'},
				{'type':'del', 'parent':'tools'}
			];

		// colors
		toolbarConfig = this.addToolBarColors(toolbarConfig);

		// custom pics
		toolbarConfig = this.addToolBarCustomsPics(toolbarConfig);

		if (this.isCropMode) {
			toolbarConfig = [
				{'type':'div', 'name':'tools'},
				{'type':'div', 'name':'colors'},
				{'type':'format', 'format':'1_1', 'parent':'tools'},
				{'type':'format', 'format':'4_3', 'parent':'tools'},
				{'type':'format', 'format':'16_9', 'parent':'tools'},
				//{'type':'zoom', 'zoom':'in', 'parent':'tools'},
				//{'type':'zoom', 'zoom':'out', 'parent':'tools'},
				//{'type':'cropzone', 'parent':'tools'}
			];
		}

		if (canvasId) {
			this.canvasId = canvasId;
		} else {
			this.canvasId = 'ia_canvas_' + ext_imageAnnotator.canvasNextId;
			this.canvasElement = $("<canvas>").attr('id', this.canvasId ).css('border','1px solid #EEE');
			// .attr('width', '300').attr('height', '200')
			if (image) {
				//if image not loaded, with recalc size after load :
				$(image)
				    .load(function() {
				    	editor.updateSize();
				    });
				editor.updateSize();

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

		this.canvas.selectionLineWidth = 10;

		var canvas = this.canvas;

		// override : we allow selecting multiple objects but restrict what we can do with the selection
		this.canvas.setActiveObject = function (object, e) {

			if(object instanceof fabric.ActiveSelection) {
				// don't allow resizing
				object.lockScalingX = true;
				object.lockScalingY = true;
			}

			// the actual function
			if	(editor.isStatic) {
				fabric.StaticCanvas.prototype.setActiveObject.call(this, object, e);
			} else {
				fabric.Canvas.prototype.setActiveObject.call(this, object, e);
			}

			//event
			editor._onSetActiveObject();
	    }

		//content = '{"objects":[{"type":"image","originX":"left","originY":"top","left":39,"top":53,"width":360,"height":258,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"","alignX":"none","alignY":"none","meetOrSlice":"meet","src":"http://files.wikifab.org/7/7b/Le_petit_robot_%C3%A9ducatif_SCOTT_by_La_Machinerie_robot-scott.jpg","filters":[],"resizeFilters":[]},{"type":"polyline","originX":"left","originY":"top","left":20,"top":20,"width":10,"height":90,"fill":"rgba(255,0,0,0)","stroke":"red","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":-90,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"points":[{"x":30,"y":30},{"x":30,"y":120},{"x":25,"y":110},{"x":30,"y":120},{"x":35,"y":110}]}]}';

		this.updateData(content);

		if( ! this.isStatic) {
			this.addToolbarDyn(toolbarConfig);
		}
		this.addEditListeners();

	}

	ext_imageAnnotator.Editor.prototype.addToolBarColors = function (toolbarConfig) {

		var colors = [];

		toolbarConfig.push({'type':'dropdown', 'name':'colorselector', 'parent':'tools'});

		if (mw.config.values.ImageAnnotator.imageAnnotatorColors) {

			// colors set via admin config

			var imageAnnotatorColors = mw.config.values.ImageAnnotator.imageAnnotatorColors;

			imageAnnotatorColors.forEach(function(color) {
				colors.push({'type':'color', 'color': color, 'parent':'colorselector'});
			});

			if (imageAnnotatorColors[2]) {
				this.currentColor = imageAnnotatorColors[2];
			}

		} else {
			
			// default colors
			colors = [
				{'type':'color', 'color':'#000000', 'parent':'colorselector'},
				{'type':'color', 'color':'#FFFFFF', 'parent':'colorselector'},
				{'type':'color', 'color':'#0054FF', 'parent':'colorselector'},
				{'type':'color', 'color':'#FF0000', 'parent':'colorselector'},
				{'type':'color', 'color':'#FFF600', 'parent':'colorselector'},
				{'type':'color', 'color':'#4AE40D', 'parent':'colorselector'}
			];
		}

		toolbarConfig = toolbarConfig.concat(colors);

		return toolbarConfig;
	}

	ext_imageAnnotator.Editor.prototype.addToolBarCustomsPics = function (toolbarConfig) {

		var pictList = $('.ia-custompics-container').first();
		var $custompics = pictList.find('.ia-custompics');

		if ($custompics.length > 0) { // don't add the dropdown button if nothing inside
			toolbarConfig.push({'type':'dropdown', 'name':'customtools', 'parent':'tools'});
			
			$custompics.each(function(index, item) {
				var filename = $(item).attr('data-imgid');
				var fileurl = $(item).attr('src');
				var item = {'type':'custompic', 'parent':'customtools', 'filename':filename, 'fileurl':fileurl};
				toolbarConfig.push(item);
			});
		}

		return toolbarConfig;
	}

	ext_imageAnnotator.Editor.prototype.addEditListeners = function() {
		var canvas = this.canvas;

		function objectMoved(o) {

			var coords = {};

			if (o.line1) {
				o.line1.setP1(o.left, o.top);
				o.line1.setCoords();
			}

			if (o.line2) {
				o.line2.setP2(o.left, o.top);
				o.line2.setCoords();
			}
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
			if (p.c1) {
				canvas.remove(p.c1);
			}
			if (p.c2) {
				canvas.remove(p.c2);
			}
			// TODO : remove also the other circle
			canvas.renderAll();
		});
	}

	ext_imageAnnotator.Editor.prototype.updateSize= function () {
		var width = ext_imageAnnotator.standardWidth;
		var baseHeight = $(this.image).height();
		var baseWidth = $(this.image).width();

		if(! baseHeight && this.image[0] != undefined && this.image[0].naturalHeight != undefined) {
			// if image not loaded yet, height element size may be null
			// then try to read 'naturalHeight' attribut
			baseHeight = this.image[0].naturalHeight;
			baseWidth = this.image[0].naturalWidth;
		}
		// if there is a cropped image, use cropped dim as base dim :
		var cropedImage = this.getCropedImagePosition();
		if (cropedImage && cropedImage.height) {
			baseHeight = cropedImage.height;
			baseWidth = cropedImage.width;
		}

		var height = Math.round(baseHeight * width / baseWidth);

		if (this.fixedHeight) {
			height = this.fixedHeight;
		}

		this.canvasElement.attr('width', width);
		if (height > 0) {
			this.canvasElement.attr('height', height);
		}
		if (this.canvas) {
			//this.canvas.setWidth( width);
			//this.canvas.setHeight( height);
			this.canvas.setHeight(height);
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
			'wfnumberedbullet',
			'wfcustompic',
			'wfline',
			'wfellipse'
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
				} else if (this.specificsObjectsToLoad[x].type == 'wfellipse') {
					var objectToload = this.specificsObjectsToLoad[x];
					var ellipse = new ext_imageAnnotator.shapes.Wfellipse(objectToload);
					this.canvas.add(ellipse);
				} else if (this.specificsObjectsToLoad[x].type == 'wfrect') {
					var objectToload = this.specificsObjectsToLoad[x];
					var rect = new ext_imageAnnotator.shapes.Wfrect(objectToload);
					this.canvas.add(rect);
				} else if (this.specificsObjectsToLoad[x].type == 'wfarrow') {
					var objectToload = this.specificsObjectsToLoad[x];
					var arrow = new ext_imageAnnotator.shapes.Wfarrow(objectToload);
					this.canvas.add(arrow);
				} else if (this.specificsObjectsToLoad[x].type == 'wfarrow2') {
					var objectToload = this.specificsObjectsToLoad[x];
					var arrow = new ext_imageAnnotator.shapes.Wfarrow2(objectToload);
					this.canvas.add(arrow);
				} else if (this.specificsObjectsToLoad[x].type == 'wfnumberedbullet') {
					var objectToload = this.specificsObjectsToLoad[x];
					// load group without inside shapes, they will be recreated in constructor
					var bullet = new ext_imageAnnotator.shapes.Wfnumberedbullet([],objectToload);
					this.canvas.add(bullet);
				} else if (this.specificsObjectsToLoad[x].type == 'wfarrow2line') {
					var objectToload = this.specificsObjectsToLoad[x];
					var arrow = new ext_imageAnnotator.shapes.Wfarrow2line(objectToload);
					this.canvas.add(arrow);
				} else if (this.specificsObjectsToLoad[x].type == 'wfline') {
					var objectToload = this.specificsObjectsToLoad[x];
					var line = new ext_imageAnnotator.shapes.Wfline(objectToload);
					this.canvas.add(line);
				} else if (this.specificsObjectsToLoad[x].type == 'wfcustompic') {
					var objectToload = this.specificsObjectsToLoad[x];
					var pic = new ext_imageAnnotator.shapes.Wfcustompic(objectToload);
					this.canvas.add(pic);
				} else {
					console.log('unknown object');
				}
			}
			this.canvas.renderAll();
		}

		return ;
	}

	ext_imageAnnotator.Editor.prototype.lockBackImage = function (content) {

		var objects = this.canvas.getObjects();

		objects.forEach(function(item) {
			if(item.type == 'image') {
				item.selectable=false;
				item.hasControls =false;
			}
		});
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

					//set width and height :
					var obj = JSON.parse(content);
					if (typeof obj.width !== 'undefined' ) {
						editor.canvasElement.attr('width', obj.width);
					}
					if (typeof obj.height !== 'undefined' ) {
						editor.canvasElement.attr('height', obj.height);
					}
					// apply ratio :
					if (typeof obj.width !== 'undefined' && typeof obj.height !== 'undefined' ) {
						var h = editor.canvas.getWidth() * obj.height / obj.width;
						editor.canvas.setHeight(h);
					}
					editor.addBackground();
					// disable cropped image edition
					editor.lockBackImage();

					editor.canvas.renderAll();
					if ( editor.isStatic) {
						editor.placeOverSourceImage();
					} else {
			           // placeOverSourceImage() function call generateThumbUsingAPI
			           // so we call it only if not calling placeOverSourceImage
			           editor.generateThumbUsingAPI(content);
					}

				});
			} catch (e) {
				console.log('Fail to load json content ');
				console.log(e);
			}
		} else {
			editor.addBackground();
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
			strokeWidth: 3,
			stroke:this.currentColor,
			fill: 'rgba(255,0,0,0)'
		});

		this.canvas.add(circle);
		this.canvas.setActiveObject(circle);
	}

	ext_imageAnnotator.Editor.prototype.addEllipse = function () {

		var ellipse = new ext_imageAnnotator.shapes.Wfellipse({
			ry: 100,
     		rx: 100,
     		stroke: this.currentColor
		});
		  
		this.canvas.add(ellipse);
		this.canvas.setActiveObject(ellipse);
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

	ext_imageAnnotator.Editor.prototype.addArrow2 = function () {

		var line = new ext_imageAnnotator.shapes.Wfarrow2line({
		//var line = new ext_imageAnnotator.shapes.Wfarrow2Arrow([x,y,x2,y2], {
			originX: 'center',
			originY: 'center',
			stroke:this.currentColor,
			fill: 'rgba(255,0,0,0)',
		});

		this.canvas.add(line);
	}

	ext_imageAnnotator.Editor.prototype.addLine = function () {

		var line = new ext_imageAnnotator.shapes.Wfline({
			originX: 'center',
			originY: 'center',
			stroke:this.currentColor,
			fill: 'rgba(255,0,0,0)',
		});

		this.canvas.add(line);
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
		var bullet = new ext_imageAnnotator.shapes.Wfnumberedbullet(
				[],
				{
					left: left,
					top: 120,
					number: number,
					stroke:this.currentColor,
				}
		);

		this.canvas.add(bullet);
		return;
	}

	ext_imageAnnotator.Editor.prototype.addCustomPic = function (params) {

		var filename = params['filename'];
		var fileurl = params['fileurl'];

		var imgElement = $('.ia-custompics[data-imgid="'+filename + '"]').get(0);

		var pic = new ext_imageAnnotator.shapes.Wfcustompic(imgElement,{
		//var line = new ext_imageAnnotator.shapes.Wfarrow2Arrow([x,y,x2,y2], {
			top: 100,
			left: 100,
			filename: params['filename'],
			fileurl: params['fileurl']
		});

		this.canvas.add(pic);

		return;
	}

	ext_imageAnnotator.Editor.prototype.setCropZonePosition = function (cropPosition) {
		if (! this.cropZone) {
			return;
		}
		if (this.fixedHeight) {
			// invert of correction in getCropPosition
			var correctedCrop = [];
			correctedCrop.cropzoneleft = cropPosition.cropzoneleft * this.fixedBackgroundScale + this.fixedBackgroundLeft;
			correctedCrop.cropzonetop = cropPosition.cropzonetop * this.fixedBackgroundScale + this.fixedBackgroundTop;
			correctedCrop.cropzonewidth = cropPosition.cropzonewidth * this.fixedBackgroundScale;
			correctedCrop.cropzoneheight = cropPosition.cropzoneheight * this.fixedBackgroundScale;
			correctedCrop.cropzonescaleX = cropPosition.cropzonescaleX ;
			correctedCrop.cropzonescaleY = cropPosition.cropzonescaleY ;
			cropPosition = correctedCrop;
		}

		this.cropZone.top= cropPosition.cropzonetop;
		this.cropZone.left = cropPosition.cropzoneleft;
		this.cropZone.height = cropPosition.cropzoneheight;
		this.cropZone.width = cropPosition.cropzonewidth;
		this.cropZone.scaleX = cropPosition.cropzonescaleX;
		this.cropZone.scaleY = cropPosition.cropzonescaleY;
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

		this.originalCropPosition = cropPosition;

		// if fixedHeight is set, adjust crop position to corrected background position
		if (this.fixedHeight) {
			// invert of correction in getCropPosition
			var correctedCrop = [];
			correctedCrop.cropzoneleft = cropPosition.cropzoneleft * this.fixedBackgroundScale + this.fixedBackgroundLeft;
			correctedCrop.cropzonetop = cropPosition.cropzonetop * this.fixedBackgroundScale + this.fixedBackgroundTop;
			correctedCrop.cropzonewidth = cropPosition.cropzonewidth * this.fixedBackgroundScale;
			correctedCrop.cropzoneheight = cropPosition.cropzoneheight * this.fixedBackgroundScale;
			correctedCrop.cropzonescaleX = cropPosition.cropzonescaleX ;
			correctedCrop.cropzonescaleY = cropPosition.cropzonescaleY ;
			cropPosition = correctedCrop;
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
		this.cropZone = circle;
	}

	ext_imageAnnotator.Editor.prototype._onSetActiveObject = function () {

		var obj = this.getActiveObject(), color = null;

		if (obj) {
			// set current color to the color of the active object
			if (obj.hasOwnProperty("stroke")) { // what can be considered the color of the object ?
				color =  obj.stroke;
			} else if (obj.hasOwnProperty("fill")) {
				color = obj.fill;
			}

			if (color) {
				this._setActiveColor(color);
			}
		}
	}

	ext_imageAnnotator.Editor.prototype.getActiveObject = function () {
		
		var obj = this.canvas.getActiveObject();

		if (!obj) {
			return;
		}

		if (obj.line1) {
			obj = obj.line1;
		}
		if (obj.line2) {
			obj = obj.line2;
		}

		return obj;
	}

	ext_imageAnnotator.Editor.prototype.setColor = function (color) {

		var editor = this;

		this._setActiveColor(color);

		var _setColor = function (obj) {
			obj.set('stroke', editor.currentColor);
			if (obj.get('fill') != 'rgba(255,0,0,0)') {
				obj.set('fill', editor.currentColor);
			}
		};
		
		if(this.getActiveObject()) {

			var activeObject = this.getActiveObject();

			if (activeObject.type === 'activeSelection') {

				activeObject.forEachObject(function(obj) {
					_setColor(obj);
				});

			} else {
				_setColor(activeObject);
			}

			this.canvas.renderAll();
		}
	}

	ext_imageAnnotator.Editor.prototype.setFormat = function (format) {

		var objects = this.canvas.getObjects();
		var canvas = this.canvas;

		objects.forEach(function(item) {
			if (item.type == 'cropzone') {
				var width = item.get('width');
				var height = item.get('height');
				switch (format) {
					case '1_1':
						height = width;
						break;
					case '4_3':
						height = width * 3 / 4;
						break;
					case '16_9':
						height = width * 9 / 16;
						break;
					default :
						console.log ('unknownd format');
						break;
				}
				item.height = height;
			}
		});
		canvas.renderAll();

	}

	ext_imageAnnotator.Editor.prototype.changeZoom = function (zoom) {

		/**
		 * not implemented yet
		 */

	}

	ext_imageAnnotator.Editor.prototype._setActiveColor = function (color) {

		this.currentColor = color;

		this.setActiveColorbutton();
	}

	ext_imageAnnotator.Editor.prototype.setActiveColorbutton = function () {

		// change css class on buttons :
		$(this.toolbar).find('.toolbarArea-colors button').removeClass('active');
		$(this.toolbar).find('.toolbarArea-colors button.'+this.currentColor.replace('#', '')).addClass('active');

		// change css background-color of the colorselector button
		$(this.toolbar).find('.editorDropdowncolorselector').css('background-color', this.currentColor);
	}

	ext_imageAnnotator.Editor.prototype.delSelection = function () {

		var activeObject = this.canvas.getActiveObject(), editor = this;
		if(activeObject) {

			if (activeObject.type === 'activeSelection') {

				activeObject.forEachObject(function(obj) {
					editor.canvas.remove(obj);
				});

				activeObject.destroy();
				this.canvas.discardActiveObject();

				
			} else {
				this.canvas.remove(this.canvas.getActiveObject());
			}
		}
	}
	ext_imageAnnotator.Editor.prototype.duplicateSelection = function () {
		
		// copy and paste
		this.copyObject();
		this.pasteObject();
	}

	/*
	 * this return croped image position, (called in the original editor)
	 * this is the invert function of getCropPosition
	 */
	ext_imageAnnotator.Editor.prototype.getCropedImagePosition = function () {

		if (typeof this.canvas === "undefined") {
			return [];
		}
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

		new ext_imageAnnotator.CropPopup(this, this.image, cropPosition, [this, this.applyCrop ], $('#mw-ia-popup-div') );
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
		// add new image cropped :
		this.canvas.add(imgInstance);
		imgInstance.sendToBack();

		// resize canvas to fit cropped ratio
		//var width = parseInt(this.canvasElement.attr('width'));
		//var height = parseInt(this.canvasElement.attr('height'));

		var width = ext_imageAnnotator.standardWidth;
		var newHeight = cropPosition.cropzoneheight * width / cropPosition.cropzonewidth;
		this.canvas.setWidth(width);
		this.canvas.setHeight(newHeight);

		this.canvas.renderAll();
	}
	ext_imageAnnotator.Editor.prototype.hasBackground = function () {
		var objects = this.canvas.getObjects();

		var number = 1;
		var result = false;

		// get the smallest number wich do not exists yet :
		objects.forEach(function(item) {
			if (item.type == 'image') {
				result = true;
			}
		});

		return result;
	}

	ext_imageAnnotator.Editor.prototype.addBackground = function () {

		if(this.hasBackground()) {
			return;
		}
		var editor = this;

		var img = new Image();

		// add image in background
		// load image first to get img size

		img.onload = function() {
			var imgWidth = this.width;
			var imgHeight = this.height;

			var imgInstance = new fabric.Image(editor.image[0], {
				  left: 0,
				  top: 0,
				  //opacity: 0.8,
				  hasControls: false,
				  selectable: false
			});

			// scale to set image size to canvas width :
			var scale = ext_imageAnnotator.standardWidth / imgWidth;

			editor.fixedBackgroundTop = 0;
			editor.fixedBackgroundLeft = 0;
			editor.fixedBackgroundScale = 1;

			if (editor.fixedHeight) {
				var scaleF = editor.fixedHeight / imgHeight;
				if (scaleF < scale) {
					// margin on right and left
					editor.fixedBackgroundScale = scaleF / scale;
					scale = scaleF;
					var realWidth = imgWidth * scale;
					editor.fixedBackgroundTop = 0;
					editor.fixedBackgroundLeft = (ext_imageAnnotator.standardWidth - realWidth) / 2;
				} else {
					editor.fixedBackgroundScale = 1;
					var realHeight = imgHeight * scale;
					editor.fixedBackgroundTop = (editor.fixedHeight - realHeight) / 2;
					editor.fixedBackgroundLeft = 0;
					// margins on top and bottom
				}
			}
			imgInstance.top = editor.fixedBackgroundTop;
			imgInstance.left = editor.fixedBackgroundLeft;
			// apply scale :
			imgInstance.scale(scale);

			// add new image cropped :
			editor.canvas.add(imgInstance);
			imgInstance.sendToBack();

			editor.backgroundImage = imgInstance;

			editor.setCropZonePosition(editor.originalCropPosition);

			editor.canvas.renderAll();
		}
		img.src = $(this.image).attr('src');


	}

	/*
	 * this return cropZone position, (called in the cropeditor into the cropPopup)
	 * it's based on the reference width (ext_imageAnnotator.standardWidth = 600)
	 * this is the invert function of getCropedImagePosition
	 */
	ext_imageAnnotator.Editor.prototype.getCropPosition = function () {

		if (typeof this.canvas === "undefined") {
			return [];
		}
		var objects = this.canvas.getObjects();

		var number = 1;
		var result = [];

		var editor = this;

		// if this : fixed Height

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

		if (this.fixedHeight) {
			var correctedResult = [];
			correctedResult.cropzoneleft = (result.cropzoneleft - this.fixedBackgroundLeft) / this.fixedBackgroundScale;
			correctedResult.cropzonetop = (result.cropzonetop - this.fixedBackgroundTop) / this.fixedBackgroundScale;
			correctedResult.cropzonewidth = (result.cropzonewidth ) / this.fixedBackgroundScale;
			correctedResult.cropzoneheight = (result.cropzoneheight ) / this.fixedBackgroundScale;
			correctedResult.cropzonescaleX = result.cropzonescaleX ;
			correctedResult.cropzonescaleY = result.cropzonescaleY ;
			result = correctedResult;
		}

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

	ext_imageAnnotator.Editor.prototype.addColorSelector = function (colors) {

		var name = params['name'];
		var container = $('<div>').addClass('color-selector-container');
		var button = $('<button>' + '</button>').addClass('editorButton color-selector');
		var div = $('<div>').addClass('editorToolbarArea').addClass('toolbarArea-'+name).addClass('ia-dropdown-menu');
		this.toolbarDivs[name] = div;
		button.click(function() {
			div.toggle();
			return false;
		});

		container.append(button);
		container.append(div);
		button.blur(function(){
			// we must hide dropdown,
			// but only after click action on subdiv has been called
			setTimeout(function(){
				div.hide();
			}, 200);
		});
		div.hide();

		this.toolbar.append(container);
	}

	ext_imageAnnotator.Editor.prototype.addToolbarDropDown = function (params) {

		var name = params['name'];
		var container = $('<div>').addClass('dropdown-container dropdown-container-' + name);
		var button = $('<button>' + '</button>').addClass('editorButton editorDropdown editorDropdown' + name );
		var div = $('<div>').addClass('editorToolbarArea').addClass('toolbarArea-'+name).addClass('ia-dropdown-menu');
		this.toolbarDivs[name] = div;
		button.click(function() {
			div.toggle();
			return false;
		});

		container.append(button);
		container.append(div);
		button.blur(function(){
			// we must hide dropdown,
			// but only after click action on subdiv has been called
			setTimeout(function(){
				div.hide();
			}, 200);
		});
		div.hide();

		// TODO ...
		this.toolbar.append(container);
	}

	ext_imageAnnotator.Editor.prototype.addButton = function (type, params) {

		var editor = this;
		var label  = type;

		if (type == 'color') {
			label = params['color'].replace('#',''); // strip the #
		}
		if (type == 'format') {
			label = 'f' + params['format'];
		}
		if (type == 'zoom') {
			label = 'zoom' + params['format'];
		}
		if (type =='div') {
			return this.addToolbarDiv(params);
		}
		if (type =='dropdown') {
			return this.addToolbarDropDown(params);
		}
		var tooltip = mw.message( 'imageannotator-toolbar-'+ label + '-label' ).text()
		var button = $('<button>' + '</button>').addClass('editorButton').addClass(label);
		button.attr('alt',tooltip);

		if (type == 'color') {
			button.css('background-color', params['color']);
		}

		if (type =='custompic') {
			var btnImg = $('<img>').attr('src',params['fileurl']);
			btnImg.attr('width',40);
			button.append(btnImg);

			// TODO : use resized image
		}

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
		    case 'format':
		    	var format = label;
		    	button.click(function() {
					editor.setFormat(params['format']);
					return false;
				});
		        break;
		    case 'zoom':
		    	var zoom = label;
		    	button.click(function() {
					editor.changeZoom(params['zoom']);
					return false;
				});
		        break;
		    case 'color':
		    	var color = params['color'];
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
					//editor.addCircle(100);
					editor.addEllipse();
					return false;
				});
		        break;
		  //   case 'ellipse':
		  //   	button.click(function() {
				// 	editor.addEllipse();
				// 	return false;
				// });
		  //       break;
		    case 'arrow':
		    	button.click(function() {
					editor.addArrow(100);
					return false;
				});
		        break;
		    case 'arrow2':
		    	button.click(function() {
					editor.addArrow2();
					return false;
				});
		        break;
		    case 'line':
		    	button.click(function() {
					editor.addLine();
					return false;
				});
		        break;
		    case 'duplicate':
		    	button.click(function() {
					editor.duplicateSelection();
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
		    case 'custompic':
		    	button.click(function() {
					editor.addCustomPic(params);
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
			case 67 : // COPY
				if (e.ctrlKey) this.copyObject();
				break;
			case 86 : // PASTE
				if (e.ctrlKey) this.pasteObject();
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
		objectData.height = this.canvas.getHeight();
		objectData.width = this.canvas.getWidth();
		//objectData.height = this.canvasElement.attr('height');
		//objectData.width = this.canvasElement.attr('width');

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

		return this.exportOverSourceImage();
	}

	ext_imageAnnotator.Editor.prototype.generateThumbUsingAPI = function (jsoncontent, callback) {
		// fonction to do second request to execute follow action

		var editor = this;

		if ( ! callback) {
			callback = function setOverlayImage(url) {
				// display it only if content, (some browsers doesn't like empty images)

				if (! editor.isStatic) {
					return;
				}
				var imgWidth = $(editor.image).attr('width');
				var imgClass = $(editor.image).attr('class');
				editor.overlayImg = $('<img>').attr('class','annotationlayer '+imgClass).attr('src', url);

				$(editor.overlayImg).insertAfter(editor.image);
				$(editor.image).hide();
				// positioning : this methode wa used chen backgound is not set within annotated layer
				// sould we keep it for wikifab olds one ?
				//$(editor.image).parent().css({ position:'relative'});
				//$(editor.overlayImg).css({ width:imgWidth});
				//$(editor.overlayImg).css({ width:'100%', position:'absolute', top:0, left : 0});
			}
		}

		function convertQuery(jsondata) {
			if( ! jsoncontent) {
				jsoncontent = editor.getJson();
			}
			var token = jsondata.query.tokens.csrftoken;
			$.ajax({
				type: "POST",
				url: mw.util.wikiScript('api'),
				data: {
					action:'iaThumbs',
					format:'json',
					token: token,
					image: editor.image.attr('src'),
					jsondata: jsoncontent,
					svgdata: editor.getSVG()
				},
			    dataType: 'json',
			    success: function (jsondata) {

			    	if (jsondata.iaThumbs.success == 1) {
			    		editor.hash = jsondata.iaThumbs.hash;
			    		//setOverlayImage(jsondata.iaThumbs.image);
			    		callback(jsondata.iaThumbs.image, jsondata.iaThumbs);
			    	} else {
			    		console.log('Fail to generate annotatedImage');
			    		console.log(jsondata);
			    	}
			}});
		};

		// first request to get token
		$.ajax({
			type: "GET",
			url: mw.util.wikiScript('api'),
			data: { action:'query', format:'json',  meta: 'tokens', type:'csrf'},
		    dataType: 'json',
		    success: convertQuery
		});
	}


	/**
	 * this function generate an img div with svg content of canvas, and put it over the source image
	 */
	ext_imageAnnotator.Editor.prototype.exportOverSourceImage = function () {
		if(this.overlayImg) {
			$(this.overlayImg).remove();
		}
		if (! this.content) {
			$('#'+this.canvasId).hide();
			return
		};

		// TODO : config this in extension configuration vars :
		// if thumbModeApiConvert is true,
		// then thumb of annotated image is generated using APIs
		// else it use fabricJS to convert it (in SVG), but this won't works for cropping images
		var thumbModeApiConvert = true;

		if (!thumbModeApiConvert) {
			// display it only if content, (some browsers doesn't like empty images)
			this.overlayImg = $('<img>').attr('class','annotationlayer').attr('src', "data:image/svg+xml;utf8," + this.getSVG());

			// positioning
			$(this.image).parent().css({ position:'relative'});
			$(this.overlayImg).insertAfter(this.image);
			$(this.overlayImg).css({ width:'100%'});

			$(this.overlayImg).css({position:'absolute', width:'100%', height:'auto', top: 0, left: 0});
		} else {
			this.generateThumbUsingAPI();
		}
		$('#'+this.canvasId).hide();
	}

	ext_imageAnnotator.Editor.prototype.copyObject = function() {

		var editor = this, activeObject = this.canvas.getActiveObject();

		if (!activeObject) return; 

		this.canvas.getActiveObject().clone(function(cloned) {
			editor._clipboard = cloned;
		});
	}

	ext_imageAnnotator.Editor.prototype.pasteObject = function() {

		var editor = this;

		if (!this._clipboard) return;

		// clone again, so you can do multiple copies.
		this._clipboard.clone(function(clonedObj) {

			editor.canvas.discardActiveObject();
			clonedObj.set({
				left: clonedObj.left + 10,
				top: clonedObj.top + 10,
				evented: true
			});
			if (clonedObj.type === 'activeSelection') {
				// active selection needs a reference to the canvas.
				clonedObj.canvas = editor.canvas;
				clonedObj.forEachObject(function(obj) {
					editor.canvas.add(obj);
				});
				// this should solve the unselectability
				clonedObj.setCoords();
			} else {
				editor.canvas.add(clonedObj);
			}
			editor._clipboard.top += 10;
			editor._clipboard.left += 10;
			editor.canvas.setActiveObject(clonedObj);
			editor.canvas.requestRenderAll();
		});
	}

})(jQuery, mediaWiki, fabric, ext_imageAnnotator);




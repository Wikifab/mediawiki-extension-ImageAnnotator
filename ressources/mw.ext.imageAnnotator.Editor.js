
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
		this.image = image;
		this.content = content;
		this.canvasElement = null;
		this.options = options;

		// default params :
		this.currentColor = 'red';
		this.toolbarDivs = {};
		var toolbarConfig = [
				{'type':'div', 'name':'tools'},
				{'type':'div', 'name':'colors'},
				{'type':'square', 'parent':'tools'},
				{'type':'circle', 'parent':'tools'},
				{'type':'arrow', 'parent':'tools'},
				{'type':'arrow2', 'parent':'tools'},
				{'type':'text', 'parent':'tools'},
				{'type':'del', 'parent':'tools'},
				{'type':'color', 'color':'black', 'parent':'colors'},
				{'type':'color', 'color':'white', 'parent':'colors'},
				{'type':'color', 'color':'blue', 'parent':'colors'},
				{'type':'color', 'color':'red', 'parent':'colors'}
			];

		if (canvasId) {
			this.canvasId = canvasId;
		} else {
			this.canvasId = 'ia_canvas_' + ext_imageAnnotator.canvasNextId;
			this.canvasElement = $("<canvas>").attr('id', this.canvasId ).css('border','1px solid #EEE');
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

		this.canvas.selectionLineWidth = 10;

		//content = '{"objects":[{"type":"image","originX":"left","originY":"top","left":39,"top":53,"width":360,"height":258,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"","alignX":"none","alignY":"none","meetOrSlice":"meet","src":"http://files.wikifab.org/7/7b/Le_petit_robot_%C3%A9ducatif_SCOTT_by_La_Machinerie_robot-scott.jpg","filters":[],"resizeFilters":[]},{"type":"polyline","originX":"left","originY":"top","left":20,"top":20,"width":10,"height":90,"fill":"rgba(255,0,0,0)","stroke":"red","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":-90,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"points":[{"x":30,"y":30},{"x":30,"y":120},{"x":25,"y":110},{"x":30,"y":120},{"x":35,"y":110}]}]}';

		this.updateData(content);

		if( ! this.isStatic) {
			this.addToolbarDyn(toolbarConfig);
		}

	}

	ext_imageAnnotator.Editor.prototype.updateSize= function () {
		var width = ext_imageAnnotator.standardWidth;
		var height = Math.round($(this.image).height() * width / $(this.image).width());
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
			'wfarrow2line'
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
				} else if (this.specificsObjectsToLoad[x].type == 'wfarrow2circle') {
					var objectToload = this.specificsObjectsToLoad[x];
					var arrow = new ext_imageAnnotator.shapes.Wfarrow2Circle(objectToload);
					this.canvas.add(arrow);
				} else if (this.specificsObjectsToLoad[x].type == 'wfarrow2line') {
					var objectToload = this.specificsObjectsToLoad[x];
					var arrow = new ext_imageAnnotator.shapes.Wfarrow2Line(objectToload);
					this.canvas.add(arrow);
					var arrow2 = new fabric.Line(objectToload);
					this.canvas.add(arrow2);
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
						editor.placeOverSourceImage();
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

	ext_imageAnnotator.Editor.prototype.addArrow2 = function (size) {


		var line = new ext_imageAnnotator.shapes.Wfarrow2Line({
		//var line = new ext_imageAnnotator.shapes.Wfarrow2Arrow([x,y,x2,y2], {
			originX: 'center',
			originY: 'center',
			strokeWidth: 3,
			stroke:this.currentColor,
			fill: 'rgba(255,0,0,0)',
		});

		var c = new ext_imageAnnotator.shapes.Wfarrow2Circle({
			//left : line.get('x1'),
			//top : line.get('y1'),
			left : 50,
			top : 50,
			radius : 8,
			line1 : line,
		});

		this.canvas.add(c);

		var c2 = new ext_imageAnnotator.shapes.Wfarrow2Circle({
			//left : line.get('x2'),
			//top : line.get('y2'),
			left : 150,
			top : 50,
			radius : 8,
			line2 : line,
		});

		this.canvas.add(c2);
		this.canvas.add(line);

		var canvas = this.canvas;
		this.canvas.on('object:moving', function(e) {
		    var p = e.target;
		    //p.line1 && p.line1.set({ 'x1': p.left, 'y1': p.top });
		    //p.line2 && p.line2.set({ 'x2': p.left, 'y2': p.top });
		    p.line1 && p.line1.setP1( p.left,  p.top );
		    p.line2 && p.line2.setP2( p.left,  p.top );
		    canvas.renderAll();
		  });

		return;

		var c1 = new ext_imageAnnotator.shapes.Wfarrow2Circle({
			left: 300,
			top: 300,
		});
		this.canvas.add(c1);

		var c1 = new ext_imageAnnotator.shapes.Wfarrow2Circle({
			left: line.get('x1'),
			top: line.get('y1'),
		});
		this.canvas.add(c1);

		var c2 = new ext_imageAnnotator.shapes.Wfarrow2Circle({
			left: line.get('x2'),
			top: line.get('y2'),
		});
		this.canvas.add(c2);
		//this.canvas.setActiveObject(line);

		return;

		var poly = new ext_imageAnnotator.shapes.Wfarrow2({
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


		function makeCircle(left, top, line1, line2) {
		    var c = new fabric.Circle({
		      left: left,
		      top: top,
		      strokeWidth: 5,
		      radius: 12,
		      fill: '#fff',
		      stroke: '#666'
		    });
		    c.hasControls = c.hasBorders = false;

		    c.line1 = line1;
		    c.line2 = line2;

		    return c;
		  }

		  function makeLine(coords) {
		    return new fabric.Line(coords, {
		      fill: 'red',
		      stroke: 'red',
		      strokeWidth: 5,
		      selectable: false,
		      evented: false,
		    });
		  }

		  var canvas = this.canvas;

		  var line = makeLine([ 250, 125, 250, 175 ]);

		  canvas.add(line);

		  canvas.add(
		    makeCircle(line.get('x1'), line.get('y1'), null, line),
		    makeCircle(line.get('x2'), line.get('y2'), line, null)
		  );

		  canvas.on('object:moving', function(e) {
		    var p = e.target;
		    p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top });
		    p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top });
		    canvas.renderAll();
		  });
	}

	ext_imageAnnotator.Editor.prototype.setColor = function (color) {
		this.currentColor = color;
		if(this.canvas.getActiveObject()) {
			this.canvas.getActiveObject().setStroke(this.currentColor);
			if (this.canvas.getActiveObject().getFill() != 'rgba(255,0,0,0)') {
				this.canvas.getActiveObject().setFill(this.currentColor);
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

		return this.exportOverSourceImage();
	}
	/**
	 * this function generate an img div with svg content of canvas, and put it over the source image
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


})(jQuery, mediaWiki, fabric, ext_imageAnnotator);




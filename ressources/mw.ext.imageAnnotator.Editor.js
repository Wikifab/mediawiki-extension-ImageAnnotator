
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
		this.canvasElement = null;
		this.options = options;
		
		// default params :
		this.currentColor = 'red';
		var toolbarConfig = [
				'square',
				'circle',
				'arrow',
				'text',
				'del',
				['color', 'black'],
				['color', 'white'],
				['color', 'blue'],
				['color', 'red'],
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
		
		//content = '{"objects":[{"type":"image","originX":"left","originY":"top","left":39,"top":53,"width":360,"height":258,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"","alignX":"none","alignY":"none","meetOrSlice":"meet","src":"http://files.wikifab.org/7/7b/Le_petit_robot_%C3%A9ducatif_SCOTT_by_La_Machinerie_robot-scott.jpg","filters":[],"resizeFilters":[]},{"type":"polyline","originX":"left","originY":"top","left":20,"top":20,"width":10,"height":90,"fill":"rgba(255,0,0,0)","stroke":"red","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":-90,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"points":[{"x":30,"y":30},{"x":30,"y":120},{"x":25,"y":110},{"x":30,"y":120},{"x":35,"y":110}]}]}';
		
		this.updateData(content);
		
		if( ! this.isStatic) {
			this.addToolbarDyn(toolbarConfig);
		}
		
	}
	
	ext_imageAnnotator.Editor.prototype.updateSize= function () {
		var width = ext_imageAnnotator.standardWidth;
		var height = Math.round($(this.image).height() * width / $(this.image).width());
		console.log('id:' + this.canvasId + 'width:'+ width + ' height:'+ height);
		this.canvasElement.attr('width', width);
		this.canvasElement.attr('height', height);
		if (this.canvas) {
			this.canvas.renderAll();
		}
	}
	
	ext_imageAnnotator.Editor.prototype.updateData = function (content) {
		var editor = this;
		this.canvas.remove(this.canvas.getObjects());
		if (content) {
			this.canvas.loadFromJSON(content, function () {
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
		} else {
			editor.canvas.renderAll();
			if ( editor.isStatic) {
				editor.placeOverSourceImage();
			}
		}
	}

	ext_imageAnnotator.Editor.prototype.addRectangle = function (size) {
		
		this.canvas.add(
				new fabric.Rect({ top: 20, left: 20, width: size, height: size, strokeWidth: 3, stroke:this.currentColor, fill: 'rgba(255,0,0,0)' })
		);
	}

	ext_imageAnnotator.Editor.prototype.addCircle = function (size) {
		
		this.canvas.add(
				new fabric.Circle({ 
					top: 20,
					left: 20,
					radius: size,
					strokeWidth: 3,
					stroke:this.currentColor,
					fill: 'rgba(255,0,0,0)'
				})
		);
	}

	ext_imageAnnotator.Editor.prototype.addText = function (size) {
		
		this.canvas.add(
				new fabric.Circle({ 
					top: 20,
					left: 20,
					radius: size,
					strokeWidth: 3,
					stroke:this.currentColor,
					fill: 'rgba(255,0,0,0)'
				})
		);
	}
	
	ext_imageAnnotator.Editor.prototype.addArrow = function (size) {
		
		var x = 20;
		var y = 20;
		var poly = new fabric.Polyline([
		    { x: x + 10, y: y + 10 },
		    { x: x + 10, y: y + 100 },
		    { x: x + 5, y: y + 90 },
		    { x: x + 10, y: y + 100 },
		    { x: x + 15, y: y + 90 }
			], {
			strokeWidth: 3,
			stroke:this.currentColor,
			fill: 'rgba(255,0,0,0)',
			left: 20,
			top: 20,
			angle: -90,
		});
		this.canvas.add(poly);
	}
	
	ext_imageAnnotator.Editor.prototype.setColor = function (color) {
		this.currentColor = color;
		if(this.canvas.getActiveObject()) {
			this.canvas.getActiveObject().setStroke(this.currentColor);
			this.canvas.renderAll();
		}
	}
	
	ext_imageAnnotator.Editor.prototype.delSelection = function () {
		if(this.canvas.getActiveObject()) {
			this.canvas.getActiveObject().remove();
		}
	}

	ext_imageAnnotator.Editor.prototype.addButton = function (type, params) {

		var editor = this; 
		var label  = type;
		if (type == 'color') {
			label = params;
		}
		var button = $('<button>' + label + '</button>').addClass('editorButton').addClass(label);

		
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
		this.toolbar.append(button);
	}

	ext_imageAnnotator.Editor.prototype.addToolbarDyn = function (buttons) {
		
		
		if (this.options.hasOwnProperty('toolbarContainer')) {
			this.toolbar = this.options.toolbarContainer;
		} else {
			this.toolbar = $('<div>').addClass('editorToolbar');
			this.container.prepend(this.toolbar);
		}
		
		for(var configIndex in buttons) {
			var type , params = '';
			if(typeof buttons[configIndex] == 'string') {
				type = buttons[configIndex];
			} else {
				type = buttons[configIndex][0];
				params = buttons[configIndex][1];
			}
			this.addButton(type, params);
		}
	}

	ext_imageAnnotator.Editor.prototype.addToolbar = function () {
		var editor = this; 
		this.toolbar = $('<div>').addClass('editorToolbar');
		var carre = $('<button>carre</button>');
		carre.click(function() {
			editor.addRectangle(100);
		});
		var rond = $('<button>rond</button>');
		rond.click(function() {
			editor.addCircle(100);
		});
		var arrow = $('<button>Arrow</button>');
		arrow.click(function() {
			editor.addArrow(100);
		});
		var del = $('<button>Del</button>');
		del.click(function() {
			editor.delSelection();
		});
		var black = $('<button>Black</button>');
		black.click(function() {
			editor.setColor('black');
		});
		var blue = $('<button>Blue</button>');
		blue.click(function() {
			editor.setColor('blue');
		});
		var red = $('<button>Red</button>');
		red.click(function() {
			editor.setColor('red');
		});
		var white = $('<button>white</button>');
		white.click(function() {
			editor.setColor('white');
		});

		this.toolbar.append(carre).append(rond).append(arrow);
		this.toolbar.append(black).append(white).append(red).append(blue);
		this.container.prepend(this.toolbar);
	}
	
	// serialization methods :
	
	ext_imageAnnotator.Editor.prototype.getJson = function () {
		var objectData = this.canvas.toObject();
		// we add height and width information :
		objectData.height = this.canvasElement.attr('height');
		objectData.width = this.canvasElement.attr('width');
		return JSON.stringify(objectData);
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
		//var img = $('<img>').attr('src', "data:image/svg+xml;utf8," + this.getSVG());
		
		//	css.width = '100%';
		
		$('#'+this.canvasId).css({
			position:'absolute',
			width:'100%',
			top: $(this.image).position().top,
			left: $(this.image).position().left
		});
		$(this.container).find('.canvas-container').css({
			position:'absolute',
			width:'100%',
			top: $(this.image).position().top,
			left: $(this.image).position().left
		});

	}
	/**
	 * this function generate an img div with svg content of canvas, and put it over the source image
	 */
	ext_imageAnnotator.Editor.prototype.exportOverSourceImage = function () {
		
		if(this.overlayImg) {
			$(this.overlayImg).remove();
		}
		this.overlayImg = $('<img>').attr('src', "data:image/svg+xml;utf8," + this.getSVG());

		// positioning
		$(this.image).parent().css({ position:'relative'});
		$(this.overlayImg).insertAfter(this.image);
		$(this.overlayImg).css({ width:'100%'});

		$(this.overlayImg).css({position:'absolute', width:'100%', height:'auto', top: 0, left: 0});

		$('#'+this.canvasId).hide();
	}


})(jQuery, mw, fabric, ext_imageAnnotator);




var mw = mw || {};
mw.ext = mw.ext || {};
mw.ext.imageAnnotator = mw.ext.imageAnnotator || {};

( function ( $, mw, fabric ) {
	'use strict';

	
	mw.ext.imageAnnotator.canvasNextId = 1;

	/**
	 * @class
	 * @constructor
	 * @param {jQuery} container container to put editor in it
	 * @param {string} [content='']
	 */
	mw.ext.imageAnnotator.Editor = function ( container, canvasId, content, toolbarConfig ) {
		this.container = $('#' + container);
		if (canvasId) {
			this.canvasId = canvasId;
		} else {
			// DO NOT WORKS
			this.canvasId = mw.ext.imageAnnotator.canvasNextId;
		}

		mw.ext.imageAnnotator.canvasNextId += mw.ext.imageAnnotator.canvasNextId;

		// METHOD 1
		var canvaElement = $("<canvas>").attr('id', this.canvasId ).attr('width', '100%').attr('height', '100%').css('border','1px solid #EEE');
		//$(self.container).append(canvaElement);
		// METHOD 2
		//$(self.container).html("<canvas id='"+this.canvasId+ "' width='100%' height='100%' style='border:1px solid #EEE'> </canvas>");
		//var canvaElement = $("#"+this.canvasId);

		// Load Fabric.js
		this.canvas = new fabric.Canvas(this.canvasId);
		
		
		this.currentColor = 'red';
		
		// for test : add sample data
		/*this.canvas.add(
		    new fabric.Circle({ top: 140, left: 230, radius: 75, fill: 'green' }),
		    new fabric.Triangle({ top: 300, left: 210, width: 100, height: 100, fill: 'blue' })
		  );*/

		if (!toolbarConfig) {
			toolbarConfig = [
				'square',
				'circle',
				'arrow',
				'del',
				['color', 'black'],
				['color', 'white'],
				['color', 'blue'],
				['color', 'red'],
			];
		}
		
		//this.addToolbar();
		this.addToolbarDyn(toolbarConfig);
	}

	mw.ext.imageAnnotator.Editor.prototype.addRectangle = function (size) {
		
		this.canvas.add(
				new fabric.Rect({ top: 100, left: 100, width: size, height: size, strokeWidth: 3, stroke:this.currentColor, fill: 'rgba(255,0,0,0)' })
		);
	}

	mw.ext.imageAnnotator.Editor.prototype.addCircle = function (size) {
		
		this.canvas.add(
				new fabric.Circle({ 
					top: 100,
					left: 100,
					radius: size,
					strokeWidth: 3,
					stroke:this.currentColor,
					fill: 'rgba(255,0,0,0)'
				})
		);
	}
	
	mw.ext.imageAnnotator.Editor.prototype.addArrow = function (size) {
		
		var x = 100;
		var y = 100;
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
			left: 100,
			top: 100,
			angle: -90,
		});
		this.canvas.add(poly);
	}
	
	mw.ext.imageAnnotator.Editor.prototype.setColor = function (color) {
		this.currentColor = color;
		if(this.canvas.getActiveObject()) {
			this.canvas.getActiveObject().setStroke(this.currentColor);
			this.canvas.renderAll();
		}
	}
	
	mw.ext.imageAnnotator.Editor.prototype.delSelection = function () {
		if(this.canvas.getActiveObject()) {
			this.canvas.getActiveObject().remove();
		}
	}

	mw.ext.imageAnnotator.Editor.prototype.addButton = function (type, params) {

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
				});
		        break;
		    case 'square':
		    	button.click(function() {
					editor.addRectangle(100);
				});
		        break;
		    case 'circle':
		    	button.click(function() {
					editor.addCircle(100);
				});
		        break;
		    case 'arrow':
		    	button.click(function() {
					editor.addArrow(100);
				});
		        break;
		    case 'del':
		    	button.click(function() {
					editor.delSelection();
				});
		        break;
		    default : 
		    	console.log('type not found' + label);
		    	return;
		}
		this.toolbar.append(button);
	}

	mw.ext.imageAnnotator.Editor.prototype.addToolbarDyn = function (buttons) {
		this.toolbar = $('<div>').addClass('editorToolbar');
		
		for(var configIndex in buttons) {
			var type , params = '';
			if(typeof buttons[configIndex] == 'string') {
				type = buttons[configIndex];
			} else {
				type = buttons[configIndex][0];
				params = buttons[configIndex][1];
			}
			console.log('add button type  :' + type);
			console.log(params);
			this.addButton(type, params);
		}
		this.container.prepend(this.toolbar);
	}

	mw.ext.imageAnnotator.Editor.prototype.addToolbar = function () {
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


})(jQuery, mw, fabric);




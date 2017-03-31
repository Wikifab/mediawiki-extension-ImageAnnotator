;
Modal.addEvents({
	onImageMarkersLoad : function(a, b, c) {
		ImageMarkers.initialize(a, b, c)
	},
	onImageMarkersUnload : function() {
		ImageMarkers.unload()
	}
});
var ImageMarkers = (function() {
	var k, m, g;
	var h = function() {
		this.savedShape = null
	};
	h.prototype.copy = function(n) {
		this.savedShape = n.clone()
	};
	h.prototype.paste = function() {
		return this.savedShape.clone()
	};
	h.prototype.isEmpty = function() {
		return !this.savedShape
	};
	var f = new h();
	var a = {
		up : false,
		down : false,
		left : false,
		right : false
	};
	var l = 1, c = 5, j = 2, i = 6;
	var b = function(q) {
		var r = k.getActiveShape();
		if (r || q.key === "v") {
			if (a.hasOwnProperty(q.key)) {
				a[q.key] = true;
				q.stop();
				var p = q.shift ? c : l;
				if (q.control || q.alt) {
					r.grow(a, p)
				} else {
					r.nudge(a, p)
				}
				r.canvas.renderAll()
			} else {
				if (q.key === "delete" || q.key === "backspace") {
					k.removeShape(r);
					q.stop()
				} else {
					if (q.key === "-" || q.key === "=" || q.key === "+") {
						q.stop();
						var o = q.shift ? i : j;
						o *= (q.key === "-") ? -1 : 1;
						k.incrementSize(r, o)
					} else {
						if (q.key === "c") {
							q.stop();
							f.copy(r)
						} else {
							if (q.key === "v") {
								q.stop();
								if (!f.isEmpty()) {
									var n = f.paste();
									k.getMarkupObjects().push(n);
									k.fabricCanvas.add(n);
									k.fabricCanvas.setActiveObject(n);
									n.center();
									n.setCoords();
									n.canvas.renderAll()
								}
							}
						}
					}
				}
			}
		}
		if (q.key == "backspace") {
			q.stop()
		}
	};
	var d = function(n) {
		if (a.hasOwnProperty(n.key)) {
			a[n.key] = false
		}
	};
	return {
		thumb : {
			width : 592,
			height : 444
		},
		activeColor : "red",
		options : {
			ratio : "FOUR_THREE"
		},
		showForMediaItem : function(n) {
			Modal.open({
				type : "module",
				name : "ImageMarkers",
				boxClass : "mediaLibraryModalBox editPhoto",
				clientOptions : {
					mediaImage : n,
					ratio : this.options.ratio,
					min : this.options.min
				},
				serverOptions : {
					imageid : n.getID()
				}
			})
		},
		initialize : function(n, p, o) {
			var r = this.mediaImage = p.mediaImage;
			this.sourceImageData = new MediaItemData(o.sourceImage);
			Object.each(o.image, function(t, s) {
				r.data[s](t)
			});
			delete p.mediaImage;
			this.setOptions(p);
			this.container = $("imageEditContainer");
			this.canvas = $("imageEditCanvas");
			this.fabric = null;
			this.setupMarkerEvents();
			var q = this;
			this.loadImage(function(s) {
				q.setActiveMarkerOption($("shapeCircle"));
				s.on("object:selected", function(t) {
					if (!t.target) {
						return
					}
					q.setCurrentColor(t.target.color)
				})
			})
		},
		setMarkerEditable : function(n) {
			if (this.fabric != null) {
				this.fabric.getObjects().each(function(o) {
					o.set("selectable", n);
					o.set("perPixelTargetFind", n)
				})
			}
		},
		setupMarkerEvents : function() {
			var p = this;
			this.markerOptions = $$("#shapeButtons .markerButton[data-type]");
			var n = $$(".extras .markerButton");
			var o = $("moreTools");
			this.activeOption = this.markerOptions.filter(".selected");
			this.markerOptions.addEvent("click", function(q) {
				p.setActiveMarkerOption(this)
			});
			o.addEvent("click", function(q) {
				n.show();
				this.hide()
			});
			this.markerColors = $$(".markerColor");
			this.markerColors.addEvent("click", function(q) {
				p.setCurrentColor(q.target.get("data-color"))
			});
			Modal.closeConfirms.set("ImageMarkers", this.confirm.bind(this));
			$("imageEditButton").removeEvents().addEvent("click",
					this.save.bind(p));
			$(document).addEvent("keydown", b);
			$(document).addEvent("keyup", d);
			clickSafe($("markersCloseBtn"), function() {
				Modal.cancel()
			});
			$("markerTrash").addEvent("click", function() {
				p.removeActiveShape()
			})
		},
		removeActiveShape : function() {
			k.removeShape(k.getActiveShape())
		},
		setActiveMarkerOption : function(n) {
			this.fabric.deactivateAll().renderAll();
			if (this.activeOption.get("data-type") == n.get("data-type")) {
				return
			}
			this.activeOption = n;
			var o = this.activeOption.get("data-type");
			k.shapeCreator.setShapeMode(o);
			this.markerOptions.removeClass("selected");
			this.activeOption.addClass("selected");
			this.setMarkerEditable(true)
		},
		setCurrentColor : function(n) {
			var p = $$(".markerColor[data-color=" + n + "]")[0];
			this.selectedColor = n;
			this.markerColors.removeClass("selected");
			p.addClass("selected");
			var o = k.getActiveShape();
			if (o) {
				k.setColor(o, n)
			}
			k.shapeCreator.setColor(n)
		},
		confirm : function() {
			if (this.markupString && (this.markupString != k.getMarkupString())) {
				return confirm("You have unsaved modifications. Your changes will be lost if you continue.\n\nQuit without saving?")
			}
			return true
		},
		loadImage : function(r) {
			var p = this.mediaImage;
			var q;
			if (p.hasMarkers()) {
				if (p.hasCrop()) {
					q = this.container.get("data-preview")
							+ "/{i}/{m}/medium".substitute({
								i : p.data.srcid(),
								m : p.cropMarkupString() + ";"
										+ this.options.ratio
							})
				} else {
					q = this.sourceImageData.medium()
				}
			} else {
				q = p.getSrc("medium")
			}
			this.container.setStyles({
				width : p.data.scaled_width(),
				height : p.data.scaled_height()
			});
			var n = new Element("img", {
				src : q,
				"class" : "sourceImage"
			});
			this.container.grab(n, "top");
			this.canvas.width = p.data.scaled_width();
			this.canvas.height = p.data.scaled_height();
			var o = function() {
				var s = require("fabric").fabric;
				this.fabric = new s.Canvas(this.canvas.get("id"), {
					hoverCursor : "pointer",
					moveCursor : "move",
					defaultCursor : "crosshair",
					targetFindTolerance : 1
				});
				k = require("./ImageMarkupBuilder").Builder(this.fabric);
				this.placeExistingMarkers();
				r && r(this.fabric)
			}.bind(this);
			n.addEvent("load", o)
		},
		placeExistingMarkers : function() {
			var q = this.mediaImage.data;
			var p = q.markup();
			var n = p.draw ? {
				draw : p.draw
			} : {};
			n.strokeWidth = 5;
			n.crop = p.crop;
			var o = {
				resizeRatio : this.canvas.get("width") / q.width(),
				finalDimensions : {
					width : this.canvas.get("width"),
					height : this.canvas.get("height")
				},
				instructions : n
			};
			k.processJSON(o, function(r) {
				this.markupString = k.getMarkupString();
				this.fabric.deactivateAll().renderAll();
				this.setMarkerEditable(true)
			}.bind(this))
		},
		save : function() {
			var p = this.mediaImage;
			var n = k.getMarkupString();
			if (this.markupString != n) {
				this.markupString = n;
				var o = new Future();
				p.setDataPromise(o);
				new Request.AjaxIO("editImageMarkers", {
					onSuccess : function(q) {
						if (q.error) {
							o.error(q.error)
						} else {
							q.filter_state = p.data.filter_state();
							o.resolve(q)
						}
					}.bind(this)
				}).send(p.getID(), this.markupString, p.data.ratio(), true)
			}
			Modal.pop()
		},
		unload : function() {
			$(document).removeEvent("keydown", b);
			$(document).removeEvent("keyup", d);
			Modal.closeConfirms.erase("ImageMarkers");
			this.markup = null;
			this.lastMarkup = null
		}
	}
})();
Object.append(ImageMarkers, Utils.EventsFunctions);
Object.append(ImageMarkers, new Options());

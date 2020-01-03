var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
  'use strict';

  ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

  ext_imageAnnotator.shapes.Wfellipse = fabric.util.createClass(fabric.Ellipse, {
     type: 'wfellipse',
        left: 120,
        top: 120,
        strokeWidth: 2,
        selectable: true,
        originX: 'center', originY: 'center',
        ry: 50,
        rx: 100,
        transparentCorners:false,
        borderColor: 'black',
        cornerColor: 'rgba(200,200,200,1)',
        fill: 'rgba(255,0,0,0)',

         // Min and Max size to enforce (false == no enforcement)
         minSize: 10,
         maxSize: 295,

         centerTransform: true,

         outlineWidth: 1,
         outlineStyle: '#FFF',

     initialize: function (optionsopt) {

        this.on('scaling', function(e) {

            var obj = this,
            rx = obj.rx * obj.scaleX,
            ry = obj.ry * obj.scaleY;

            obj.set({
              'rx'  : rx,
              'ry'   : ry,
              'scaleX'  : 1,
              'scaleY'  : 1
            });

      });

        this.callSuper('initialize', optionsopt);
     },

     render: function(ctx) {
        this._limitSize();
        this.callSuper('render', ctx);
     },

     /**
      * Enforce the min / max sizes if set.
      */
     _limitSize: function() {

        var rx = this.getRx();
        var ry = this.getRy();

        if (this.minSize !== false && rx < this.minSize) {
           this.scaleX = this.minSize / this.rx;
        } else if (this.maxSize !== false && rx > this.maxSize) {
           this.scaleX = this.maxSize / this.rx;
        }
        if (this.minSize !== false && ry < this.minSize) {
           this.scaleY = this.minSize / this.ry;
        } else if (this.maxSize !== false && ry > this.maxSize) {
           this.scaleY = this.maxSize / this.ry;
        }
        // change the stroke width to look same
        //this.setStrokeWidth(3 *2 / (this.scaleX + this.scaleY) );
        this.setCoords();
     }

  });

  // for clone()
  ext_imageAnnotator.shapes.Wfellipse.fromObject = function(object, callback) {

    var klass = this.prototype.constructor;
    object = fabric.util.object.clone(object, true);

    var instance = new klass(object);
        callback && callback(instance);
  }

  // For objects that are contained in other objects, fabric.util.enlivenObjects()
  // will look for classes within fabric.
  fabric.Wfellipse = ext_imageAnnotator.shapes.Wfellipse;

})(jQuery, mw, fabric, ext_imageAnnotator);




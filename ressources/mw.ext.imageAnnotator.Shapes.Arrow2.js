var ext_imageAnnotator = ext_imageAnnotator || {};

( function ( $, mw, fabric, ext_imageAnnotator ) {
  'use strict';

  ext_imageAnnotator.shapes = ext_imageAnnotator.shapes || {}

  ext_imageAnnotator.shapes.Arrow2 = fabric.util.createClass(fabric.Line, {
     type: 'arrow2',
     strokeWidth: 3,
     transparentCorners:false,
     borderColor: 'black',
     cornerColor: 'rgba(200,200,200,1)',

    initialize: function(e,t) {
      this.callSuper("initialize", e, t);

      this.on('scaling', function(e) {

            var obj = this,
            w = obj.width * obj.scaleX,
            h = obj.height * obj.scaleY;

            obj.set({
              'height'  : h,
              'width'   : w,
              'scaleX'  : 1,
              'scaleY'  : 1
            });
            
      });
    },

    _render: function(e) {
      e.beginPath();
      var r = this.calcLinePoints();
      var headlen = 15;   // length of head in pixels
      var angle = Math.atan2(r.y2-r.y1,r.x2-r.x1);
      e.moveTo(r.x1, r.y1);
      e.lineTo(r.x2, r.y2);
      e.lineTo(r.x2-headlen*Math.cos(angle-Math.PI/6),r.y2-headlen*Math.sin(angle-Math.PI/6));
      e.moveTo(r.x2, r.y2);
      e.lineTo(r.x2-headlen*Math.cos(angle+Math.PI/6),r.y2-headlen*Math.sin(angle+Math.PI/6));

      e.lineWidth = this.strokeWidth;
      var s = e.strokeStyle;
      e.strokeStyle = this.stroke || e.fillStyle, this.stroke && this._renderStroke(e), e.strokeStyle = s
    }
  });

  // for clone()
  ext_imageAnnotator.shapes.Arrow2.fromObject = function(object, callback) {

    var klass = this.prototype.constructor;
    object = fabric.util.object.clone(object, true);

    var n = [object.x1, object.y1, object.x2, object.y2];

    var instance = new klass(n, object);
        callback && callback(instance);
  }

  fabric.Arrow2 = ext_imageAnnotator.shapes.Arrow2;

})(jQuery, mw, fabric, ext_imageAnnotator);




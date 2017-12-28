define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/on",
  "esri/tasks/GeometryService",
  "esri/tasks/ProjectParameters",
  "esri/SpatialReference",
  "esri/geometry/Point",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dojo/text!./templates/scaleWidget.html"
], function(declare, lang, on, GeometryService, ProjectParameters, SpatialReference, Point, _WidgetBase, _TemplatedMixin, template){
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    baseClass: "scaleWidget",
    map: null,
    /*gs: null,
    pp: null,
    inSR: null,
    point: null,*/
    constructor: function(params) {
      this.map = params.map;
      this.map.on("extent-change", lang.hitch(this, this.updateScale));
    },
    updateScale: function(e) {
      this.scalenode.innerHTML = "1 : " + this.map.getScale();
    }
  });
});

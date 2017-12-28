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
  "dojo/text!./templates/coordsWidget.html"
], function(declare, lang, on, GeometryService, ProjectParameters, SpatialReference, Point, _WidgetBase, _TemplatedMixin, template){
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    baseClass: "coordsWidget",
    map: null,
    /*gs: null,
    pp: null,
    inSR: null,
    point: null,*/
    constructor: function(params) {
      this.map = params.map;
      /*console.log("coords", this.map);
      this.inSR = new SpatialReference({
        wkid: this.map.spatialReference.wkid
      });
      this.point = new Point();
      this.gs = new GeometryService("http://62.236.121.188/arcgis104/rest/services/Utilities/Geometry/GeometryServer");
      this.pp = new ProjectParameters();
      this.pp.outSR = new SpatialReference({
        wkid: "4326"
      });*/
      this.map.on("mouse-move", lang.hitch(this, this.updateCoords));
    },
    updateCoords: function(e) {
      /*var coordXnode = this.coordXnode;
      var coordYnode = this.coordYnode;
      var point = new Point();
      point.setSpatialReference(
        new SpatialReference({
          wkid: "4326"
        })
      );
      this.point.setX(e.mapPoint.x);
      this.point.setY(e.mapPoint.y);
      this.pp.geometries = [this.point];
      this.gs.project(this.pp, function (outputpoint) {
        point.setX(outputpoint[0].x);
        point.setY(outputpoint[0].y);
        console.log("old: ", e.mapPoint, "new: ", point);
        coordXnode.innerHTML = "X: " + point.getLongitude();
        coordYnode.innerHTML = "Y: " + point.getLatitude();
      });*/
      this.coordXnode.innerHTML = "X: " + e.mapPoint.x;
      this.coordYnode.innerHTML = "Y: " + e.mapPoint.y;
    }
  });
});

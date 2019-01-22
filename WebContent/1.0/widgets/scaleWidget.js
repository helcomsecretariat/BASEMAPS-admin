define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/on",
  "basemaps/js/ol",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dojo/text!./templates/scaleWidget.html"
], function(declare, lang, on, ol, _WidgetBase, _TemplatedMixin, template){
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
      this.map.getView().on("change", lang.hitch(this, function(evt) { 
    	   this.setScale();
      }));
    },
    setScale: function() {
    	var dpi = 72;
    	var unit = this.map.getView().getProjection().getUnits();
    	var resolution = this.map.getView().getResolution();
    	var inchesPerMetre = 39.37;
    	this.scalenode.innerHTML = "1 : " + Math.ceil(resolution * ol.proj.Units.METERS_PER_UNIT[unit] * inchesPerMetre * dpi).toLocaleString();
    }
      
  });
});

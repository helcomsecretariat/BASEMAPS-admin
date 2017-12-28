define([
  "dojo/_base/declare",
  "dojo/on",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/dom-construct",
  "dojo/dom-style",
  "mads/js/widgetIcon",
  "esri/request",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dojo/text!./templates/legendWidget.html"
], function(declare, on, lang, array, domConstruct, domStyle, widgetIcon, esriRequest, _WidgetBase, _TemplatedMixin, template){
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    baseClass: "legendWidget",
    widgetIcon: null,
    widgetPanel: null,
    map: null,
    legendInfo: null,
    visibleLayers: null,
    layerLegendSections: null,
    constructor: function(params) {
      this.widgetIcon = new widgetIcon({config: params.config, widgetPanel: params.widgetPanel, widget: this});
      this.widgetPanel = params.widgetPanel;
      this.map = params.map;
      this.legendInfo = {};
      this.visibleLayers = {};
      this.layerLegendSections = {};
    },
    postCreate: function() {
      this.getLegendInfo();

      array.forEach(this.map.layerIds, lang.hitch(this, function(layerId){
        if (layerId !== "Basemap") {
          var lyr = this.map.getLayer(layerId);

          // initialize visible layers
          this.visibleLayers[lyr.id] = lang.clone(lyr.visibleLayers);

          // create legend section for each service
          var legendSection = domConstruct.create("div", { "class": "legendSection" }, this.legendDiv, "last");
          this.layerLegendSections[lyr.id] = legendSection;

          // update legend when layer display is updated
          lyr.on("update-end", lang.hitch(this, function(e) {
            var service = e.target;
            // update just when sublayer visibility changes
            if (this.visibleLayers[service.id].length != service.visibleLayers.length) {
              // hide no legend label
              //document.getElementById("nolegendDIV").style.display = "none";
              // remove legend from appropriate section
              dojo.empty(this.layerLegendSections[lyr.id]);

              // create legend for each visible sublayer in service
              array.forEach(service.visibleLayers, lang.hitch(this, function(layerId){
                // sublayer name
                var label = domConstruct.create("div", { "class": "sublayerLabel" }, this.layerLegendSections[lyr.id], "last");
                label.innerHTML = this.legendInfo[lyr.id][layerId].name;
                // sublayer legend, create as many legend rows as required
                array.forEach(this.legendInfo[lyr.id][layerId].legend, lang.hitch(this, function(legendrec){
                  var legendRow = domConstruct.create("div", { "class": "legendRow" }, this.layerLegendSections[lyr.id], "last");
                  legendRow.innerHTML = legendrec.label;
                  var legendRowStyle = {
                    "background-image": 'url("'+lyr.url+'/'+layerId+'/images/' + legendrec.url+'")',
                    "line-height": legendrec.height+"px",
                    "padding-left": legendrec.width+5+"px",
                    "margin-bottom": "5px",
                    "margin-left": "5px"
                  };
                  domStyle.set(legendRow, legendRowStyle);
                }));
              }));
              this.visibleLayers[service.id] = lang.clone(service.visibleLayers);
            }
          }));
        }
      }));
    },

    // get all services layers legend info from rest
    getLegendInfo: function() {
      var requestHandle = null;
      // request legent for each layer (except Basemap)
      array.forEach(this.map.layerIds, lang.hitch(this, function(layerId){
        if (layerId !== "Basemap") {
          var lyr = this.map.getLayer(layerId);
          requestHandle = esriRequest({
            url: lyr.url+"/legend",
            content: { f: "json" },
            handleAs: "json",
            callbackParamName: "callback"
          });
          requestHandle.then(lang.hitch(this, function(response) {
            this.legendInfo[layerId] = [];
            array.forEach(response.layers, lang.hitch(this, function(layer){
              this.legendInfo[layerId][layer.layerId] = {name: layer.layerName, legend: layer.legend};
            }));

          }), lang.hitch(this, function(error) {
            console.log("Error. Can't get legend info for " + layerId + ". Error message: ", error.message);
          }));
        }
      }));
    }

  });
});

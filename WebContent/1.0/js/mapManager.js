define([
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/query!css3",
	"dojo/request",
	"dojo/_base/array",
	"dojo/on",
	"basemaps/js/leftPanel",
	"basemaps/js/utils",
	"widgets/scaleWidget",
	//"basemaps/js/ol",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/text!../templates/mapView.html"//,
	//"https://unpkg.com/@esri/arcgis-to-geojson-utils@1.3.0/dist/arcgis-to-geojson.js"
], function(
	declare, dom, domConstruct, lang, domStyle, query, request, array, on,
	leftPanel, utils, scaleWidget,
	//ol,
	_WidgetBase, _TemplatedMixin, template
) {
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "mapView",
		map: null,
		utils: null,
		// Layer list object (required for Identify)
		layerListObj: null,
		// store clicked location for displaying popup
		clickPoint: null,
		// graphic layer for identified point features
		selectedGraphics: null,
		currentExtent: null,
		scaleWidget: null,
		constructor: function(params){
			this.utils = new utils();
		},
		
		postCreate: function() {
						
			this.map = new ol.Map({
				target: "map",
				layers: [],
				//overlays: [this.popupOverlay],
				view: new ol.View({
					projection: 'EPSG:3857',
					center: [2290596.795329124, 8263216.845732588],
					zoom: 5
					//extent: ol.proj.transform([57.000000, 20.373333, 60.000000, 28.209038], 'EPSG:4326', 'EPSG:3857')
					//extent: [2267949.0925025064, 7760118.672726451, 3140215.762959987, 8399737.889636647]
				})
			});
			
			//var backgroundUrlJson = "https://maps.helcom.fi/arcgis/rest/services/MADS/Basemap_TOPO/MapServer?f=pjson";
			var backgroundUrlJson = "//maps.helcom.fi/arcgis/rest/services/MADS/Basemap_TOPO/MapServer?f=pjson";
			fetch(backgroundUrlJson)
				.then(lang.hitch(this, function(response) {
					return response.text();
				}))
				.then(lang.hitch(this, function(text) {
					var resp = JSON.parse(text);
					if (resp.error) {
						var bgrLayer = new ol.layer.Tile({
							source: new ol.source.OSM()
						});
						this.map.addLayer(bgrLayer);
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
					else {
						var bgrLayer = new ol.layer.Tile({
							id: "basemap",
							title: "Basemap TOPO",
							source: new ol.source.TileArcGISRest({
								//url: "https://maps.helcom.fi/arcgis/rest/services/MADS/Basemap_TOPO/MapServer"
								url: "//maps.helcom.fi/arcgis/rest/services/MADS/Basemap_TOPO/MapServer"
							})
						});
						this.map.addLayer(bgrLayer);
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
				}));
		
			/*var agsL = new ol.layer.Image({
		          source: new ol.source.ImageArcGISRest({
		            url: "https://maps.helcom.fi/arcgis/rest/services/MADS/Biodiversity/MapServer/300"
		          })
		        });
			this.map.addLayer(agsL);*/
			/*var arcgisLayer = new ol.layer.Image({
		          source: new ol.source.ImageArcGISRest({
		              url: "http://62.236.121.188/arcgis104/rest/services/PBS126/MspOutputData/MapServer"
		            })
		          });*/
			/*var mspwms = new ol.layer.Tile({
				source: new ol.source.TileWMS({
					url: "http://62.236.121.188/arcgis104/services/PBS126/MspOutputData/MapServer/WMSServer",
					params: {
						LAYERS: "PositiveSeaUse",
						CRS: "EPSG:3857"
					}
				})
			});*/
			
						
			/*this.map.on('singleclick', lang.hitch(this, function(evt) {
				if (this.layerListObj.layerListMode == "INPUT") {
					this.cleanHighlight();
					var popupCoordinate = evt.coordinate;
					var viewResolution = this.map.getView().getResolution();
					var viewProjection = this.map.getView().getProjection();
									
					var layers = this.map.getLayers().getArray();
					this.mapsLayersCount = 0;
					for (var i = layers.length-1; i > 0; i--) {
						//if ((layers[i].getProperties().id != "basemap") && (layers[i].getProperties().id != "highlight") && (!("mspName" in layers[i].getProperties())) && (layers[i].getVisible())) {
						if (("wmsId" in layers[i].getProperties()) && (layers[i].getVisible())) {
							this.mapsLayersCount = this.mapsLayersCount + 1;
						}
					}
					
					this.layersCounter = 0;
					this.identifyResults = [];
					for (var i = layers.length-1; i > 0; i--) {
						//if ((layers[i].getProperties().id != "basemap") && (layers[i].getProperties().id != "highlight") && (!("mspName" in layers[i].getProperties()))&& (!("agsId" in layers[i].getProperties())) && (layers[i].getVisible())) {
						if (("wmsId" in layers[i].getProperties()) && (layers[i].getVisible())) {
							var infoFormat = "application/json";
							var u = layers[i].getSource().getGetFeatureInfoUrl(popupCoordinate, viewResolution, viewProjection, {"buffer": 10, "INFO_FORMAT": ""});
							this.getInfo(layers[i].getProperties().wmsId, u, popupCoordinate, layers[i].getProperties().name);
						}
					}
					
					query(".metadataBox").forEach(function(node){
						domStyle.set(node, {"display": "none"});
					});
				}
			}));*/
			
			var mapNode = dom.byId("map");
			domConstruct.place(mapNode, this.domNode, "first");
			// create layer list
			this.layerListObj = new leftPanel({map: this.map}).placeAt(this.leftPanelContainer);
			this.scaleWidget = new scaleWidget({map: this.map}).placeAt(this.scaleContainer);
			this.scaleWidget.setScale();
    },
    
    show: function(open) {
		domStyle.set(this.domNode, "display", open ? "block" : "none");
	}	
  });
});

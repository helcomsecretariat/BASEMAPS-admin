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
					//center: [2290596.795329124, 8263216.845732588],
					center: [1790596.795329124, 8263216.845732588],
					zoom: 5,
					minZoom: 4,
					maxZoom: 15
					//extent: ol.proj.transform([57.000000, 20.373333, 60.000000, 28.209038], 'EPSG:4326', 'EPSG:3857')
					//extent: [2267949.0925025064, 7760118.672726451, 3140215.762959987, 8399737.889636647]
				})
			});
			
			const accessToken = "AAPTxy8BH1VEsoebNVZXo8HurAZRW-5WHQwcmlZdnjgV2ewu9sxJJWrzci1pC6jrh3VQvB6srE2z1RJnWNe3cHnu-Um1cx8Z_c02NiGitPa8T25YiKQbiCWwUbSSYzxYF2sY8OLtv1gVYAabgg-Rjohn1CB9ciWxsf6staa6th83mwOWiP3FEtXjNioIg9H_pW5bcSxWL2-noLr2DhOQJiAVRA..AT1_Tn5UV0YI";
			const basemapId = "arcgis/light-gray";
			const basemapURL = `https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/${basemapId}?token=${accessToken}`;
			
			fetch(basemapURL)
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
						olms.apply(this.map, basemapURL);
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
				}));
			
			var backgroundUrlJson = "https://maps.helcom.fi/arcgis/rest/services/MADS/Basemap_TOPO/MapServer?f=pjson";
			/*fetch(backgroundUrlJson)
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
								url: "https://maps.helcom.fi/arcgis/rest/services/MADS/Basemap_TOPO/MapServer"
							})
						});
						//var bgrLayer = new ol.layer.Tile({
						//	id: "basemap",
						//	title: "Basemap TOPO",
						//	source: new ol.source.StadiaMaps({
						//		layer: 'stamen_toner_lite',
        				//		retina: true
						//	})
						//});
						this.map.addLayer(bgrLayer);
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
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

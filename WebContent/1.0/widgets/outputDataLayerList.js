define([
	"dojo/_base/declare",
	"dojo/_base/lang", "dojo/_base/fx", 
	"dojo/_base/window",
	"dojo",
	"dojo/on",
	"dojo/dom",
	"dojo/dom-style",
	"dojo/request",
	"dojo/_base/array", "dojo/dom-construct",  "dojo/query!css3",
	"dojox/validate/web",
	"dojo/store/Memory","dijit/tree/ObjectStoreModel", "dijit/Tree", "dijit/form/FilteringSelect",
	"dojo/data/ItemFileReadStore",
	"dijit/form/CheckBox", "dijit/Tooltip",
	"dojox/widget/TitleGroup", "dijit/TitlePane", 
	"dijit/layout/AccordionContainer", "dijit/layout/ContentPane", "dijit/form/Select",
	"dojox/gfx",
	"widgets/servicePanelWidget",
	"basemaps/js/utils",
	//"basemaps/js/ol",
	//"basemaps/js/ol-ext",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin",
	"dojo/text!./templates/outputDataLayerList.html"
	//"dojo/text!../templates/layerlistWidget.html"
], function(
	declare,
	lang, baseFx, 
	win,
	dojo,
	on,
	dom,
	domStyle,
	request,
	array, domConstruct, query,
	validate,
	Memory, ObjectStoreModel, Tree, FilteringSelect,
	ItemFileReadStore,
	checkBox, Tooltip,
	TitleGroup, TitlePane,
	AccordionContainer, ContentPane, Select,
	gfx,
	servicePanelWidget,
	utils,
	//ol,
	//olExt,
	_WidgetBase, _TemplatedMixin, template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "layerlistWidget",
		utils: null,
		map: null,
		layerListMode: null,
		mspWmsUrl: "https://maps.helcom.fi/arcgis/services/PBS126/MspOutputData/MapServer/WMSServer",
		mspTree: null,
		mspStore: null,
		mspData: [{id: 'msplayerlist', checked: true}],
		mspArcgisLayers: null,
		mspAllParentsChecked: false,
		mspGetCapabilitiesFetched: false,
		mspArcgisRestFetched: false,
		mspDisplayedWmsArray: [],
		mspViewAccordion: null,
		mspViewAccordionPanes: {},
		mspFilteringAccordion: null,
		mspFilteringUses: [],
		mspParamsArray: [],
		mspFillStyles: {},
		mspFilteringHideAllAvailable: false,
		mspCountourStyles: {},
		mspDistinctCodesCount: 0,
		mspDisplayLayer: null,
		mspHighlightLayer: null,
		//mspFeaturesUrl: null,
		mspIdentifyResults: [],
		mspIdentifyNr: null,
		mspExcludeProperties: ["objectid", "objectid_1", "shape", "plan id", "symbol", "shape_length", "shape_area"],
		mspPropertiesList: {
			//"OBJECTID": "OBJECTID",
			"priority_info": "Priority sea use", 
			"reserved_info": "Reserved sea use",
			"allowed_info": "Allowed sea use", 
			"restricted_info": "Restricted sea use",
			"forbidden_info": "Forbidden sea use", 
			"useDsc": "Use description",
			"area": "Area (sq km)"
		},
		rootMspLayerId: "msplayerlist",
		servicePanel: null,
		constructor: function(params) {
			this.map = params.map;
			this.servicePanel = params.sp;
			this.utils = new utils();
		},

		postCreate: function() {
			this.setMspMapLayers();
			this.setupMspViewAccordion();
			
			this.map.on('singleclick', lang.hitch(this, function(evt) {
				var layers = this.map.getLayers().getArray();
				var identifyUrl = null;
				if (this.layerListMode == "OUTPUT_PSU") {
					array.some(this.mspParamsArray, lang.hitch(this, function(mspParams) {
						if ((mspParams.useType != null) && (mspParams.agsLayer != null)) {
							if (mspParams.allWmsLayer.getVisible()) {
								identifyUrl = "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/identify?f=pjson&geometryType=esriGeometryPoint&tolerance=3&imageDisplay=1920%2C+647%2C+96&returnGeometry=true&layers=all:";
								return false;
							}
						}	
					}));
					if (identifyUrl != null) {
						array.forEach(this.mspParamsArray, lang.hitch(this, function(mspParams, i) {
							if ((mspParams.useType != null) && (mspParams.agsLayer != null)) {
								if (mspParams.allWmsLayer.getVisible()) {
									identifyUrl += mspParams.agsLayer + ",";
								}
							}
						}));
						identifyUrl = identifyUrl.slice(0, -1) + "&geometry=";
						
						var clickLonLat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
						identifyUrl += clickLonLat + "&mapExtent=";
						
						var mapExtent = ol.proj.transformExtent(this.map.getView().calculateExtent(), 'EPSG:3857', 'EPSG:4326');
						identifyUrl += mapExtent;
												
						domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
						var url = "sc/tools/get-data";
						var data = {
							"url": identifyUrl,
							"format": "json"
						};
						request.post(url, this.utils.createPostRequestParams(data)).then(
							lang.hitch(this, function(response) {
								if (response.type == "error") {
									console.log("Identifying MSP REST failed", response);
									domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
								}
								else if (response.type == "success") {
									if (response.item) {
										this.mspIdentifyResults = [];
										this.mspIdentifyNr = null;
										array.forEach(response.item.results, lang.hitch(this, function(arcgisResult) {
											var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(arcgisResult);
											gjson.layerName = arcgisResult.layerName;
											this.mspIdentifyResults.push(gjson);
										}));
										if (this.mspIdentifyResults.length > 0) {
											this.mspIdentifyNr = 0;
											this.setMspPopupContent();
										}
									}
									domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
								}
							}),
							lang.hitch(this, function(error) {
								console.log(error);
							})
						);
					}
					
				}
				else {
					array.forEach(layers, lang.hitch(this, function(layer, i) {
						if (("identify" in layer.getProperties()) && (layer.getVisible())) {
							identifyUrl = layer.getProperties().identify;
						}
					}));
					if (identifyUrl != null) {
						if (this.layerListMode == "OUTPUT_AREA") {
							
							var clickLonLat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
							identifyUrl += clickLonLat + "&mapExtent=";
							
							var mapExtent = ol.proj.transformExtent(this.map.getView().calculateExtent(), 'EPSG:3857', 'EPSG:4326');
							identifyUrl += mapExtent;
												
							domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
							var url = "sc/tools/get-data";
							console.log(identifyUrl);
							var data = {
								"url": identifyUrl,
								"format": "json"
							};
							request.post(url, this.utils.createPostRequestParams(data)).then(
								lang.hitch(this, function(response) {
									if (response.type == "error") {
										console.log("Identifying MSP AREA failed", response);
										domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
									}
									else if (response.type == "success") {
										if (response.item) {
											this.mspIdentifyResults = [];
											this.mspIdentifyNr = null;
											console.log("response.item", response.item);
											array.forEach(response.item.results, lang.hitch(this, function(arcgisResult) {
												var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(arcgisResult);
												gjson.layerName = arcgisResult.layerName;
												this.mspIdentifyResults.push(gjson);
											}));
											if (this.mspIdentifyResults.length > 0) {
												console.log("this.mspIdentifyResults", this.mspIdentifyResults);
												this.mspIdentifyNr = 0;
												this.setMspPopupContent();
											}
										}
										domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
									}
								}),
								lang.hitch(this, function(error) {
									console.log(error);
								})
							);
						}
						else if (this.layerListMode == "OUTPUT_FILTER_ALL") {
							var mspPopupCoordinate = evt.coordinate;
							var clickLonLat = ol.proj.transform(mspPopupCoordinate, 'EPSG:3857', 'EPSG:4326');
							identifyUrl += "&geometry=" + clickLonLat + "&mapExtent=";
							
							var mapExtent = ol.proj.transformExtent(this.map.getView().calculateExtent(), 'EPSG:3857', 'EPSG:4326');
							identifyUrl += mapExtent;
												
							domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
							var url = "sc/tools/get-data";
							var data = {
								"url": identifyUrl,
								"format": "json"
							};
							request.post(url, this.utils.createPostRequestParams(data)).then(
								lang.hitch(this, function(response) {
									if (response.type == "error") {
										console.log("Identifying MSP REST failed", response);
										domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
									}
									else if (response.type == "success") {
										if (response.item) {
											this.mspIdentifyResults = [];
											this.mspIdentifyNr = null;
											array.forEach(response.item.results, lang.hitch(this, function(arcgisResult) {
												var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(arcgisResult);
												gjson.layerName = arcgisResult.layerName;
												this.mspIdentifyResults.push(gjson);
											}));
											if (this.mspIdentifyResults.length > 0) {
												this.mspIdentifyNr = 0;
												this.setMspPopupContent();
											}
										}
										domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
									}
								}),
								lang.hitch(this, function(error) {
									console.log(error);
								})
							);
						}
						else if (this.layerListMode == "OUTPUT") {
							this.cleanMspHighlight();
							var mspLayersIds = [];
							var mapLayers = this.map.getLayers().getArray();
							for (var i = 0; i < mapLayers.length; i++) {
								// get only visible MSP layers
								if ((mapLayers[i].getProperties().mspName) && (mapLayers[i].getVisible())) {
									// find arcgis layer id for identification
									var r = this.mspArcgisLayers.filter(obj => {
										return obj.name === mapLayers[i].getProperties().mspName
									})
									identifyUrl += r[0].id + ","
								}
							}
							identifyUrl = identifyUrl.slice(0, -1) + "&geometry=";
							
							var mspPopupCoordinate = evt.coordinate;
							var clickLonLat = ol.proj.transform(mspPopupCoordinate, 'EPSG:3857', 'EPSG:4326');
							identifyUrl += clickLonLat + "&mapExtent=";
							
							var mapExtent = ol.proj.transformExtent(this.map.getView().calculateExtent(), 'EPSG:3857', 'EPSG:4326');
							identifyUrl += mapExtent;
												
							domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
							var url = "sc/tools/get-data";
							var data = {
								"url": identifyUrl,
								"format": "json"
							};
							request.post(url, this.utils.createPostRequestParams(data)).then(
								lang.hitch(this, function(response) {
									if (response.type == "error") {
										console.log("Identifying MSP REST failed", response);
										domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
									}
									else if (response.type == "success") {
										if (response.item) {
											this.mspIdentifyResults = [];
											this.mspIdentifyNr = null;
											array.forEach(response.item.results, lang.hitch(this, function(arcgisResult) {
												var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(arcgisResult);
												gjson.layerName = arcgisResult.layerName;
												this.mspIdentifyResults.push(gjson);
											}));
											if (this.mspIdentifyResults.length > 0) {
												this.mspIdentifyNr = 0;
												this.setMspPopupContent();
											}
										}
										domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
									}
								}),
								lang.hitch(this, function(error) {
									console.log(error);
								})
							);
							
						}
						else if (this.layerListMode == "OUTPUT_FILTER") {
							this.cleanMspHighlight();
							if (this.mspDisplayLayer.getSource() == null) {
								identifyUrl = null;
							}
							if (identifyUrl != null) {
								//var identifyUrl = this.mspFeaturesUrl;
								var mspPopupCoordinate = evt.coordinate;
								var clickLonLat = ol.proj.transform(mspPopupCoordinate, 'EPSG:3857', 'EPSG:4326');
								identifyUrl += "&geometryType=esriGeometryPoint&geometry=" + clickLonLat + "&spatialRel=esriSpatialRelIntersects&distance=2&units=esriSRUnit_Kilometer&outFields=*";
								
								domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
								var url = "sc/tools/get-data";
								var data = {
									"url": identifyUrl,
									"format": "json"
								};
								request.post(url, this.utils.createPostRequestParams(data)).then(
									lang.hitch(this, function(response) {
										if (response.type == "error") {
											console.log("Identifying MSP Feature failed", response);
											domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
										}
										else if (response.type == "success") {
											if (response.item) {
												this.mspIdentifyResults = [];
												this.mspIdentifyNr = null;
												var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(response.item);
												array.forEach(gjson.features, lang.hitch(this, function(f) {
													this.mspIdentifyResults.push(f);
												}));
												if (this.mspIdentifyResults.length > 0) {
													this.mspIdentifyNr = 0;
													this.setMspPopupContent();
												}
											}
											domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
										}
									}),
									lang.hitch(this, function(error) {
										console.log(error);
									})
								);
							}			
						}
					}
				}
				
			}));
		},
		
		hideAllLayers: function() {
			this.cleanMspHighlight();
			this.mspDisplayLayer.setSource(null);
			array.forEach(this.mspParamsArray, lang.hitch(this, function(mspParams) {
				if (mspParams.allWmsLayer != null) {
					mspParams.allWmsLayer.setVisible(false);
				}
			}));
			
			for (var property in this.mspViewAccordionPanes) {
				if (this.mspViewAccordionPanes.hasOwnProperty(property)) {
					this.mspViewAccordionPanes[property].set("open", false);
				}
			}	
			
			array.forEach(this.mspDisplayedWmsArray, lang.hitch(this, function(wms) {
				wms.setVisible(false);
			}));
			this.mspDisplayedWmsArray = [];
		},
		
		getMspLayersData: function() {
			var serviceUrl = "sc/tools/get-data";
			var servicedata = {
				"url": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MspOutputData/MapServer?f=pjson",
				"format": "json"
			};
			request.post(serviceUrl, this.utils.createPostRequestParams(servicedata)).then(
				lang.hitch(this, function(response) {
					this.layersCounter = this.layersCounter + 1;
					if (response.type == "error") {
						console.log("Reading MSP REST failed", response);
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
					else if (response.type == "success") {
						if (response.item) {
							this.mspArcgisRestFetched = true;
							console.log("REST fetched");
							if (this.mspGetCapabilitiesFetched) {
								domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
							}
							this.mspArcgisLayers = response.item.layers;
						}
					}
				}),
				lang.hitch(this, function(error) {
					console.log(error);
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				})
			);
						
			var mspGetCapabilitiesParser = new ol.format.WMSCapabilities();
			var mspGetCapabilitiesUrl = this.mspWmsUrl + "?request=GetCapabilities&service=WMS";
			
			servicedata = {
				"url": mspGetCapabilitiesUrl,
				"format": "xml"
			};
			request.post(serviceUrl, this.utils.createPostRequestParams(servicedata)).then(
				lang.hitch(this, function(response) {
					this.layersCounter = this.layersCounter + 1;
					if (response.type == "error") {
						console.log("Reading WMS failed", response);
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
					else if (response.type == "success") {
						if (response.item) {
							this.mspGetCapabilitiesFetched = true;
							console.log("WMS fetched");
							if (this.mspArcgisRestFetched) {
								domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
							}
							var result = mspGetCapabilitiesParser.read(response.item);
							this.createMspTree(result.Capability.Layer);
						}
					}
				}),
				lang.hitch(this, function(error) {
					console.log(error);
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				})
			);
		},
		
		setupMspViewAccordion: function() {
			this.mspViewAccordion = new TitleGroup({style:"width: 380px"}, this.mspFilterContainer);
			this.mspViewAccordion.startup();
			this.setupMspParams();		
			this.setupPane1();
			this.setupPane2();
			this.setupPane3();
		},
		
		setupMspParams: function() {
			this.mspParamsArray.push({
				"useType": null,
				"title": "All Sea Use Types",
				"allUrl": null,
				"allLayerName": null,
				"allLegendUrl": null,
				"allWmsLayer": null,
				"agsLayer": 5,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/5",
				"distinctUses": [],
				"distinctValues": [],
				"filteringData": [],
				"tree": null,
				"titlePane": null
			}, {
				"useType": "priority",
				"title": "Priority Sea Use",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WMSServer",
				"allLayerName": "Priority Use",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Priority Use",
				"allWmsLayer": null,
				"agsLayer": 0,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/0",
				"distinctUses": [],
				"distinctValues": [],
				"filteringData": [],
				"tree": null,
				"titlePane": null,
				"psuCheckbox": null
			}, {
				"useType": "reserved",
				"title": "Reserved Sea Use",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WMSServer",
				"allLayerName": "Reserved Use",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Reserved Use",
				"allWmsLayer": null,
				"agsLayer": 1,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/1",
				"distinctUses": [],
				"distinctValues": [],
				"filteringData": [],
				"tree": null,
				"titlePane": null,
				"psuCheckbox": null
			}, {
				"useType": "allowed",
				"title": "Allowed Sea Use",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WMSServer",
				"allLayerName": "Allowed Use",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Allowed Use",
				"allWmsLayer": null,
				"agsLayer": 2,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/2",
				"distinctUses": [],
				"distinctValues": [],
				"filteringData": [],
				"tree": null,
				"titlePane": null,
				"psuCheckbox": null
			}, {
				"useType": "restricted",
				"title": "Restricted Sea Use",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WMSServer",
				"allLayerName": "Restricted Use",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Restricted Use",
				"allWmsLayer": null,
				"agsLayer": 3,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/3",
				"distinctUses": [],
				"distinctValues": [],
				"filteringData": [],
				"tree": null,
				"titlePane": null,
				"psuCheckbox": null
			}, {
				"useType": "forbidden",
				"title": "Forbidden Sea Use",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WMSServer",
				"allLayerName": "Forbidden Use",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Forbidden Use",
				"allWmsLayer": null,
				"agsLayer": 4,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/4",
				"distinctUses": [],
				"distinctValues": [],
				"filteringData": [],
				"tree": null,
				"titlePane": null,
				"psuCheckbox": null
			});
		},
		
		setupPane1: function() {
			this.mspViewAccordionPanes.tp1 = new TitlePane({ open: false, title: "Plan Area", id: "tp1" });
			this.mspViewAccordion.addChild(this.mspViewAccordionPanes.tp1);
			
			var legendContainerDiv = domConstruct.create("div", { }, this.mspViewAccordionPanes.tp1.containerNode, "last");
			var image = domConstruct.create('img', {
				"src": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Maritime Spatial Plan Areas"
			}, legendContainerDiv);
			
			var areasLayer = null;
			
			on(this.mspViewAccordionPanes.tp1, "show", lang.hitch(this, function() {
				if (areasLayer == null) {
					areasLayer = new ol.layer.Tile({
						type: "msp_output",
						identify: "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/identify?f=pjson&geometryType=esriGeometryPoint&tolerance=3&imageDisplay=1920%2C+647%2C+96&returnGeometry=true&layers=all:6&geometry=",
						source: new ol.source.TileWMS({
							url: "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer",
							params: {
								LAYERS: "Maritime Spatial Plan Areas"
							}
						})
					});
					this.map.addLayer(areasLayer);
					areasLayer.setVisible(true);
				}
				else {
					areasLayer.setVisible(true);
				}
				this.layerListMode = "OUTPUT_AREA";
				this.servicePanel.header = "MSP Plan Area";
			}));
			
			on(this.mspViewAccordionPanes.tp1, "hide", lang.hitch(this, function() {
				if (areasLayer != null) {
					areasLayer.setVisible(false);
				}
				this.cleanMspHighlight();
			}));
			
		},
		
		setupPane3: function() {
			this.mspViewAccordionPanes.tp3 = new TitlePane({ open: false, title: "Query Planned Sea Uses", id: "tp3"  });
			this.mspViewAccordion.addChild(this.mspViewAccordionPanes.tp3);
			
			this.mspFilteringAccordion = new TitleGroup({style:"width: 350px"}, this.mspViewAccordionPanes.tp3.containerNode);
			this.mspFilteringAccordion.startup();
							
			this.mspFillStyles = {
				"aquaculture": {
					"rgb": "rgba(190, 255, 232, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"coast": {
					"rgb": "rgba(215, 215, 158, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"extraction": {
					"rgb": "rgba(215, 176, 158, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"fishing": {
					"rgb": "rgba(190, 232, 255, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"general": {
					"rgb": "rgba(100, 100, 100, 1)",
					"pattern": "tile",
					"size": 2,
					"spacing": 8,
					"angle": 0
				},
				"heritage": {
					"rgb": "rgba(245, 202, 122, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"installations": {
					"rgb": "rgba(255, 190, 190, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"line": {
					"rgb": "rgba(232, 190, 255, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"military": {
					"rgb": "rgba(156, 156, 156, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"nature": {
					"rgb": "rgba(165, 245, 122, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"other": {
					"rgb": "rgba(178, 178, 178, 1)",
					"pattern": "cross",
					"size": 1,
					"spacing": 10,
					"angle": 0
				},
				"research": {
					"rgb": "rgba(233, 255, 190, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"tourism": {
					"rgb": "rgba(255, 255, 190, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"transport": {
					"rgb": "rgba(115, 178, 255, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},
				"multiuse": {
					"rgb": "rgba(230, 0, 0, 1)",
					"pattern": "hatch",
					"size": 2,
					"spacing": 8,
					"angle": 45
				},				
			};
			
			this.mspCountourStyles = {
				"priority": "rgba(197, 0, 255, 1)",
				"reserved": "rgba(0, 112, 255, 1)",
				"allowed": "rgba(76, 230, 0, 1)",
				"restricted": "rgba(255, 170, 0, 1)",
				"forbidden": "rgba(255, 0, 0, 1)",
			};
			
			array.forEach(this.mspParamsArray, lang.hitch(this, function(mspParams, i) {
				if (mspParams.filterUrl != null) {
					this.createMspFilteringCp(i);
				}
			}));
			
			array.forEach(this.mspParamsArray, lang.hitch(this, function(mspParams, i) {
				if ((mspParams.filterUrl != null) && (mspParams.useType != null)) {
					this.getDistinctMspCodes(i);
				}
			}));
						
			on(this.mspViewAccordionPanes.tp3, "show", lang.hitch(this, function() {
				this.layerListMode = "OUTPUT_FILTER";
			}));
			
			on(this.mspViewAccordionPanes.tp3, "hide", lang.hitch(this, function() {
				array.forEach(this.mspParamsArray, lang.hitch(this, function(mspParams) {	
					if (mspParams.titlePane != null) {
						mspParams.titlePane.set("open", false);
					}
				}));
			}));
		},
		
		setupPane2: function() {
			this.mspViewAccordionPanes.tp2 = new TitlePane({ open: false, title: "View Planned Sea Uses", id: "tp2" });
			this.mspViewAccordion.addChild(this.mspViewAccordionPanes.tp2);
						
			for (var i = this.mspParamsArray.length-1; i >= 0; i--) {
				if (this.mspParamsArray[i].useType != null) {
					this.createPlannedSeaUseLayer(i);
				}
			}
			
			var legendContainerDiv = domConstruct.create("div", { "class": "psuLegend" }, this.mspViewAccordionPanes.tp2.containerNode, "last");
						
			on(this.mspViewAccordionPanes.tp2, "show", lang.hitch(this, function() {
				for (var i = this.mspParamsArray.length-1; i >= 0; i--) {
					if ((this.mspParamsArray[i].useType != null) && (this.mspParamsArray[i].psuCheckbox != null)) {
						this.mspParamsArray[i].psuCheckbox.set("checked", true);
					}
				}
				
				this.layerListMode = "OUTPUT_PSU"; 
			}));
			
			on(this.mspViewAccordionPanes.tp2, "hide", lang.hitch(this, function() {
				array.forEach(this.mspParamsArray, lang.hitch(this, function(mspParams, i) {
					if ((mspParams.useType != null) && (mspParams.psuCheckbox != null)) {
						mspParams.psuCheckbox.set("checked", false);
					}
				}));
			}));
			
		},
		
		/*setupWmsLayer: function(nr) {
			console.log("setup", this.mspParamsArray[nr]);
			this.mspParamsArray[nr].allWmsLayer = new ol.layer.Tile({
				id: this.mspParamsArray[nr].title.replace(/\s+/g, ''),
				type: "msp_output",
				identify: "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/identify?f=pjson&geometryType=esriGeometryPoint&tolerance=3&imageDisplay=1920%2C+647%2C+96&returnGeometry=true&layers=all:",
				source: new ol.source.TileWMS({
					url: this.mspParamsArray[nr].allUrl,
					params: {
						LAYERS: this.mspParamsArray[nr].allLayerName
					}
				})
			});
			this.map.addLayer(this.mspParamsArray[nr].allWmsLayer);
		},*/
		
		createPlannedSeaUseLayer: function(nr) {
			var psuContainer = domConstruct.create("div", {}, this.mspViewAccordionPanes.tp2.containerNode, "first");
			this.mspParamsArray[nr].psuCheckbox = new dijit.form.CheckBox();
			this.mspParamsArray[nr].psuCheckbox.placeAt(psuContainer, "first");
			var psuLabel = domConstruct.create("span", {"innerHTML": this.mspParamsArray[nr].title, "style": "margin-top: 5px;"}, psuContainer, "last");
						
			on(this.mspParamsArray[nr].psuCheckbox, "change", lang.hitch(this, function(checked) {
				if (checked) {
					if (this.mspParamsArray[nr].allWmsLayer == null) {
						this.mspParamsArray[nr].allWmsLayer = new ol.layer.Tile({
							id: this.mspParamsArray[nr].title.replace(/\s+/g, ''),
							type: "msp_output",
							identify: "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/identify?f=pjson&geometryType=esriGeometryPoint&tolerance=3&imageDisplay=1920%2C+647%2C+96&returnGeometry=true&layers=all:",
							source: new ol.source.TileWMS({
								url: this.mspParamsArray[nr].allUrl,
								params: {
									LAYERS: this.mspParamsArray[nr].allLayerName
								}
							})
						});
						this.map.addLayer(this.mspParamsArray[nr].allWmsLayer);
						this.mspParamsArray[nr].allWmsLayer.setVisible(true);
					}
					else {
						this.mspParamsArray[nr].allWmsLayer.setVisible(true);
					}
				}
				else {
					this.mspParamsArray[nr].allWmsLayer.setVisible(false);
					this.cleanMspHighlight();
				}
			}));
		},
		
		getDistinctMspCodes: function(nr) {
			var serviceUrl = "sc/tools/get-data";
			var url = this.mspParamsArray[nr].filterUrl + "/query?where=1%3D1&outFields=" + this.mspParamsArray[nr].useType + "," + this.mspParamsArray[nr].useType + "_info," + this.mspParamsArray[nr].useType + "_symbol&returnGeometry=false&returnDistinctValues=true&orderByFields=" + this.mspParamsArray[nr].useType + "&f=pjson";
			var servicedata = {
				"url": url,
				"format": "json"
			};
			request.post(serviceUrl, this.utils.createPostRequestParams(servicedata)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log("Getting MSP distinct codes for " + this.mspParamsArray[nr].useType + " failed", response);
						//domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
					else if (response.type == "success") {
						if (response.item) {
							this.mspDistinctCodesCount += 1;
							array.forEach(response.item.features, lang.hitch(this, function(feature) {
								if (feature.attributes[this.mspParamsArray[nr].useType+"_info"] != null) {
									if (!(this.mspParamsArray[nr].distinctValues.includes(feature.attributes[this.mspParamsArray[nr].useType].trim()))) {
										this.mspParamsArray[nr].distinctValues.push(feature.attributes[this.mspParamsArray[nr].useType].trim());
										var rec = {
											"label": feature.attributes[this.mspParamsArray[nr].useType+"_info"],
											"value": feature.attributes[this.mspParamsArray[nr].useType]
										};
										this.mspParamsArray[nr].distinctUses.push(rec);
									}
									
									if (!(this.mspParamsArray[0].distinctValues.includes(feature.attributes[this.mspParamsArray[nr].useType].trim()))) {
										this.mspParamsArray[0].distinctValues.push(feature.attributes[this.mspParamsArray[nr].useType].trim());
										var rec0 = {
											"label": feature.attributes[this.mspParamsArray[nr].useType+"_info"],
											"value": feature.attributes[this.mspParamsArray[nr].useType]
										};
										this.mspParamsArray[0].distinctUses.push(rec0);
									}
								}
							}));
							this.createFilteringTreeData(nr);
							if (this.mspDistinctCodesCount == 5) {
								this.createFilteringTreeData(0);
							}
						}
					}
				}),
				lang.hitch(this, function(error) {
					console.log(error);
					//domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				})
			);
		},
		createFilteringTreeData: function(nr) {
			var idSec = 0;
			var currentId = 0;
			array.forEach(this.mspParamsArray[nr].distinctUses, lang.hitch(this, function(use) {
				
				var index = -1;
				array.forEach(this.mspParamsArray[nr].filteringData, lang.hitch(this, function(data, i) {
					if (data.id == use.value.split("-")[0] + "_parent") {
						index = i;
					}
				}));
				
				if (index > -1) {
					var rec = {
						label: use.label,
						id: use.value,
						level: 2
					};
					this.mspParamsArray[nr].filteringData[index].children.push(rec);
				}
				else {
					var rec = {
						label: use.value.split("-")[0],
						id: use.value.split("-")[0] + "_parent",
						level: 1,
						children: [
							{
								label: use.label,
								id: use.value,
								level: 2
							}
						]
					};
					this.mspParamsArray[nr].filteringData.push(rec);
				}
			}));
			this.setupMspFilteringCp(nr);
		},
		
		createMspFilteringCp: function(nr) {
			if (nr == 0) {
				this.mspParamsArray[nr].titlePane = new TitlePane({ open: true, title: this.mspParamsArray[nr].title });
			}
			else {
				this.mspParamsArray[nr].titlePane = new TitlePane({ open: false, title: this.mspParamsArray[nr].title });
			}
			
			this.mspFilteringAccordion.addChild(this.mspParamsArray[nr].titlePane);
		},
		
		setupMspFilteringCp: function(nr) {
			var cpContent = domConstruct.create("div", {}, this.mspParamsArray[nr].titlePane.containerNode, "last");
			
			var expandAllButton = domConstruct.create("div", {"class": "toolLink", "style": "margin-top: 10px; display: inline-block;", "innerHTML": "Expand all"}, cpContent, "last");
			var collapseAllButton = domConstruct.create("div", {"class": "toolLink", "style": "margin-top: 10px; margin-left: 15px; display: inline-block;", "innerHTML": "Collapse all"}, cpContent, "last");	
			var hideAllButton = domConstruct.create("div", {"class": "toolLink", "style": "margin-top: 10px; margin-left: 15px; display: inline-block;", "innerHTML": "Hide all"}, cpContent, "last");
			var zoomAllButton = domConstruct.create("div", {"class": "toolLink", "style": "margin-top: 10px; margin-left: 15px; display: inline-block;", "innerHTML": "Zoom to"}, cpContent, "last");
			
			on(expandAllButton, "click", lang.hitch(this, function() {
				this.mspParamsArray[nr].tree.expandAll();
			}));
			
			on(collapseAllButton, "click", lang.hitch(this, function() {
				this.mspParamsArray[nr].tree.collapseAll();
			}));
			
			on(hideAllButton, "click", lang.hitch(this, function() {
				this.hideAllFiltering(nr);
			}));
			
			on(zoomAllButton, "click", lang.hitch(this, function() {
				var source = this.mspDisplayLayer.getSource();
				if (source != null) {
					var extent = source.getExtent();
					this.map.getView().fit(extent, this.map.getSize());
				}
			}));
			
			if (nr == 0) {
				domConstruct.create("div", {"class": "legendAllUsesQuery"}, cpContent, "last");
			}
			
			var treeContainer = domConstruct.create("div", {}, cpContent, "last");
							
			var store = new ItemFileReadStore({
				data: {
					identifier: "id",
					label: "label",
					items: this.mspParamsArray[nr].filteringData
				}
			});
			var that = this;
			//var treeControl = new dijit.Tree({
			this.mspParamsArray[nr].tree = new dijit.Tree({
				store: store,
			    showRoot: false,
			    getNodeFromItem: function (id) {
			    	return this._itemNodesMap[ id ][0];
			    },
			    _createTreeNode: function(args) {
			    	var tnode = new dijit._TreeNode(args);
			    	tnode.labelNode.innerHTML = args.label;

			    	domStyle.set(tnode.labelNode, {"font-size": "12px"});
			    	domConstruct.destroy(tnode.iconNode);
			    	if (tnode.item.level == 1) {
			    		domStyle.set(tnode.labelNode, {"font-weight": "bold"});
			    		
			    		var styleInfo = that.mspFillStyles[tnode.item.label];
			    		var fPat = new ol.style.FillPattern({
							pattern: styleInfo.pattern,
							ratio: 1,
							color: styleInfo.rgb,
							offset: 0,
							scale: 1,
							size: styleInfo.size,
							spacing: styleInfo.spacing,
							angle: styleInfo.angle
						});
						
			    		if (nr > 0) {
			    			var metadataButton = domConstruct.create("div", { "class": "legendIconQuery", "style": "background-image: url('" + fPat.getImage().toDataURL() +"'); border: 1px solid " + that.mspCountourStyles[that.mspParamsArray[nr].useType] }, tnode.contentNode, "last");
			    		}
			    		else {
			    			var metadataButton = domConstruct.create("div", { "class": "legendIconQuery", "style": "background-image: url('" + fPat.getImage().toDataURL() +"')" }, tnode.contentNode, "last");
			    		}
			    		
			    	}
			    	if (tnode.item.level == 2) {
			    		domConstruct.destroy(tnode.expandoNode);
			    		domStyle.set(tnode.labelNode, {"padding-left": "20px"});
			    	}

			    	var cb = new dijit.form.CheckBox();
			    	cb.placeAt(tnode.labelNode, "first");
			      
			    	on(cb, "change", function(checked) {
			    	  
			    		var treeNode = dijit.getEnclosingWidget(cb.domNode.parentNode);
			    		treeNode.tree._expandNode(treeNode);
  			    		var parentcb = cb;
			    		treeNode.getChildren().forEach(function(item) {
			    			var checkbox =  dijit.getEnclosingWidget(item.labelNode.children[0]);
			    			checkbox.set("checked", parentcb.checked)
			    		});
			    	  
			    		if (checked) {
			    			if (tnode.item.level == 2) {
			    				that.mspFilteringHideAllAvailable = true;
			    				that.mspFilteringUses.push(tnode.item.id[0]);
			    				
						        that.mspDisplayLayer.setSource(null);
						        that.cleanMspHighlight();
								that.servicePanel.header = that.mspParamsArray[nr].title;
								that.getMspFeatures(nr, that.mspParamsArray[nr].filterUrl, that.mspParamsArray[nr].useType, that.mspFilteringUses);
			    			}
			    		}
			    		else {
			    			if ((tnode.item.level == 2) && (that.mspFilteringHideAllAvailable)) {
			    				var index = that.mspFilteringUses.indexOf(tnode.item.id[0]);
			    				if (index > -1) {
			    					that.mspFilteringUses.splice(index, 1);
			    				}

			    				that.mspDisplayLayer.setSource(null);
						        that.cleanMspHighlight();
						        if (that.mspFilteringUses.length > 0) {
						        	that.servicePanel.header = that.mspParamsArray[nr].title;
									that.getMspFeatures(nr, that.mspParamsArray[nr].filterUrl, that.mspParamsArray[nr].useType, that.mspFilteringUses);
						        }
			    			}
			    		}
			    	  
			    	});
			    	
			    	return tnode;
			    }
			}, treeContainer);
		
			
			on(this.mspParamsArray[nr].titlePane, "hide", lang.hitch(this, function() {
				this.hideAllFiltering(nr);
			}));
		},
		
		hideAllFiltering: function(nr) {
			
			this.mspFilteringHideAllAvailable = false;
			this.mspFilteringUses = [];
			this.mspDisplayLayer.setSource(null);
			this.cleanMspHighlight();
			
			var treeNodes = this.mspParamsArray[nr].tree.getChildren();
			array.forEach(treeNodes[0].item.children, lang.hitch(this, function(parentItem) {
				var parentNode = this.mspParamsArray[nr].tree.getNodeFromItem(parentItem.id);
				var parentCheckbox =  dijit.getEnclosingWidget(parentNode.labelNode.children[0]);
				parentCheckbox.set("checked", false);
				
    			array.forEach(parentItem.children, lang.hitch(this, function(childItem) {
    				try {
    					var childNode = this.mspParamsArray[nr].tree.getNodeFromItem(childItem.id);
        				var childCheckbox =  dijit.getEnclosingWidget(childNode.labelNode.children[0]);
        				childCheckbox.set("checked", false);
    				}
    				catch(err) {
    					//console.log(err);
    				}
    			}));
			}));
			
			this.mspDisplayLayer.setSource(null);
	        this.cleanMspHighlight();
		},
				
		setMspMapLayers: function() {
			var displayStyles = [
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: "rgba(0, 0, 0, 1)",
						width: 2
					}),
					fill: new ol.style.Fill({
						color: "rgba(255, 255, 0, 0.2)"
					})
				})
			];
			
			var highlightStyles = [
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: "rgba(255, 0, 0, 1)",
						width: 2
					}),
					fill: new ol.style.Fill({
						color: "rgba(255, 255, 0, 0.2)"
					})
				}),
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: "rgba(255, 0, 0, 1)",
						width: 2
					})
				})
			];
			
			this.mspDisplayLayer = new ol.layer.Vector({
				id: "mspDisplayLayer",
				type: "msp_output",
				style: displayStyles,
				visible: false,
				zIndex: 100
			});
			this.map.addLayer(this.mspDisplayLayer);
			
			this.mspHighlightLayer = new ol.layer.Vector({
				id: "mspHighlightLayer",
				style: highlightStyles,
				zIndex: 101
			});
			this.map.addLayer(this.mspHighlightLayer);
		},
		
		cleanMspHighlight: function() {
			this.mspHighlightLayer.setSource(null);
			this.servicePanel.cleanServicePanel();
			this.utils.show("servicePanel", "none");
		},
		
		getMspFeatures: function(nr, layerUrl, useType, uses) {
			var serviceUrl = "sc/tools/get-data";
			var featuresUrl = null;
			if (nr > 0) {
				//featuresUrl = layerUrl + "/query?where=" + useType + "+%3D+%27" + use + "%27+OR+" + useType + "+LIKE+%27" + use + "%2C%25%27+OR+" + useType + "+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+" + useType + "+LIKE+%27%25%2C+" + use + "%27&returnGeometry=true&f=pjson";
				featuresUrl = layerUrl + "/query?where=";
				array.forEach(uses, lang.hitch(this, function(use) {
					featuresUrl = featuresUrl + useType + "+%3D+%27" + use + "%27+OR+" + useType + "+LIKE+%27" + use + "%2C%25%27+OR+" + useType + "+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+" + useType + "+LIKE+%27%25%2C+" + use + "%27+OR+";
				}));
				featuresUrl = featuresUrl.slice(0, -4) + "&outFields=*&returnGeometry=true&f=pjson";
				//featuresUrl = featuresUrl + "&returnGeometry=true&f=pjson";
				console.log(featuresUrl);
			}
			else {
				featuresUrl = layerUrl + "/query?where=";
				array.forEach(uses, lang.hitch(this, function(use) {
					array.forEach(["priority", "reserved", "allowed", "restricted", "forbidden"], lang.hitch(this, function(type) {
						//featuresUrl = featuresUrl + type + "+%3D+%27" + use + "%27+OR+" + type + "+LIKE+%27" + use + "%2C%25%27+OR+" + type + "+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+" + type + "+LIKE+%27%25%2C+" + use + "%27+OR+";
						featuresUrl = featuresUrl + type + "+%3D+%27" + use + "%27+OR+";
					}));
					
				}));
				featuresUrl = featuresUrl.slice(0, -4) + "&outFields=*&returnGeometry=true&f=pjson";
				//featuresUrl = layerUrl + "/query?where=priority+%3D+%27" + use + "%27+OR+priority+LIKE+%27" + use + "%2C%25%27+OR+priority+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+priority+LIKE+%27%25%2C+" + use + "%27+OR+reserved+%3D+%27" + use + "%27+OR+reserved+LIKE+%27" + use + "%2C%25%27+OR+reserved+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+reserved+LIKE+%27%25%2C+" + use + "%27+OR+allowed+%3D+%27" + use + "%27+OR+allowed+LIKE+%27" + use + "%2C%25%27+OR+allowed+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+allowed+LIKE+%27%25%2C+" + use + "%27++OR+restricted+%3D+%27" + use + "%27+OR+restricted+LIKE+%27" + use + "%2C%25%27+OR+restricted+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+restricted+LIKE+%27%25%2C+" + use + "%27++OR+forbidden+%3D+%27" + use + "%27+OR+forbidden+LIKE+%27" + use + "%2C%25%27+OR+forbidden+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+forbidden+LIKE+%27%25%2C+" + use + "%27&returnGeometry=true&f=pjson";
			}
			var servicedata = {
				"url": featuresUrl,
				"format": "json"
			};
			domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
			request.post(serviceUrl, this.utils.createPostRequestParams(servicedata)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
					else if (response.type == "success") {
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
						if (response.item) {
							this.mspDisplayLayer.set("identify", featuresUrl);
							this.mspDisplayLayer.setVisible(true);
							
							var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(response.item);
							this.drawMspFeatures(nr, gjson, useType, uses);
						}
					}
				}),
				lang.hitch(this, function(error) {
					console.log(error);
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				})
			);
		},
		
		drawMspFeatures: function(nr, featureSet, useType, uses) {
			var tmp5uses = [];
			array.forEach(uses, lang.hitch(this, function(use, i) {
				tmp5uses.push(use.split("-")[0]);
			}));
			this.mspDisplayLayer.setSource(null);
			
			var styleFunction = lang.hitch(this, function(feature) {
				var fUse = feature.get(useType+"_symbol");
				
				var fUseSymbol = fUse.split("-")[0];
				var fillPattern = new ol.style.FillPattern({
					pattern: this.mspFillStyles[fUseSymbol].pattern,
					ratio: 1,
					color: this.mspFillStyles[fUseSymbol].rgb,
					offset: 0,
					scale: 1,
					size: this.mspFillStyles[fUseSymbol].size,
					spacing: this.mspFillStyles[fUseSymbol].spacing,
					angle: this.mspFillStyles[fUseSymbol].angle
				});
				var style = new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: this.mspCountourStyles[useType],
						width: 1
					}),
					fill: fillPattern
				});
				return style;
			});
			
			var styleFunction5 = lang.hitch(this, function(feature) {
				var prUse = feature.get("priority_symbol");
				var rsUse = feature.get("reserved_symbol");
				var alUse = feature.get("allowed_symbol");
				var rtUse = feature.get("restricted_symbol");
				var fbUse = feature.get("forbidden_symbol");
				
				var fillSymbol = null;
				var countourSymbol = null;
				if ((prUse != null) && (tmp5uses.includes(prUse))) {
					fillSymbol = prUse;
					countourSymbol = "priority";
				}
				else if ((rsUse != null) && (tmp5uses.includes(rsUse))) {
					fillSymbol = rsUse;
					countourSymbol = "reserved";
				}
				else if ((alUse != null) && (tmp5uses.includes(alUse))) {
					fillSymbol = alUse;
					countourSymbol = "allowed";
				}
				else if ((rtUse != null) && (tmp5uses.includes(rtUse))) {
					fillSymbol = rtUse;
					countourSymbol = "restricted";
				}
				else if ((fbUse != null) && (tmp5uses.includes(fbUse))) {
					fillSymbol = fbUse;
					countourSymbol = "forbidden";
				}
				
				var fillPattern = new ol.style.FillPattern({
					pattern: this.mspFillStyles[fillSymbol].pattern,
					ratio: 1,
					color: this.mspFillStyles[fillSymbol].rgb,
					offset: 0,
					scale: 1,
					size: this.mspFillStyles[fillSymbol].size,
					spacing: this.mspFillStyles[fillSymbol].spacing,
					angle: this.mspFillStyles[fillSymbol].angle
				});
				var style = new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: this.mspCountourStyles[countourSymbol],
						width: 1
					}),
					fill: fillPattern
				});
				return style;
			});
			
			if (nr > 0) {
				this.mspDisplayLayer.setStyle(styleFunction);
			}
			else {
				this.mspDisplayLayer.setStyle(styleFunction5);
			}
				
						
			var gjson = new ol.format.GeoJSON( {
				featureProjection: 'EPSG:3857'
			});
			var source = new ol.source.Vector({
				features: gjson.readFeatures(featureSet)
			});
			this.mspDisplayLayer.setSource(source);
		},
		
		drawMspHighlightFeature: function() {
			this.mspHighlightLayer.setSource(null);
			var gjson = new ol.format.GeoJSON( {
				featureProjection: 'EPSG:3857'
			});
			var source = new ol.source.Vector({
				features: gjson.readFeatures(this.mspIdentifyResults[this.mspIdentifyNr])
			});
			this.mspHighlightLayer.setSource(source);
		},
		
		setMspPopupContent: function() {
			this.servicePanel.cleanServicePanel();
			if (this.mspIdentifyResults.length > 1) {
				domConstruct.create("div", {"innerHTML": this.mspIdentifyResults.length + " objects found in this location. Use arrows below to view other objects information.", "id": "headerInfoMessage"}, this.servicePanel.infoContainer, "last");
			}
			var objectInfoContainer = domConstruct.create("div", {"class": "headerInfoContainer"}, this.servicePanel.infoContainer, "last");
			var nr = this.mspIdentifyNr + 1;
			if (this.mspIdentifyNr > 0) {
				var headerObjPrev = domConstruct.create("div", {"innerHTML": "<< Prev", "id": "headerInfoPrev"}, objectInfoContainer, "last");
				on(headerObjPrev, "click", lang.hitch(this, function() {
					this.mspIdentifyNr -= 1;
					if (this.mspIdentifyNr >= 0) {
						this.setMspPopupContent();
					}
				}));
			}
			
			var headerObjInfo = domConstruct.create("div", {"innerHTML": "Object " + nr + " of " + this.mspIdentifyResults.length, "class": "headerInfoMiddle"}, objectInfoContainer, "last");
			
			if (this.mspIdentifyNr < this.mspIdentifyResults.length-1) {
				var headerObjNext = domConstruct.create("div", {"innerHTML": "Next >>", "id": "headerInfoNext"}, objectInfoContainer, "last");
				on(headerObjNext, "click", lang.hitch(this, function() {
					this.mspIdentifyNr += 1;
					if (this.mspIdentifyNr <= this.mspIdentifyResults.length-1) {
						this.setMspPopupContent();
					}
				}));
			}
			
			
			var featureProperties = null;
			if (this.mspIdentifyResults[this.mspIdentifyNr].properties) {
				featureProperties = this.mspIdentifyResults[this.mspIdentifyNr].properties;
				var displayProperties = {};
				for (var property in featureProperties) {
					if (featureProperties.hasOwnProperty(property)) {
						if (this.layerListMode == "OUTPUT_AREA") {
							if (!(this.mspExcludeProperties.includes(property.toLowerCase()))) {
								if ((featureProperties[property] == null) || (featureProperties[property] == "Null")) {
									displayProperties[property] = "";
								}
								else {
									displayProperties[property] = featureProperties[property];
								}
							}
						}
						else if (this.layerListMode == "OUTPUT") {
							if ((featureProperties[property] != "Null") && (this.mspPropertiesList.hasOwnProperty(property))) {
								displayProperties[this.mspPropertiesList[property]] = featureProperties[property];
							}
							this.servicePanel.header = this.mspIdentifyResults[this.mspIdentifyNr].layerName;
						}
						else if ((this.layerListMode == "OUTPUT_FILTER") || (this.layerListMode == "OUTPUT_FILTER_ALL") || (this.layerListMode == "OUTPUT_PSU")) {
							for (var property in this.mspPropertiesList) {
								if (this.mspPropertiesList.hasOwnProperty(property)) {
									if ((featureProperties[property] == null) || (featureProperties[property] == "Null")) {
										displayProperties[this.mspPropertiesList[property]] = "";
									}
									else {
										displayProperties[this.mspPropertiesList[property]] = featureProperties[property];
									}
								}
							}	
							if (this.mspIdentifyResults[this.mspIdentifyNr].layerName) {
								this.servicePanel.header = this.mspIdentifyResults[this.mspIdentifyNr].layerName;
							}
						}
					}
				}
			}
			this.drawMspHighlightFeature();
			this.servicePanel.setupAndShowMspPopup(displayProperties);
			
			on(this.servicePanel.closeButton, "click", lang.hitch(this, function() {
				this.mspHighlightLayer.setSource(null);
			}));
		},
		
		addLayerToMspDataArray: function(layer, parentLayerId) {
			var lyr = {
				id: layer.Title.replace(/\s+/g, ''),
				parent: parentLayerId,
				checked: false,
				name: layer.Title,
				wmsName: null,
				legend: null
			};
    	
			if (layer.Name) {
				lyr.wmsName = layer.Name;
				lyr.checked = true;
			}
			
			if (layer.Style) {
				lyr.legend = layer.Style[0].LegendURL[0].OnlineResource;
			}
			
			
			this.mspData.push(lyr);
			
			if (layer.Layer) {
				array.forEach(layer.Layer, lang.hitch(this, function(l) {
					this.addLayerToMspDataArray(l, lyr.id);
				}));
			}
		},
		
		createMspDataArray: function(input) {
			array.forEach(input.Layer, lang.hitch(this, function(layer) {
				this.addLayerToMspDataArray(layer, this.rootMspLayerId);
			}));
		},
		
		mspParentChecked: function(item) {
			var p = this.mspStore.query({id: item.parent});
			if (p[0].checked) {
				if (p[0].parent) {
					this.mspParentChecked(p[0])
				}
				else {
					this.mspAllParentsChecked = true;
				}
			}
		},
		
		mspChildrenChecked: function(item) {
			var c = this.mspStore.getChildren(item);
			if (c.length > 0) {
				array.forEach(c, lang.hitch(this, function(object) {
					if (object.checked) {
						if (object.wmsMapLayer) {
							object.wmsMapLayer.setVisible(true);
						}
						this.mspChildrenChecked(object);
					}
				}));
			}
			
		},
		
		mspChildrenUnchecked: function(item) {
			var c = this.mspStore.getChildren(item);
			if (c.length > 0) {
				array.forEach(c, lang.hitch(this, function(object) {
					if (object.checked) {
						if (object.wmsMapLayer) {
							object.wmsMapLayer.setVisible(false);
						}
						this.mspChildrenUnchecked(object);
					}
				}));
			}
			
		},
		
		createMspTree: function(input) {
			var mapa = this.map;
			var that = this;
			
			this.createMspDataArray(input);
			
			var mspTreeStore = new Memory({
				data: this.mspData,
				getChildren: function(object){
					return this.query({parent: object.id});
				}
			});
			this.mspStore = mspTreeStore;

			var mspTreeModel = new ObjectStoreModel({
				store: mspTreeStore,
				query: {id: 'msplayerlist'}
			});

			this.mspTree = new Tree({
				model: mspTreeModel,
				showRoot: false,
				//autoExpand: true,
				getIconClass:function(item, opened) {
				
				},
				getNodeFromItem: function (id) {
					return this._itemNodesMap[ id ][0];
				},

				_createTreeNode: function(args) {
					var tnode = new dijit._TreeNode(args);
					tnode.labelNode.innerHTML = args.label;
					
					domConstruct.destroy(tnode.expandoNode);
										
					var cb = new dijit.form.CheckBox();
					cb.placeAt(tnode.contentNode, "first");
					
					// set sublayers label width depending on sublayer level in the tree
					var rowNodePadding = domStyle.get(tnode.rowNode, "padding-left");
					var labelNodeWidth = 225 - rowNodePadding;
					domStyle.set(tnode.labelNode, {"width": labelNodeWidth+"px"});
					
					// create WMS legend node
					if (tnode.item.legend) {
						tnode.item.legendContainerDiv = domConstruct.create("div", { "class": "legendContainerDiv" }, tnode.rowNode, "last");
						var image = domConstruct.create('img', {
							"src": tnode.item.legend
						}, tnode.item.legendContainerDiv);
					}
					
					if (tnode.item.wmsName) {
						domStyle.set(tnode.rowNode, {"padding-left": rowNodePadding+20+"px"});
						
						if (tnode.item.parent != "PlannedSeaUse") {
							
							// Check Sea Use By Sector layers on
							cb.set("checked", true);
						}
						tnode.item.wmsMapLayer = new ol.layer.Tile({
							id: tnode.item.id,
							mspName: tnode.item.name,
							identify: "https://maps.helcom.fi/arcgis/rest/services/PBS126/MspOutputData/MapServer/identify?f=pjson&geometryType=esriGeometryPoint&tolerance=3&imageDisplay=1920%2C+647%2C+96&returnGeometry=true&layers=all:",
							source: new ol.source.TileWMS({
								url: that.mspWmsUrl,
								params: {
									LAYERS: tnode.item.wmsName
								}
							})
						});
						
						tnode.item.wmsMapLayer.setVisible(false);
						mapa.addLayer(tnode.item.wmsMapLayer);
					}
					
					if (tnode.item.parent == that.rootMspLayerId) {
						cb.set("checked", true);
					}
											
					// on sublayer check box click
					on(cb, "change", function(checked) {
						that.mspAllParentsChecked = false;
						if (checked) {
							tnode.item.checked = true;
							that.mspParentChecked(tnode.item);
							
							if (tnode.item.wmsName) {
								if (that.mspAllParentsChecked) {
									tnode.item.wmsMapLayer.setVisible(true);
									that.mspDisplayedWmsArray.push(tnode.item.wmsMapLayer);
								}								
								domStyle.set(tnode.item.legendContainerDiv, "display", "block");
							}
							else {
								if (that.mspAllParentsChecked) {
									that.mspChildrenChecked(tnode.item);
								}
								if(!tnode.isExpanded) {
			                    	that.mspTree._expandNode(tnode);
			                    }
							}
						}
						else {
							tnode.item.checked = false;
							if (tnode.item.wmsName) {
								tnode.item.wmsMapLayer.setVisible(false);
								domStyle.set(tnode.item.legendContainerDiv, "display", "none");
							}
							else {
								that.mspChildrenUnchecked(tnode.item);
								if(tnode.isExpanded) {
			                    	that.mspTree._collapseNode(tnode);
			                    }
							}
						}
					});
					tnode.checkBox = cb;
					return tnode;
				}
			});
			this.mspTree.placeAt(this.mspLayerListTree);
			this.mspTree.startup();
		}
	});
});

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
	"dijit/form/CheckBox", "dijit/Tooltip",
	"dojox/widget/TitleGroup", "dijit/TitlePane", 
	"dijit/layout/AccordionContainer", "dijit/layout/ContentPane", "dijit/form/Select",
	"widgets/servicePanelWidget",
	"basemaps/js/utils",
	"basemaps/js/ol",
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
	checkBox, Tooltip,
	TitleGroup, TitlePane,
	AccordionContainer, ContentPane, Select,
	servicePanelWidget,
	utils,
	ol,
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
		mspFilteringAccordion: null,
		mspParamsArray: [],
		mspStyles: {},
		mspDistinctCodes: {},
		mspDisplayLayer: null,
		mspHighlightLayer: null,
		mspFeaturesUrl: null,
		mspIdentifyResults: [],
		mspIdentifyNr: null,
		mspExcludeProperties: ["shape", "plan id", "symbol", "shape_length", "shape_area"],
		mspPropertiesList: {
			"OBJECTID": "OBJECTID",
			"priority_info": "Priority sea use", 
			"reserved_info": "Reserved sea use",
			"allowed_info": "Allowed sea use", 
			"restricted_info": "Restricted sea use",
			"forbidden_info": "Forbidden sea use", 
			"use_dsc": "Use description",
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
			this.getMspLayersData();
			this.setupMspParamsArray();
			this.setMspMapLayers();
    	
			// MSP view old version
			on(this.oldVersionButton, "click", lang.hitch(this, function() {
				this.utils.show("mspLayerListTreeID", "block");
				this.utils.show("mspFilterContainerID", "none");
				this.layerListMode = "OUTPUT";
				this.cleanMspHighlight();
				this.mspDisplayLayer.setSource(null);
				array.forEach(this.mspParamsArray, lang.hitch(this, function(mspParams, i) {
					if (mspParams.allWmsLayer != null) {
						mspParams.allWmsLayer.setVisible(false);
					}
				}));
				this.mspFeaturesUrl = "https://maps.helcom.fi/arcgis/rest/services/PBS126/MspOutputData/MapServer/identify?f=pjson&geometryType=esriGeometryPoint&tolerance=3&imageDisplay=1920%2C+647%2C+96&returnGeometry=true&layers=all:";
			}));
			
			// MSP view new version
			on(this.newVersionButton, "click", lang.hitch(this, function() {
				this.utils.show("mspFilterContainerID", "block");
				this.utils.show("mspLayerListTreeID", "none");
				this.layerListMode = "OUTPUT_FILTER";
				this.cleanMspHighlight();
				this.mspDisplayLayer.setSource(null);
			}));
			
			this.map.on('singleclick', lang.hitch(this, function(evt) {
				var identifyUrl = this.mspFeaturesUrl;
				if (this.layerListMode == "OUTPUT") {
					this.cleanMspHighlight();
					console.log("OUTPUT this.mspFeaturesUrl", identifyUrl);
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
					
					/*this.mspIdentifyResults = [];
					this.mspIdentifyNr = null;
					this.cleanHighlight();*/
					
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
									
									/*var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(response.item);
									console.log(response.item);
									console.log(gjson);
									array.forEach(gjson.features, lang.hitch(this, function(f) {
										this.mspIdentifyResults.push(f);
									}));
									if (this.mspIdentifyResults.length > 0) {
										this.mspIdentifyNr = 0;
										this.setMspPopupContent();
									}*/
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
					console.log("this.mspFeaturesUrl", this.mspFeaturesUrl);
					if (identifyUrl != null) {
						//var identifyUrl = this.mspFeaturesUrl;
						var mspPopupCoordinate = evt.coordinate;
						var clickLonLat = ol.proj.transform(mspPopupCoordinate, 'EPSG:3857', 'EPSG:4326');
						identifyUrl += "&geometryType=esriGeometryPoint&geometry=" + clickLonLat + "&spatialRel=esriSpatialRelIntersects&distance=2&units=esriSRUnit_Kilometer&outFields=*";
						
						var url = "sc/tools/get-data";
						var data = {
							"url": identifyUrl,
							"format": "json"
						};
						request.post(url, this.utils.createPostRequestParams(data)).then(
							lang.hitch(this, function(response) {
								if (response.type == "error") {
									console.log("Identifying MSP Feature failed", response);
									//domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
								}
								else if (response.type == "success") {
									if (response.item) {
										/*array.forEach(response.item.results, lang.hitch(this, function(arcgisResult) {
											var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(arcgisResult);
											gjson.layerName = arcgisResult.layerName;
											this.mspIdentifyResults.push(gjson);
										}));
										if (this.mspIdentifyResults.length > 0) {
											this.mspIdentifyNr = 0;
											this.setMspPopupContent(mspPopupCoordinate);
										}*/
										this.mspIdentifyResults = [];
										this.mspIdentifyNr = null;
										var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(response.item);
										console.log(response.item);
										console.log(gjson);
										array.forEach(gjson.features, lang.hitch(this, function(f) {
											this.mspIdentifyResults.push(f);
										}));
										if (this.mspIdentifyResults.length > 0) {
											this.mspIdentifyNr = 0;
											this.setMspPopupContent();
										}
									}
									//domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
								}
							}),
							lang.hitch(this, function(error) {
								console.log(error);
							})
						);
					}			
				}
			}));
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
		
		setupMspParamsArray: function() {
			this.mspFilteringAccordion = new TitleGroup({style:"width: 280px"}, this.mspFilterContainer);
			this.mspFilteringAccordion.startup();
			
			this.mspParamsArray.push({
				"useType": "priority",
				"title": "Priority Sea Use",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput2_2019/MapServer/WMSServer",
				"allLayerName": "PriorityUse",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput2_2019/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=PriorityUse",
				"allWmsLayer": null,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput2_2019/MapServer/0",
				"distinctUses": [],
				"distinctValues": [],
				"titlePane": null
			}, {
				"useType": "reserved",
				"title": "Reserved Sea Use",
				"allUrl": null,
				"allLayerName": null,
				"allLegendUrl": null,
				"allWmsLayer": null,
				"filterUrl": null,
				"distinctUses": [],
				"distinctValues": [],
				"titlePane": null
			}, {
				"useType": "allowed",
				"title": "Allowed Sea Use",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput2_2019/MapServer/WMSServer",
				"allLayerName": "AllowedUse",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput2_2019/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=AllowedUse",
				"allWmsLayer": null,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput2_2019/MapServer/1",
				"distinctUses": [],
				"distinctValues": [],
				"titlePane": null
			}, {
				"useType": "restricted",
				"title": "Restricted Sea Use",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput2_2019/MapServer/WMSServer",
				"allLayerName": "RestrictedUse",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput2_2019/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=RestrictedUse",
				"allWmsLayer": null,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput2_2019/MapServer/2",
				"distinctUses": [],
				"distinctValues": [],
				"titlePane": null
			}, {
				"useType": "forbidden",
				"title": "Forbidden Sea Use",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput2_2019/MapServer/WMSServer",
				"allLayerName": "ForbiddenUse",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput2_2019/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=ForbiddenUse",
				"allWmsLayer": null,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput2_2019/MapServer/3",
				"distinctUses": [],
				"distinctValues": [],
				"titlePane": null
			}, {
				"useType": null,
				"title": "All Sea Use Types",
				"allUrl": null,
				"allLayerName": null,
				"allLegendUrl": null,
				"allWmsLayer": null,
				"filterUrl": "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput2_2019/MapServer/4",
				"distinctUses": [],
				"distinctValues": [],
				"titlePane": null
			});
			
			this.mspStyles = {
				"aquaculture": "rgba(94, 175, 147, 1)",
				"coast": "rgba(177, 163, 125, 1)",
				"extraction": "rgba(177, 129, 125, 1)",
				"fishing": "rgba(94, 147, 175, 1)",
				"general": "rgba(153, 153, 153, 1)",
				"heritage": "rgba(221, 183, 110, 1)",
				"installations": "rgba(174, 94, 94, 1)",
				"line": "rgba(147, 94, 175, 1)",
				"military": "rgba(114, 115, 115, 1)",
				"nature": "rgba(139, 185, 115, 1)",
				"other": "rgba(202, 203, 203, 1)",
				"research": "rgba(147, 175, 94, 1)",
				"tourism": "rgba(174, 175, 94, 1)",
				"transport": "rgba(75, 112, 175, 1)",
				"multiuse": "rgba(236, 89, 89, 1)"				
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
			
			this.setupMspFilteringCp(5);
		},
		
		getDistinctMspCodes: function(nr) {
			var serviceUrl = "sc/tools/get-data";
			var servicedata = {
				"url": this.mspParamsArray[nr].filterUrl + "/query?where=1%3D1&outFields=" + this.mspParamsArray[nr].useType + "," + this.mspParamsArray[nr].useType + "_info,symbol&returnGeometry=false&returnDistinctValues=true&orderByFields=" + this.mspParamsArray[nr].useType + "&f=pjson",
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
							console.log("Getting MSP distinct codes for " + this.mspParamsArray[nr].useType + " fetched.");
							//this.mspParamsArray[nr].distinctUses = [];
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
									
									if (!(this.mspParamsArray[5].distinctValues.includes(feature.attributes[this.mspParamsArray[nr].useType].trim()))) {
										this.mspParamsArray[5].distinctValues.push(feature.attributes[this.mspParamsArray[nr].useType].trim());
										var rec5 = {
											"label": feature.attributes[this.mspParamsArray[nr].useType+"_info"],
											"value": feature.attributes[this.mspParamsArray[nr].useType]
										};
										this.mspParamsArray[5].distinctUses.push(rec5);
									}
									/*if (!(this.mspParamsArray[5].distinctUses.includes(rec))) {
										this.mspParamsArray[5].distinctUses.push(rec);
									}*/
									/*var codes = feature.attributes[this.mspParamsArray[nr].useType+"_info"].split(", ");
									array.forEach(codes, lang.hitch(this, function(code) {
										if (!(this.mspParamsArray[nr].distinctUses.includes(code.trim()))) {
											this.mspParamsArray[nr].distinctUses.push({"label": code.trim(), "value": code.trim()});
										}
									}));*/
								}
							}));
							console.log(this.mspParamsArray[nr].useType, this.mspParamsArray[nr].distinctUses);
							this.setupMspFilteringCp(nr);
						}
					}
				}),
				lang.hitch(this, function(error) {
					console.log(error);
					//domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				})
			);
		},
		
		createMspFilteringCp: function(nr) {
			this.mspParamsArray[nr].titlePane = new TitlePane({ open: false, title: this.mspParamsArray[nr].title });
			this.mspFilteringAccordion.addChild(this.mspParamsArray[nr].titlePane);
		},
		
		setupMspFilteringCp: function(nr) {
			var cpContent = domConstruct.create("div", {}, this.mspParamsArray[nr].titlePane.containerNode, "last");
			if (nr < 5) {
				var allContainer = domConstruct.create("div", {}, cpContent, "last");
				var allLabelContainer = domConstruct.create("div", {}, allContainer, "last");
				var allCheckbox = new dijit.form.CheckBox();
				allCheckbox.placeAt(allLabelContainer, "first");
				var allLabel = domConstruct.create("span", {"innerHTML": "Show all"}, allLabelContainer, "last");
				var legendContainerDiv = domConstruct.create("div", { "class": "legendContainerDiv" }, allContainer, "last");
				var image = domConstruct.create('img', {
					"src": this.mspParamsArray[nr].allLegendUrl
				}, legendContainerDiv);
				
				on(allCheckbox, "change", lang.hitch(this, function(checked) {
					if (checked) {
						filterCheckbox.set("checked", false);
						if (this.mspParamsArray[nr].allWmsLayer == null) {
							this.mspParamsArray[nr].allWmsLayer = new ol.layer.Tile({
								id: this.mspParamsArray[nr].title.replace(/\s+/g, ''),
								mspName: this.mspParamsArray[nr].title,
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
						domStyle.set(legendContainerDiv, "display", "block");
						
						setTimeout(lang.hitch(this, function() {
							this.mspFeaturesUrl = this.mspParamsArray[nr].filterUrl + "/query?where=1%3D1&returnGeometry=true&f=pjson";
							this.servicePanel.header = this.mspParamsArray[nr].title; 
						}, 1000));
					}
					else {
						this.mspParamsArray[nr].allWmsLayer.setVisible(false);
						domStyle.set(legendContainerDiv, "display", "none");
						this.cleanMspHighlight();
						this.mspFeaturesUrl = null;
					}
				}));
			}
			
			var filterContainer = domConstruct.create("div", {"style": "margin-top: 10px"}, cpContent, "last");
			var filterLabelContainer = domConstruct.create("div", {"style": "width: 100%;"}, filterContainer, "last");
			
			if (nr < 5) {
				var filterCheckbox = new dijit.form.CheckBox();
				filterCheckbox.placeAt(filterLabelContainer, "first");
				var filterLabel = domConstruct.create("span", {"innerHTML": "Show only"}, filterLabelContainer, "last");
				var filterOptionsContainer = domConstruct.create("div", {"style": "margin-left: 5px; display: none"}, filterContainer, "last");
			}
			else {
				var filterLabel = domConstruct.create("span", {"innerHTML": "Show all sea uses types of"}, filterLabelContainer, "last");
				var filterOptionsContainer = domConstruct.create("div", {"style": "margin-left: 5px"}, filterContainer, "last");
			}
			
			
			var filterSelectContainer = domConstruct.create("div", {"style": "margin-top: 10px"}, filterOptionsContainer, "last");
			var sel = new Select({
				options: this.mspParamsArray[nr].distinctUses
			});
			sel.placeAt(filterSelectContainer);
			sel.startup();
			var filterShowButton = domConstruct.create("div", {"class": "toolLink", "style": "margin-top: 10px; display: inline-block;", "innerHTML": "Show"}, filterOptionsContainer, "last");
			
			if (nr < 5) {
				on(filterCheckbox, "change", lang.hitch(this, function(checked) {
					if (checked) {
						allCheckbox.set("checked", false);
						domStyle.set(filterOptionsContainer, {"display": "block"});
					}
					else {
						domStyle.set(filterOptionsContainer, {"display": "none"});
						this.mspDisplayLayer.setSource(null);
						this.cleanMspHighlight();
						this.mspFeaturesUrl = null;
					}
				}));
			}
					
			on(filterShowButton, "click", lang.hitch(this, function() {
				this.mspDisplayLayer.setSource(null);
				this.cleanMspHighlight();
				this.servicePanel.header = this.mspParamsArray[nr].title + " - " + sel.attr('displayedValue');
				this.getMspFeatures(nr, this.mspParamsArray[nr].filterUrl, this.mspParamsArray[nr].useType, sel.get("value"));
			}));
			
			on(this.mspParamsArray[nr].titlePane, "hide", lang.hitch(this, function() {
				if (nr < 5) {
					allCheckbox.set("checked", false);
					filterCheckbox.set("checked", false);
				}
				else {
					if (this.mspDisplayLayer != null) {
						this.mspDisplayLayer.setSource(null);
						this.cleanMspHighlight();
					}
				}
			}));
			on(this.mspParamsArray[nr].titlePane, "show", lang.hitch(this, function() {
				if (nr < 5) {
					allCheckbox.set("checked", true);
				}
			}));
		},
				
		setMspMapLayers: function() {
			var displayStyles = [
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: "rgba(0, 0, 0, 1)",
						width: 1
					}),
					fill: new ol.style.Fill({
						color: "rgba(255, 255, 0, 0.2)"
					})
				})/*,
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: "rgba(255, 0, 0, 1)",
						width: 2
					})
				})*/
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
				style: displayStyles,
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
		
		getMspFeatures: function(nr, layerUrl, useType, use) {
			var serviceUrl = "sc/tools/get-data";
			if (nr < 5) {
				this.mspFeaturesUrl = layerUrl + "/query?where=" + useType + "+%3D+%27" + use + "%27+OR+" + useType + "+LIKE+%27" + use + "%2C%25%27+OR+" + useType + "+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+" + useType + "+LIKE+%27%25%2C+" + use + "%27&returnGeometry=true&f=pjson";
			}
			else {
				this.mspFeaturesUrl = layerUrl + "/query?where=priority+%3D+%27" + use + "%27+OR+priority+LIKE+%27" + use + "%2C%25%27+OR+priority+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+priority+LIKE+%27%25%2C+" + use + "%27+OR+reserved+%3D+%27" + use + "%27+OR+reserved+LIKE+%27" + use + "%2C%25%27+OR+reserved+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+reserved+LIKE+%27%25%2C+" + use + "%27+OR+allowed+%3D+%27" + use + "%27+OR+allowed+LIKE+%27" + use + "%2C%25%27+OR+allowed+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+allowed+LIKE+%27%25%2C+" + use + "%27++OR+restricted+%3D+%27" + use + "%27+OR+restricted+LIKE+%27" + use + "%2C%25%27+OR+restricted+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+restricted+LIKE+%27%25%2C+" + use + "%27++OR+forbidden+%3D+%27" + use + "%27+OR+forbidden+LIKE+%27" + use + "%2C%25%27+OR+forbidden+LIKE+%27%25%2C+" + use + "%2C%25%27+OR+forbidden+LIKE+%27%25%2C+" + use + "%27&returnGeometry=true&f=pjson";
			}
			var servicedata = {
				"url": this.mspFeaturesUrl,
				"format": "json"
			};
			domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
			request.post(serviceUrl, this.utils.createPostRequestParams(servicedata)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log("Getting MSP features (", useType, use, ") failed", response);
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
					else if (response.type == "success") {
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
						if (response.item) {
							console.log("Getting MSP features (", useType, use, ") fetched.");
							
							/*this.mspDistinctCodes[useType] = [];
							array.forEach(response.item.features, lang.hitch(this, function(feature) {
								if (feature.attributes[useType] != null) {
									var codes = feature.attributes[useType].split(", ");
									array.forEach(codes, lang.hitch(this, function(code) {
										if (!(this.mspDistinctCodes[useType].includes(code.trim()))) {
											this.mspDistinctCodes[useType].push(code.trim());
										}
									}));
								}
							}));*/
							var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(response.item);
							this.drawMspFeatures(gjson, use);
						}
					}
				}),
				lang.hitch(this, function(error) {
					console.log(error);
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				})
			);
		},
		
		drawMspFeatures: function(featureSet, use) {
			this.mspDisplayLayer.setSource(null);
			
			var style = new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: this.mspStyles[use.split("-")[0]],
					width: 2
				})/*,
				fill: new ol.style.Fill({
					color: "rgba(255, 255, 0, 0.2)"
				})*/
			});
			this.mspDisplayLayer.setStyle(style);	
						
			var gjson = new ol.format.GeoJSON( {
				featureProjection: 'EPSG:3857'
			});
			var source = new ol.source.Vector({
				features: gjson.readFeatures(featureSet)
			});
			this.mspDisplayLayer.setSource(source);
			var extent = source.getExtent();
			this.map.getView().fit(extent, this.map.getSize());
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
						if (this.layerListMode == "OUTPUT") {
							/*if (!(this.mspExcludeProperties.includes(property.toLowerCase()))) {
								displayProperties[property] = featureProperties[property];
							}*/
							if ((featureProperties[property] != "Null") && (this.mspPropertiesList.hasOwnProperty(property))) {
								displayProperties[this.mspPropertiesList[property]] = featureProperties[property];
							}
							this.servicePanel.header = this.mspIdentifyResults[this.mspIdentifyNr].layerName;
						}
						else if (this.layerListMode == "OUTPUT_FILTER") {
							if ((featureProperties[property] != null) && (this.mspPropertiesList.hasOwnProperty(property))) {
								displayProperties[this.mspPropertiesList[property]] = featureProperties[property];
							}
						}
					}
				}
			}
			this.drawMspHighlightFeature();
			//this.servicePanel.header = this.mspIdentifyResults[this.mspIdentifyNr].layerName;
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

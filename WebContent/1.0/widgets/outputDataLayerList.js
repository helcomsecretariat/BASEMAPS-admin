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
		//mspWmsUrl: "https://maps.helcom.fi/arcgis/services/PBS126/MspOutputData/MapServer/WMSServer",
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
		mspFilteringLevel1Checked: false,
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
			"area": "Area (sq km)",
			"country": "Country",
			"planId": "Plan ID"
		},
		nationalMspParamsArray: [],
		nationalMspAccordion: null,
		nationalMspLayersAccordion: null,
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
							var data = {
								"url": identifyUrl,
								"format": "json"
							};
							request.post(url, this.utils.createPostRequestParams(data)).then(
								lang.hitch(this, function(response) {
									if (response.type == "error") {
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
		
		setupMspViewAccordion: function() {
			this.mspViewAccordion = new TitleGroup({style:"width: 380px"}, this.mspFilterContainer);
			this.mspViewAccordion.startup();
			this.setupMspParams();
			this.setupPane1();
			this.setupPane2();
			this.setupPane3();
			this.setupNationalMspParamsArray();
		},
		
		
		
		setupMspParams: function() {
			this.mspParamsArray.push({
				"useType": null,
				"title": "All sea uses",
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
				"title": "Prioritized sea uses",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WMSServer",
				"allLayerName": "Priority_Use",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Priority_Use",
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
				"title": "Reserved sea uses",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WMSServer",
				"allLayerName": "Reserved_Use",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Reserved_Use",
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
				"title": "Allowed sea uses",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WMSServer",
				"allLayerName": "Allowed_Use",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Allowed_Use",
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
				"title": "Restricted sea uses",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WMSServer",
				"allLayerName": "Restricted_Use",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Restricted_Use",
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
				"title": "Forbidden sea uses",
				"allUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WMSServer",
				"allLayerName": "Forbidden_Use",
				"allLegendUrl": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Forbidden_Use",
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
		
		setupNationalMspParamsArray: function() {
			this.nationalMspParamsArray.push({
				"title": "Denmark",
				"wmsMapService": "https://kort.dma.dk/server/services/Havplanudkast_nov23/MapServer/WMSServer",
				"wmsLegendService": "https://kort.dma.dk/server/services/Havplanudkast_nov23/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=",
				"layers": [
					{
						"layerTitle": "General use",
						"layerName": "Generel_anvendelse64838",
						"wmsLayer": null
					},
					{
						"layerTitle": "Shipping corridors",
						"layerName": "S_Sejladskorridorer",
						"wmsLayer": null
					},
					{
						"layerTitle": "Specific land reclamation projects",
						"layerName": "L_Konkrete_landindvindingsprojekter10049",
						"wmsLayer": null
					},
					{
						"layerTitle": "Compensation excavations",
						"layerName": "Ik_Kompensationsafgravninger",
						"wmsLayer": null
					},
					{
						"layerTitle": "Specific transit pipelines",
						"layerName": "Er_Konkrete_transitroerledninger3243",
						"wmsLayer": null
					},
					{
						"layerTitle": "Approach plans for aviation",
						"layerName": "Ii_Indflyvningsplaner_for_luftfart57292",
						"wmsLayer": null
					},
					{
						"layerTitle": "Respect distances for aviation",
						"layerName": "Ir_Respektafstande_for_luftfart5960",
						"wmsLayer": null
					},
					{
						"layerTitle": "Marine archaeological cultural heritage",
						"layerName": "Mk_Marinarkæologisk_kulturarvsdeponering5865",
						"wmsLayer": null
					},
					{
						"layerTitle": "Cable corridors for renewable energy",
						"layerName": "Ek_Kabelkorridorer_for_vedvarende_energi49655",
						"wmsLayer": null
					},
					{
						"layerTitle": "Nature and environmental protection areas",
						"layerName": "Natur-_og_miljoebeskyttelsesomraader30501",
						"wmsLayer": null
					},
					{
						"layerTitle": "Specific transport infrastructure projects",
						"layerName": "Ib_Konkrete_infrastrukturprojekter51078",
						"wmsLayer": null
					},
					{
						"layerTitle": "Renewable energy",
						"layerName": "Ev_Vedvarende_energi34763",
						"wmsLayer": null
					},
					{
						"layerTitle": "Oil and gas exploration and extraction",
						"layerName": "Eo_Efterforskning_og_indvinding_af_olie_og_gas15430",
						"wmsLayer": null
					},
					{
						"layerTitle": "Natural resource extraction",
						"layerName": "R_Raastofindvinding",
						"wmsLayer": null
					},
					{
						"layerTitle": "Renewable energy and energy islands",
						"layerName": "Ei_Vedvarende_energi_og_energioeer9747",
						"wmsLayer": null
					},
					{
						"layerTitle": "CO2 storage",
						"layerName": "Ec_CO2-lagring",
						"wmsLayer": null
					},
					{
						"layerTitle": "Farming of shellfish in the water column",
						"layerName": "Ao_Opdraet_af_skaldyr_i_vandsoejlen8312",
						"wmsLayer": null
					},
					{
						"layerTitle": "Marine aquaculture",
						"layerName": "Ah_Havbrug",
						"wmsLayer": null
					},
					{
						"layerTitle": "Cultivation and transplantation banks for the production of shellfish",
						"layerName": "Ak_Kultur-_og_omplantningsbanker_til_produktion_af_muslinger_og_oesters52825",
						"wmsLayer": null
					},
					{
						"layerTitle": "Removed area",
						"layerName": "Fjernet_areal_(I_hoering_27/11/23-05/02/24)_61458",
						"wmsLayer": null
					},
					{
						"layerTitle": "Added area",
						"layerName": "Tilfoejet_areal_(I_hoering_27/11/23-05/02/24)_59552",
						"wmsLayer": null
					}
				]
			}, /*{
				"title": "Finland",
				"wmsMapService": "https://paikkatieto.kymenlaakso.fi/server/services/Merialuesuunnittelu/MSP_for_Finland_2030/MapServer/WMSServer",
				"wmsLegendService": "https://paikkatieto.kymenlaakso.fi/server/services/Merialuesuunnittelu/MSP_for_Finland_2030/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=",
				"layers": [
					{
						"layerTitle": "Marine area zones",
						"layerName": "0",
						"wmsLayer": null
					},
					{
						"layerTitle": "Significant and potential areas",
						"layerName": "1",
						"wmsLayer": null
					},
					{
						"layerTitle": "Connections and connection needs",
						"layerName": "2",
						"wmsLayer": null
					},
					{
						"layerTitle": "MSP borders",
						"layerName": "3",
						"wmsLayer": null
					}
				]
			},*/ {
				"title": "Finland",
				"wmsMapService": "https://kymenlaakso-geoserver.gispocoding.fi/geoserver/merialuesuunnitelma/ows",
				"wmsLegendService": "https://kymenlaakso-geoserver.gispocoding.fi/geoserver/merialuesuunnitelma/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&layer=",
				"layers": [
					{
						"layerTitle": "Marine area zones",
						"layerName": "msp_vyohyke_en",
						"wmsLayer": null
					},
					{
						"layerTitle": "Significant and potential areas identified in the Maritime Spatial Planning Process",
						"layerName": "msp_alue_en",
						"wmsLayer": null
					},
					{
						"layerTitle": "Connections and connection needs identified in the Maritime Spatial Planning Process",
						"layerName": "msp_viiva_en",
						"wmsLayer": null
					},
					{
						"layerTitle": "Maritime spatial planning borders",
						"layerName": "msp_raja_en",
						"wmsLayer": null
					}
				]
			},{
				"title": "Germany",
				"wmsMapService": "https://www.geoseaportal.de/wss/service/Raumordnungsplan_AWZ/guest",
				"wmsLegendService": "https://www.geoseaportal.de/geoserver/Raumordnungsplan_AWZ/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&layer=",
				"layers": [
					{
						"layerTitle": "Shipping",
						"layerName": "Raumordnungsplan_AWZ:Maritime_Spatial_Plan_EEZ_2021_Shipping",
						"wmsLayer": null
					},
					{
						"layerTitle": "Offshore Wind Energy",
						"layerName": "Raumordnungsplan_AWZ:Maritime_Spatial_Plan_EEZ_2021_Offshore_wind_energy",
						"wmsLayer": null
					},
					{
						"layerTitle": "Fishery",
						"layerName": "Raumordnungsplan_AWZ:Maritime_Spatial_Plan_EEZ_2021_Fishery",
						"wmsLayer": null
					},
					{
						"layerTitle": "Protecting and Enhancing the Marine Environment",
						"layerName": "Raumordnungsplan_AWZ:Maritime_Spatial_Plan_EEZ_2021_Protecting_and_enhancing_the_marine_environment",
						"wmsLayer": null
					},
					{
						"layerTitle": "Scientific Research",
						"layerName": "Raumordnungsplan_AWZ:Maritime_Spatial_Plan_EEZ_2021_Scientific_research",
						"wmsLayer": null
					},
					{
						"layerTitle": "Raw Material Extraction",
						"layerName": "Raumordnungsplan_AWZ:Maritime_Spatial_Plan_EEZ_2021_Raw_material_extraction",
						"wmsLayer": null
					},
					{
						"layerTitle": "Defence",
						"layerName": "Raumordnungsplan_AWZ:Maritime_Spatial_Plan_EEZ_2021_Defence",
						"wmsLayer": null
					},
					{
						"layerTitle": "Cables and Pipelines",
						"layerName": "Raumordnungsplan_AWZ:Maritime_Spatial_Plan_EEZ_2021_Cables_and_pipelines",
						"wmsLayer": null
					}
				]
			}, /*{
				"title": "Poland",
				"wmsMapService": "https://mapy.umgdy.gov.pl/msp/services/POM/POM_RysunekPlanu/MapServer/WMSServer",
				"wmsLegendService": "https://mapy.umgdy.gov.pl/msp/services/POM/POM_RysunekPlanu/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=",
				"layers": [
					{
						"layerTitle": "SeaBasins_v4",
						"layerName": "6",
						"wmsLayer": null
					},
					{
						"layerTitle": "technical infrastructure (I)",
						"layerName": "17",
						"wmsLayer": null
					},
					{
						"layerTitle": "technical infrastructure - variant (I)",
						"layerName": "16",
						"wmsLayer": null
					},
					{
						"layerTitle": "port or harbour operation (Ip)",
						"layerName": "15",
						"wmsLayer": null
					},
					{
						"layerTitle": "transport (T)",
						"layerName": "18",
						"wmsLayer": null
					},
					{
						"layerTitle": "exploration, prospection of mineral deposits and extraction of minerals from the deposits (K)",
						"layerName": "14",
						"wmsLayer": null
					},
					{
						"layerTitle": "coastal protection (C)",
						"layerName": "13",
						"wmsLayer": null
					},
					{
						"layerTitle": "fisheries (R)",
						"layerName": "12",
						"wmsLayer": null
					},
					{
						"layerTitle": "tourism, sport and recreation (S)",
						"layerName": "11",
						"wmsLayer": null
					},
					{
						"layerTitle": "cultural heritage (D)",
						"layerName": "10",
						"wmsLayer": null
					},
					{
						"layerTitle": "national defence and security (B)",
						"layerName": "9",
						"wmsLayer": null
					},
					{
						"layerTitle": "limit of a basin with a certain basic function",
						"layerName": "8",
						"wmsLayer": null
					},
					{
						"layerTitle": "limit of a sub-basin with a certain allowed function",
						"layerName": "23",
						"wmsLayer": null
					},
					{
						"layerTitle": "SeaBasinLabel",
						"layerName": "22",
						"wmsLayer": null
					},
					{
						"layerTitle": "SeaBasinAreaLabel",
						"layerName": "20",
						"wmsLayer": null
					}
				]
			},*/ 
			{
				"title": "Poland",
				"wmsMapService": "https://sipam.gov.pl/geoserver/SIPAM/wms",
				"wmsLegendService": "https://sipam.gov.pl/geoserver/SIPAM/ows?service=WMS&request=GetLegendGraphic&format=image/png&layer=",
				"layers": [
					{
						"layerTitle": "basins",
						"layerName": "pom_akwen",
						"wmsLayer": null
					},
					{
						"layerTitle": "sub-basins",
						"layerName": "pom_obszarakwenu",
						"wmsLayer": null
					},
					{
						"layerTitle": "sub-basins countours",
						"layerName": "pom_podakweny granice",
						"wmsLayer": null
					}
				]
			}, {
				"title": "Sweden",
				"wmsMapService": "https://geodata.havochvatten.se/geoservices/havsplaner-2022/ows",
				"wmsLegendService": "https://geodata.havochvatten.se/geoservices/havsplaner-2022/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=",
				"layers": [
					{
						"layerTitle": "Traffic flows outside MSP",
						"layerName": "havsplaner-2022:bg-sjofartutanforhavsplan",
						"wmsLayer": null
					},
					{
						"layerTitle": "Electricity transfer outside MSP",
						"layerName": "havsplaner-2022:bg-eloverforingutanforhavsplan",
						"wmsLayer": null
					},
					{
						"layerTitle": "Sea use Shipping and investigation area for shipping",
						"layerName": "havsplaner-2022:anv-sjofart",
						"wmsLayer": null
					},
					{
						"layerTitle": "Particular consideration to high cultural values",
						"layerName": "havsplaner-2022:hansyn-kulturmiljo",
						"wmsLayer": null
					},
					{
						"layerTitle": "Sea use Sand extraction and investigation area for sand extraction",
						"layerName": "havsplaner-2022:anv-sandutvinning",
						"wmsLayer": null
					},
					{
						"layerTitle": "Sea use Recreation",
						"layerName": "havsplaner-2022:anv-rekreation",
						"wmsLayer": null
					},
					{
						"layerTitle": "Sea use Commercial fishing",
						"layerName": "havsplaner-2022:anv-yrkesfiske",
						"wmsLayer": null
					},
					{
						"layerTitle": "Sea use Electricity transfer",
						"layerName": "havsplaner-2022:anv-eloverforing",
						"wmsLayer": null
					},
					{
						"layerTitle": "Areas with ID-labels, containing sea uses delimited by orange edges",
						"layerName": "havsplaner-2022:omraden",
						"wmsLayer": null
					},
					{
						"layerTitle": "small scale labels (sea use and ID)",
						"layerName": "havsplaner-2022:etiketter-utzoomad",
						"wmsLayer": null
					},
					{
						"layerTitle": "large scale labels (sea use and ID)",
						"layerName": "havsplaner-2022:etiketter-inzoomad",
						"wmsLayer": null
					},
					{
						"layerTitle": "Sea areas (MSP sub-regions)",
						"layerName": "havsplaner-2022:havsomraden",
						"wmsLayer": null
					},
					{
						"layerTitle": "MSP areas",
						"layerName": "havsplaner-2022:havsplaneomraden",
						"wmsLayer": null
					}
				]
			});
			
			this.setupNationalMspDataPane();
		},
		
		setupNationalMspDataPane: function() {
			this.nationalMspAccordion = new TitleGroup({style:"width: 380px"}, this.mspNationalDataContainer);
			this.nationalMspAccordion.startup();
			let pane = new TitlePane({ open: false, title: "National MSP plan WMS services", id: "nationaltp" });
			this.nationalMspAccordion.addChild(pane);
			
			this.nationalMspLayersAccordion = new TitleGroup({style:"width: 350px", id: "nationaltg"}, pane);
			this.nationalMspLayersAccordion.startup();
			
			
			array.forEach(this.nationalMspParamsArray, lang.hitch(this, function(nationalMspParams) {
				let coutryPane = new TitlePane({ open: false, title: nationalMspParams.title, id: "nationaltp"+nationalMspParams.title });
				this.nationalMspLayersAccordion.addChild(coutryPane);
				
				array.forEach(nationalMspParams.layers, lang.hitch(this, function(layer) {
					
					let layerContainer = domConstruct.create("div", {}, coutryPane.containerNode, "first");
					let layerCheckbox = new dijit.form.CheckBox();
					layerCheckbox.placeAt(layerContainer, "first");
					domConstruct.create("span", {"innerHTML": layer.layerTitle, "style": "margin-top: 5px;"}, layerContainer, "last");
					let legendContainerDiv = domConstruct.create("div", {"style": "margin-left: 20px;"}, layerContainer, "last");
					domConstruct.create('img', {"src": nationalMspParams.wmsLegendService + layer.layerName}, legendContainerDiv);
					domStyle.set(legendContainerDiv, {"display": "none"});
					
					on(layerCheckbox, "change", lang.hitch(this, function(checked) {
						if (checked) {
							if (layer.wmsLayer == null) {
								layer.wmsLayer = new ol.layer.Tile({
									source: new ol.source.TileWMS({
										url: nationalMspParams.wmsMapService,
										params: {
											LAYERS: layer.layerName
										}
									})
								});
								this.map.addLayer(layer.wmsLayer);
								layer.wmsLayer.setVisible(true);
								domStyle.set(legendContainerDiv, {"display": "block"});
							}
							else {
								layer.wmsLayer.setVisible(true);
								domStyle.set(legendContainerDiv, {"display": "block"});
							}
						}
						else {
							layer.wmsLayer.setVisible(false);
							domStyle.set(legendContainerDiv, {"display": "none"});
						}
					}));
					on(coutryPane, "show", lang.hitch(this, function() {
						layerCheckbox.set("checked", true);
					}));
					on(coutryPane, "hide", lang.hitch(this, function() {
						layerCheckbox.set("checked", false);
					}));
				}));
			}));
		},
		
		setupPane1: function() {
			this.mspViewAccordionPanes.tp1 = new TitlePane({ open: false, title: "MSP plan areas", id: "tp1" });
			this.mspViewAccordion.addChild(this.mspViewAccordionPanes.tp1);
			
			domConstruct.create("div", {"style": "font-size: 12px; color: #444; margin-bottom: 10px;", "innerHTML": "This dataset contains Maritime Spatial Plan areas (MSP areas) as reported by national contact points of HELCOM-VASAB MSP Data group."}, this.mspViewAccordionPanes.tp1.containerNode, "last");
						
			var legendContainerDiv = domConstruct.create("div", { }, this.mspViewAccordionPanes.tp1.containerNode, "last");
			var image = domConstruct.create('img', {
				"src": "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Maritime_Spatial_Plan_Areas"
				//"src": "https://maps.helcom.fi/arcgis/services/MADS/Human_Activities/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Maritime_Spatial_Plan_Areas17466"
			}, legendContainerDiv);
			
			// uncomment for new version
			//domConstruct.create("a", {"href": "https://maps.helcom.fi/website/MADS/download/?id=human_activities154", "target": "_blank", "style": "font-size: 14px; margin-bottom: 10px;", "innerHTML": "Download dataset"}, this.mspViewAccordionPanes.tp1.containerNode, "last");
			
			var areasLayer = null;
			
			on(this.mspViewAccordionPanes.tp1, "show", lang.hitch(this, function() {
				if (areasLayer == null) {
					areasLayer = new ol.layer.Tile({
						type: "msp_output",
						identify: "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/identify?f=pjson&geometryType=esriGeometryPoint&tolerance=3&imageDisplay=1920%2C+647%2C+96&returnGeometry=true&layers=all:6&geometry=",
						//identify: "https://maps.helcom.fi/arcgis/rest/services/MADS/Human_Activities/MapServer/identify?f=pjson&geometryType=esriGeometryPoint&tolerance=3&imageDisplay=1920%2C+647%2C+96&returnGeometry=true&layers=all:154&geometry=",
						source: new ol.source.TileWMS({
							url: "https://maps.helcom.fi/arcgis/services/PBS126/MSPoutput/MapServer/WmsServer",
							//url: "https://maps.helcom.fi/arcgis/services/MADS/Human_Activities/MapServer/WMSServer",
							params: {
								LAYERS: "Maritime_Spatial_Plan_Areas"
								//LAYERS: "Maritime_Spatial_Plan_Areas17466"
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
			this.mspViewAccordionPanes.tp3 = new TitlePane({ open: false, title: "Query planned sea use data", id: "tp3"  });
			this.mspViewAccordion.addChild(this.mspViewAccordionPanes.tp3);
			
			// uncomment for new version
			//domConstruct.create("div", {"style": "font-size: 12px; color: #444; margin-bottom: 10px;", "innerHTML": "Sea use data in this section are organized in 5 layers per sea use and furthermore can be filtered by sea use type (activity)."}, this.mspViewAccordionPanes.tp3.containerNode, "last");
			//domConstruct.create("div", {"style": "font-size: 12px; color: #444; margin-bottom: 10px;", "innerHTML": "Expand sections below to start filtering data. Filtered data are displayed on the map. Click specific area on the map to see detailed information about the area."}, this.mspViewAccordionPanes.tp3.containerNode, "last");
			
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
					"rgb": "rgba(150, 150, 150, 1)",
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
					"rgb": "rgba(200, 200, 200, 1)",
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
			this.mspViewAccordionPanes.tp2 = new TitlePane({ open: false, title: "View planned sea use data", id: "tp2" });
			this.mspViewAccordion.addChild(this.mspViewAccordionPanes.tp2);
			
			// uncomment for new version
			//domConstruct.create("div", {"style": "font-size: 12px; color: #444; margin-bottom: 10px;", "innerHTML": "Sea use data in this section are organized in 5 layers per sea use (priority, reserved, allowed, restricted and forbiden sea use)."}, this.mspViewAccordionPanes.tp2.containerNode, "last");
			//domConstruct.create("div", {"style": "font-size: 12px; color: #444; margin-bottom: 10px;", "innerHTML": "Any specific area may have assigned more than one sea use (for example some activities may be prioritized and other allowed or forbidden in this area), then this area will be present in more than one layer. Click on the area on the map to sea detailed information about the specific area."}, this.mspViewAccordionPanes.tp2.containerNode, "last");
			//domConstruct.create("div", {"style": "font-size: 12px; color: #444; margin-bottom: 10px;", "innerHTML": "Turn on layers below to view data on the map. Click specific area on the map to see detailed information about the area."}, this.mspViewAccordionPanes.tp2.containerNode, "last");
			
			// uncomment for new version
			/*let allPsuContainer = domConstruct.create("div", {}, this.mspViewAccordionPanes.tp2.containerNode, "last");
			let allPsuCheckbox = new dijit.form.CheckBox();
			allPsuCheckbox.placeAt(allPsuContainer, "first");
			domConstruct.create("span", {"innerHTML": "All sea uses", "style": "margin-top: 5px;"}, allPsuContainer, "last");*/

			for (let i = 0; i < this.mspParamsArray.length; i++) {
				if (this.mspParamsArray[i].useType != null) {
					this.createPlannedSeaUseLayer(i);
				}
			}
			
			domConstruct.create("div", { "class": "psuLegend" }, this.mspViewAccordionPanes.tp2.containerNode, "last");
						
			on(this.mspViewAccordionPanes.tp2, "show", lang.hitch(this, function() {
				// comment out for loop for new version
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
				// uncomment for new version
				//allPsuCheckbox.set("checked", false);
			}));
			
			// uncomment for new version
			/*on(allPsuCheckbox, "change", lang.hitch(this, function(checked) {
				array.forEach(this.mspParamsArray, lang.hitch(this, function(mspParams, i) {
					if ((mspParams.useType != null) && (mspParams.psuCheckbox != null)) {
						if (checked) {
							mspParams.psuCheckbox.set("checked", true);
						}
						else {
							mspParams.psuCheckbox.set("checked", false);
						}
					}
				}));
			}));*/
			
		},
				
		createPlannedSeaUseLayer: function(nr) {
			var psuContainer = domConstruct.create("div", {"style": "margin-left: 18px; margin-top: 5px;"}, this.mspViewAccordionPanes.tp2.containerNode, "last");
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
								var ut = feature.attributes[this.mspParamsArray[nr].useType];
								var uti = feature.attributes[this.mspParamsArray[nr].useType+"_info"];
								var utArr = ut.split(", ");
								if (utArr.length > 1) {
									ut = "multiuse";
									uti = "More than one Sea Use";
								}
								else {
									if ((!ut.includes("-")) && (ut.endsWith("_g"))) {
										ut = ut.slice(0, -2);
									}
								}
								if (uti != null) {
								//if (feature.attributes[this.mspParamsArray[nr].useType+"_info"] != null) {
									if (!(this.mspParamsArray[nr].distinctValues.includes(ut.trim()))) {
									//if (!(this.mspParamsArray[nr].distinctValues.includes(feature.attributes[this.mspParamsArray[nr].useType].trim()))) {
										this.mspParamsArray[nr].distinctValues.push(ut.trim());
										//this.mspParamsArray[nr].distinctValues.push(feature.attributes[this.mspParamsArray[nr].useType].trim());
										var rec = {
											"label": uti,
											"value": ut
											//"label": feature.attributes[this.mspParamsArray[nr].useType+"_info"],
											//"value": feature.attributes[this.mspParamsArray[nr].useType]
										};
										this.mspParamsArray[nr].distinctUses.push(rec);
									}
									
									if (!(this.mspParamsArray[0].distinctValues.includes(ut.trim()))) {
									//if (!(this.mspParamsArray[0].distinctValues.includes(feature.attributes[this.mspParamsArray[nr].useType].trim()))) {
										this.mspParamsArray[0].distinctValues.push(ut.trim());
										//this.mspParamsArray[0].distinctValues.push(feature.attributes[this.mspParamsArray[nr].useType].trim());
										var rec0 = {
											"label": uti,
											"value": ut
											//"label": feature.attributes[this.mspParamsArray[nr].useType+"_info"],
											//"value": feature.attributes[this.mspParamsArray[nr].useType]
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
				this.mspParamsArray[nr].titlePane = new TitlePane({ open: false, title: this.mspParamsArray[nr].title });
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
			    	if (args.label) {
			    		if (args.label != "multiuse") {
				    		tnode.labelNode.innerHTML = args.label.charAt(0).toUpperCase() + args.label.slice(1);
				    	}
				    	else {
				    		tnode.labelNode.innerHTML = "More than one Sea Use";
				    	}
			    	}
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
  			    		if (checked) {
  			    			that.mspFilteringHideAllAvailable = true;
  			    		}
  			    		that.servicePanel.header = that.mspParamsArray[nr].title;
  			    		if (tnode.item.level == 1) {
  			    			that.mspFilteringLevel1Checked = true;
  			    			var childNr = 0;
  			    			treeNode.getChildren().forEach(function(item) {
  				    			var checkbox =  dijit.getEnclosingWidget(item.labelNode.children[0]);
  				    			checkbox.set("checked", parentcb.checked);
  				    			if (checked) {
  				    				that.mspFilteringUses.push(item.item.id[0]);
  				    			}
  				    			else {
  				    				if (that.mspFilteringHideAllAvailable) {
	  				    				var index = that.mspFilteringUses.indexOf(item.item.id[0]);
	  				    				if (index > -1) {
	  				    					that.mspFilteringUses.splice(index, 1);
	  				    				}
  				    				}
  				    			}
  				    			childNr = childNr + 1;
  				    		});
  			    			if (childNr == treeNode.getChildren().length) {
  			    				if (that.mspFilteringUses.length == 0) {
  			    					that.mspDisplayLayer.setSource(null);
  							        that.cleanMspHighlight();
  							        that.mspFilteringLevel1Checked = false;
  			    				}
  			    				else {
  			    					that.getMspFeatures(nr, that.mspParamsArray[nr].filterUrl, that.mspParamsArray[nr].useType, that.mspFilteringUses);
  			    				}
  			    			}
  			    		}
  			    		else if ((tnode.item.level == 2) && (!that.mspFilteringLevel1Checked)) {
  			    			if (checked) {
			    				that.mspFilteringUses.push(tnode.item.id[0]);
  				    		}
  				    		else {
  				    			if (that.mspFilteringHideAllAvailable) {
  				    				var index = that.mspFilteringUses.indexOf(tnode.item.id[0]);
  				    				if (index > -1) {
  				    					that.mspFilteringUses.splice(index, 1);
  				    				}
  				    			}
  				    		}
  			    			if (that.mspFilteringUses.length == 0) {
		    					that.mspDisplayLayer.setSource(null);
						        that.cleanMspHighlight();
						        that.mspFilteringLevel1Checked = false;
		    				}
		    				else {
		    					that.getMspFeatures(nr, that.mspParamsArray[nr].filterUrl, that.mspParamsArray[nr].useType, that.mspFilteringUses);
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
			this.mspFilteringLevel1Checked = false;	
			
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
			this.mspDisplayLayer.setSource(null);
	        this.cleanMspHighlight();
	        if (uses.length > 0) {
	        	var serviceUrl = "sc/tools/get-data";
				var featuresUrl = null;
				if (nr > 0) {
					featuresUrl = layerUrl + "/query?where=";
					array.forEach(uses, lang.hitch(this, function(use) {
						if (use != "multiuse") {
							if (!use.includes("-")) {
								use = use + "_g";
							}
							featuresUrl = featuresUrl + useType + "+LIKE+%27%25" + use + "%25%27+OR+";
						}
						else {
							featuresUrl = featuresUrl + useType + "_symbol%3D%27" + use + "%27+OR+";
						}
						
					}));
					featuresUrl = featuresUrl.slice(0, -4) + "&outFields=*&returnGeometry=true&f=pjson";
				}
				else {
					featuresUrl = layerUrl + "/query?where=";
					array.forEach(uses, lang.hitch(this, function(use) {
						if (use != "multiuse") {
							if (!use.includes("-")) {
								use = use + "_g";
							}
						}
						array.forEach(["priority", "reserved", "allowed", "restricted", "forbidden"], lang.hitch(this, function(type) {
							if (use != "multiuse") {
								featuresUrl = featuresUrl + type + "+LIKE+%27%25" + use + "%25%27+OR+";
							}
							else {
								featuresUrl = featuresUrl + type + "_symbol%3D%27" + use + "%27+OR+";
							}
						}));
					}));
					featuresUrl = featuresUrl.slice(0, -4) + "&outFields=*&returnGeometry=true&f=pjson";
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
	        }
	        var that = this;
	        setTimeout(function(){ that.mspFilteringLevel1Checked = false; }, 1000);
		},
		
		drawMspFeatures: function(nr, featureSet, useType, uses) {
			var tmp5uses = [];
			array.forEach(uses, lang.hitch(this, function(use, i) {
				tmp5uses.push(use.split("-")[0]);
			}));
			tmp5uses.push("multiuse");
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
				var style = null;
				if (fillSymbol != null) {
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
					style = new ol.style.Style({
						stroke: new ol.style.Stroke({
							color: this.mspCountourStyles[countourSymbol],
							width: 1
						}),
						fill: fillPattern
					});
				}
				
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
		}
	});
});

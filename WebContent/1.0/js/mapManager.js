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
	"basemaps/js/layerList",
	"basemaps/js/utils",
	"widgets/scaleWidget",
	"//openlayers.org/en/v4.4.2/build/ol.js",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/text!../templates/mapView.html"//,
	//"https://unpkg.com/@esri/arcgis-to-geojson-utils@1.3.0/dist/arcgis-to-geojson.js"
], function(
	declare, dom, domConstruct, lang, domStyle, query, request, array, on,
	layerList, utils, scaleWidget,
	ol,
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
		popupOverlay: null,
		popupContent: null,
		popupHeader: null,
		popupAttrTable: null,
		mapsLayersCount: null,
		layersCounter: null,
		identifyResults: [],
		highlightLayer: null,
		mspIdentifyResults: [],
		mspIdentifyNr: null,
		mspExcludeProperties: ["OBJECTID", "Shape", "Plan Id", "symbol", "Shape_Length", "Shape_Area"],
		constructor: function(params){
			this.utils = new utils();
		},
		
		postCreate: function() {
			/* popup */
			var popupContainer = domConstruct.create("div", {"id": "popup", "class": "ol-popup"}, this.domNode, "last");
			var popupCloser = domConstruct.create("a", { "class": "ol-popup-closer", "href": "#"}, popupContainer, "last");
			this.popupContent = domConstruct.create("div", {"id": "popup-content"}, popupContainer, "last");
			this.popupHeader = domConstruct.create("div", {"class": "popupHeaderText"}, this.popupContent, "last");
			this.popupAttrTable = domConstruct.create("table", {"class": "popupTable"}, this.popupContent, "last");
			
			this.popupOverlay = new ol.Overlay({
				element: popupContainer,
				autoPan: true,
				autoPanAnimation: {
					duration: 250
				}
			});
			popupCloser.onclick = lang.hitch(this, function() {
				this.cleanHighlight();
				return false;
			});
			/* popup */
			
			
			
			var basemapLayer = new ol.layer.Tile({
				id: "basemap",
				title: "Basemap TOPO",
				source: new ol.source.TileArcGISRest({
					url: "http://maps.helcom.fi/arcgis/rest/services/MADS/Basemap_TOPO/MapServer"
				})
			});
			
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
			this.map = new ol.Map({
				target: "map",
				layers: [
					basemapLayer//, mspwms//, arcgisLayer
				],
				overlays: [this.popupOverlay],
				view: new ol.View({
					projection: 'EPSG:3857',
					center: [2290596.795329124, 8263216.845732588],
					zoom: 5
					//extent: ol.proj.transform([57.000000, 20.373333, 60.000000, 28.209038], 'EPSG:4326', 'EPSG:3857')
					//extent: [2267949.0925025064, 7760118.672726451, 3140215.762959987, 8399737.889636647]
				})
			});
			
			/* highlight layer */
			var styles = [
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
			
			this.highlightLayer = new ol.layer.Vector({
				id: "highlight",
				style: styles,
				zIndex: 99
			});
			this.map.addLayer(this.highlightLayer);
			/* highlight layer */
			
			
			this.map.on('singleclick', lang.hitch(this, function(evt) {
				if (this.layerListObj.layerListMode == "OUTPUT") {
					var mspServerUrl = "http://maps.helcom.fi/arcgis/rest/services/PBS126/MspOutputData/MapServer/identify?f=pjson&geometryType=esriGeometryPoint&tolerance=6&imageDisplay=1920%2C+647%2C+96&returnGeometry=true&layers=all:";
					//var mspServerUrl = "http://62.236.121.188/arcgis104/rest/services/PBS126/MspOutputData/MapServer/identify?f=pjson&geometryType=esriGeometryPoint&tolerance=6&imageDisplay=1920%2C+647%2C+96&returnGeometry=true&layers=all:2,14&geometry=";
					var mspLayersIds = [];
					var mapLayers = this.map.getLayers().getArray();
					for (var i = 0; i < mapLayers.length; i++) {
						// get only visible MSP layers
						if ((mapLayers[i].getProperties().mspName) && (mapLayers[i].getVisible())) {
							// find arcgis layer id for identification
							var r = this.layerListObj.mspArcgisLayers.filter(obj => {
								return obj.name === mapLayers[i].getProperties().mspName
							})
							mspServerUrl += r[0].id + ","
						}
					}
					mspServerUrl = mspServerUrl.slice(0, -1) + "&geometry=";
					
					var mspPopupCoordinate = evt.coordinate;
					var clickLonLat = ol.proj.transform(mspPopupCoordinate, 'EPSG:3857', 'EPSG:4326');
					mspServerUrl += clickLonLat + "&mapExtent=";
					
					var mapExtent = ol.proj.transformExtent(this.map.getView().calculateExtent(), 'EPSG:3857', 'EPSG:4326');
					mspServerUrl += mapExtent;
					
					this.mspIdentifyResults = [];
					this.mspIdentifyNr = null;
					this.cleanHighlight();
					
					domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
					var url = "sc/tools/get-data";
					var data = {
						"url": mspServerUrl,
						"format": "json"
					};
					request.post(url, this.utils.createPostRequestParams(data)).then(
						lang.hitch(this, function(response) {
							this.layersCounter = this.layersCounter + 1;
							if (response.type == "error") {
								console.log("Identifying MSP REST failed", response);
								domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
							}
							else if (response.type == "success") {
								if (response.item) {
									array.forEach(response.item.results, lang.hitch(this, function(arcgisResult) {
										var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(arcgisResult);
										gjson.layerName = arcgisResult.layerName;
										this.mspIdentifyResults.push(gjson);
									}));
									if (this.mspIdentifyResults.length > 0) {
										this.mspIdentifyNr = 0;
										this.setMspPopupContent(mspPopupCoordinate);
									}
								}
								domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
							}
						}),
						lang.hitch(this, function(error) {
							console.log(error);
						})
					);
					
					/*fetch(mspServerUrl).then(
						lang.hitch(this, function(response) {
							return response.text();
						})
					).then(
						lang.hitch(this, function(text) {
							domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
							var arcgisJson = JSON.parse(text);
							array.forEach(arcgisJson.results, lang.hitch(this, function(arcgisResult) {
								var gjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(arcgisResult);
								gjson.layerName = arcgisResult.layerName;
								this.mspIdentifyResults.push(gjson);
							}));
							if (this.mspIdentifyResults.length > 0) {
								this.mspIdentifyNr = 0;
								this.setMspPopupContent(mspPopupCoordinate);
							}
							
						})
					);*/
				}
				else if (this.layerListObj.layerListMode == "INPUT") {
					this.cleanHighlight();
					var popupCoordinate = evt.coordinate;
					var viewResolution = this.map.getView().getResolution();
					var viewProjection = this.map.getView().getProjection();
									
					var layers = this.map.getLayers().getArray();
					this.mapsLayersCount = 0;
					for (var i = layers.length-1; i > 0; i--) {
						if ((layers[i].getProperties().id != "basemap") && (layers[i].getProperties().id != "highlight") && (!("mspName" in layers[i].getProperties())) && (layers[i].getVisible())) {
							this.mapsLayersCount = this.mapsLayersCount + 1;
						}
					}
					
					this.layersCounter = 0;
					this.identifyResults = [];
					for (var i = layers.length-1; i > 0; i--) {
						if ((layers[i].getProperties().id != "basemap") && (layers[i].getProperties().id != "highlight") && (!("mspName" in layers[i].getProperties())) && (layers[i].getVisible())) {
							var infoFormat = "application/json";
							var u = layers[i].getSource().getGetFeatureInfoUrl(popupCoordinate, viewResolution, viewProjection, {"buffer": 10, "INFO_FORMAT": ""});
							console.log(u);
							this.getInfo(layers[i].getProperties().wmsId, u, popupCoordinate, layers[i].getProperties().name);
						}
					}
					
					query(".metadataBox").forEach(function(node){
						domStyle.set(node, {"display": "none"});
					});
				}
			}));
			
			var mapNode = dom.byId("map");
			domConstruct.place(mapNode, this.domNode, "first");
			// create layer list
			this.layerListObj = new layerList({map: this.map}).placeAt(this.layerlistContainer);
			this.scaleWidget = new scaleWidget({map: this.map}).placeAt(this.scaleContainer);
			this.scaleWidget.setScale();
    },
    
    show: function(open) {
		domStyle.set(this.domNode, "display", open ? "block" : "none");
	},
	
	getInfo: function(id, u, popupCoordinate, name) {
		var url = "sc/tools/get-features";
		var data = {
			"id": id,
			"url": u
		};
		console.log("request data ", data);
		request.post(url, this.utils.createPostRequestParams(data)).then(
			lang.hitch(this, function(response) {
				this.layersCounter = this.layersCounter + 1;
				if (response.type == "error") {
					console.log("Identification failed", response);
				}
				else if (response.type == "success") {
					if (response.item) {
						if ((response.item.features) && (response.item.features.length > 0)) {
							this.identifyResults.push( {
								layerName: name,
								identifyFeature: response.item
							})
						}
						if (this.layersCounter == this.mapsLayersCount) {
							if (this.identifyResults.length > 0) {
								this.setPopupContent(popupCoordinate);
								this.drawFeature();
							}
						}
					}
					else {
						console.log("No identify result for this layer.");
					}
				}
			}),
			lang.hitch(this, function(error) {
				console.log(error);
			})
		);
	},
	
	setPopupContent: function(popupCoordinate) {
		domConstruct.empty(this.popupAttrTable);
		this.popupHeader.innerHTML = this.identifyResults[0].layerName;
		var featureProperties = null;
		if (this.identifyResults[0].identifyFeature.features[0].properties) {
			featureProperties = this.identifyResults[0].identifyFeature.features[0].properties;
			for (var property in featureProperties) {
				if (featureProperties.hasOwnProperty(property)) {
					var row = domConstruct.create("tr", {}, this.popupAttrTable, "last");
					var attr = domConstruct.create("td", {"innerHTML": property + ":", "class": "popupTableAttr"}, row, "last");
					var val = domConstruct.create("td", {"innerHTML": featureProperties[property], "class": "popupTableVal"}, row, "last");
				}
			}
		}
		
		this.popupOverlay.setPosition(popupCoordinate);
	},
	
	drawFeature: function() {
		var geojson = null;
		var feature = this.identifyResults[0].identifyFeature;
		if (feature.crs) {
			if (feature.crs.properties.name) {
				if (feature.crs.properties.name.includes("3857")) {
					geojson = new ol.format.GeoJSON()
				}
				else {
					geojson = new ol.format.GeoJSON( {
						featureProjection: 'EPSG:3857'
					});
				}
			}
		}
			
		if (geojson != null) {
			var source = new ol.source.Vector({
				features: geojson.readFeatures(this.identifyResults[0].identifyFeature)
			});
			this.highlightLayer.setSource(source);
		}
	},
	
	setMspPopupContent: function(popupCoordinate) {
		//this.cleanHighlight();
		this.layerListObj.servicePanel.cleanServicePanel();
		var objectInfoContainer = domConstruct.create("div", {"class": "headerInfoContainer"}, this.layerListObj.servicePanel.infoContainer, "last");		
		//this.popupHeader.innerHTML = this.mspIdentifyResults[this.mspIdentifyNr].layerName;
		var nr = this.mspIdentifyNr + 1;
		if (this.mspIdentifyNr > 0) {
			var headerObjPrev = domConstruct.create("div", {"innerHTML": "<< Prev", "id": "headerInfoPrev"}, objectInfoContainer, "last");
			on(headerObjPrev, "click", lang.hitch(this, function() {
				this.mspIdentifyNr -= 1;
				if (this.mspIdentifyNr >= 0) {
					this.setMspPopupContent(popupCoordinate);
				}
			}));
		}
		
		var headerObjInfo = domConstruct.create("div", {"innerHTML": "object " + nr + " of " + this.mspIdentifyResults.length, "class": "headerInfoMiddle"}, objectInfoContainer, "last");
		
		if (this.mspIdentifyNr < this.mspIdentifyResults.length-1) {
			var headerObjNext = domConstruct.create("div", {"innerHTML": "Next >>", "id": "headerInfoNext"}, objectInfoContainer, "last");
			on(headerObjNext, "click", lang.hitch(this, function() {
				this.mspIdentifyNr += 1;
				if (this.mspIdentifyNr <= this.mspIdentifyResults.length-1) {
					this.setMspPopupContent(popupCoordinate);
				}
			}));
		}
		
		
		var featureProperties = null;
		if (this.mspIdentifyResults[this.mspIdentifyNr].properties) {
			featureProperties = this.mspIdentifyResults[this.mspIdentifyNr].properties;
			var displayProperties = {};
			for (var property in featureProperties) {
				if (featureProperties.hasOwnProperty(property)) {
					if (!(this.mspExcludeProperties.includes(property))) {
						if (featureProperties[property] == "Null") {
							displayProperties[property] = "";
						}
						else {
							displayProperties[property] = featureProperties[property];
						}
					}
				}
			}
		}
		this.drawMspFeature();
		this.layerListObj.servicePanel.header = this.mspIdentifyResults[this.mspIdentifyNr].layerName;
		this.layerListObj.servicePanel.setupAndShowPopup(displayProperties);
		
		on(this.layerListObj.servicePanel.closeButton, "click", lang.hitch(this, function() {
			this.cleanHighlight();
		}));
		//this.popupOverlay.setPosition(popupCoordinate);
	},
	
	drawMspFeature: function() {
		var gjson = new ol.format.GeoJSON( {
			featureProjection: 'EPSG:3857'
		});
		var s = new ol.source.Vector({
			features: gjson.readFeatures(this.mspIdentifyResults[this.mspIdentifyNr])
		});
		this.highlightLayer.setSource(s);
	},
	
	cleanHighlight: function() {
		this.highlightLayer.setSource(null);
		this.popupHeader.innerHTML = "";
		domConstruct.empty(this.popupAttrTable);
		this.highlightLayer.setSource(null);
		this.popupOverlay.setPosition(undefined);
		//popupCloser.blur();
	},
    /*addOperationalLayers: function(layers) {
      on(this.mapa, "layers-add-result", lang.hitch(this, function(e) {
        // create layer list
        var layerlistContainer = dom.byId("layerlistContainer");
        var llwidget = new layerlistWidget({map: this.mapa}).placeAt(layerlistContainer);
        // Store widget object to get Identify Tasks
        this.layerListObj = llwidget;

        on(layerlistContainer, "click", lang.hitch(this, function(evt){
          // hide layer top group menu
          query(".layerTopGroupMenu").forEach(function(node){
            domStyle.set(node, {"display": "none"});
          });
        }));
      }));

      var services = [];
      array.forEach(layers, function(layer){
        var service = new ArcGISDynamicMapServiceLayer(layer.url, {
          "id": layer.label,
          "showAttribution": false
        });
        service.setVisibleLayers([]);
        //service.setOpacity(0.5);
        services.push(service);
      });
      this.mapa.addLayers(services);
    },

    // Setup and run Identify Tasks for each service
    runIdentifies: function(evt) {
      this.clickPoint = evt.mapPoint;
      // Identify Tasks and Parameters for each service
      var tasks = [], idParams = [];
      // Identify object from Layer List
      var identify = this.layerListObj.identify;
      // For each service
      for (var service in identify) {
        if (identify.hasOwnProperty(service)) {
          // Add Identify Task
          var task = identify[service].task;
          tasks.push(task);

          // Setup and add Identify Parameters
          var idp = identify[service].params;
          idp.width = this.mapa.width;
          idp.height = this.mapa.height;
          idp.geometry = evt.mapPoint;
          idp.mapExtent = this.mapa.extent;
          idParams.push(idp);
        }
      }

      // Identify tasks synchronization
      var defTasks = dojo.map(tasks, function (task) {
        return new dojo.Deferred();
      });
      var dlTasks = new dojo.DeferredList(defTasks);

      // Call a chain of methods for every Identify task
      dlTasks.then(this.showIdentifyResults);

      // Executing each service Identify Task
      for (i = 0; i < tasks.length; i++) {
        try {
          tasks[i].execute(idParams[i], defTasks[i].callback, defTasks[i].errback);
        } catch (e) {
          console.log("Error caught");
          console.log(e);
          defTasks[i].errback(e); //If you get an error for any task, execute the errback
        }
      }
    },

    showIdentifyResults: function(r) {
      var results = [];
      r = dojo.filter(r, function (result) {
        return r[0];
      }); //filter out any failed tasks
      var result = r[r.length-1][1];
      for (i=0;i<r.length;i++) {
        results = results.concat(r[i][1]);
      }

      // Identified object top most layer in top most service
      var result = results[results.length-1];

      if (result) {
        var res = dojo.map([result], function(result) {
          var feature = result.feature;
          var fieldInfos = [];
          // if identified layer is raster layer - display just Pixel Value in the popup
          if (result.geometryType == "esriGeometryPoint" && feature.attributes["Pixel Value"]) {
            var fieldInfo = {
              fieldName: "Pixel Value",
              visible: true,
              label: "Value:"
            };
            fieldInfos.push(fieldInfo);
          }
          // display attributtes in popup
          else {
            var excludeInPopup = ["OBJECTID", "OBJECTID_1", "Shape", "Shape_Length", "Shape_Area"];
            for (var attribute in feature.attributes) {
              if (feature.attributes.hasOwnProperty(attribute)) {
                //if (!excludeInPopup.includes(attribute)) {
                if (excludeInPopup.indexOf(attribute) === -1) {
                  var fieldInfo = {
                    fieldName: attribute,
                    visible: true,
                    label: attribute+":"
                  };
                  fieldInfos.push(fieldInfo);
                }
              }
            }
            // create symbol for marker objects
            if (result.geometryType == "esriGeometryPoint") {
              this.mM.selectedGraphics.clear();
              var symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 20,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([0,0,0,0.0]), 0),
                            new Color([0,0,0,0.0]));
              feature.symbol = symbol;
              this.mM.selectedGraphics.add(feature);
            }
          }
          var template = new PopupTemplate({
            title: result.layerName,
            fieldInfos: fieldInfos
          }); //Select template based on layer name
          feature.setInfoTemplate(template);
          return feature;
        });

        //this.mM.mapa.infoWindow.setTitle("Title");

        this.mM.mapa.infoWindow.setFeatures(res);
        this.mM.mapa.infoWindow.show(this.mM.clickPoint);
      }
    }*/
  });
});

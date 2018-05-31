define([
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/query!css3",
	"dojo/request",
	"basemaps/js/layerList",
	"widgets/scaleWidget",
	"//openlayers.org/en/v4.4.2/build/ol.js",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/text!../templates/mapView.html"
], function(
	declare, dom, domConstruct, lang, domStyle, query, request,
	layerList, scaleWidget,
	ol,
	_WidgetBase, _TemplatedMixin, template
) {
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "mapView",
		map: null,
		// Layer list object (required for Identify)
		layerListObj: null,
		// store clicked location for displaying popup
		clickPoint: null,
		// graphic layer for identified point features
		selectedGraphics: null,
		currentExtent: null,
		scaleWidget: null,
		constructor: function(params){
      
		},
		
		postCreate: function() {
			var basemapLayer = new ol.layer.Tile({
				id: "basemap",
				title: "Basemap TOPO",
				source: new ol.source.TileArcGISRest({
					url: "http://62.236.121.188/arcgis104/rest/services/MADS/Basemap_TOPO/MapServer"
				})
			});
			this.map = new ol.Map({
				target: "map",
				layers: [
					basemapLayer
				],
				view: new ol.View({
					projection: 'EPSG:3857',
					center: [2290596.795329124, 8263216.845732588],
					zoom: 5//,
					//extent: ol.proj.transform([57.000000, 20.373333, 60.000000, 28.209038], 'EPSG:4326', 'EPSG:3857')
					//extent: [2267949.0925025064, 7760118.672726451, 3140215.762959987, 8399737.889636647]
				})
			//<BoundingBox CRS="EPSG:3857" maxx="3140215.762959987" maxy="8399737.889636647" minx="2267949.0925025064" miny="7760118.672726451"/>
			});
			this.map.on('singleclick', lang.hitch(this, function(evt) {
				var viewResolution = this.map.getView().getResolution();
				var viewProjection = this.map.getView().getProjection();
				this.map.getLayers().forEach(function (lyr) {
					//var infoFormat = null;
					if ((lyr.getVisible()) && (lyr.getProperties().id != "basemap")) {
						if (lyr.getProperties().identifyFormats.includes("application/json")) {
							var infoFormat = "application/json";
							//var infoFormat = "text/xml";
							var u = lyr.getSource().getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection, {"INFO_FORMAT": infoFormat});
							request.get(u, {
								handleAs: "json"
							}).then(function(data){
								console.log(JSON.stringify(data));
							},
							function(error){
								console.log(error);
							});
						}
					}
					
				});
				query(".metadataBox").forEach(function(node){
		              domStyle.set(node, {"display": "none"});
		            });
			}));
			
			var mapNode = dom.byId("map");
			domConstruct.place(mapNode, this.domNode, "first");
			// create layer list
			var llwidget = new layerList({map: this.map}).placeAt(this.layerlistContainer);
			this.scaleWidget = new scaleWidget({map: this.map}).placeAt(this.scaleContainer);
			this.scaleWidget.setScale();
    },
    
    show: function(open) {
		domStyle.set(this.domNode, "display", open ? "block" : "none");
	}/*,
    addOperationalLayers: function(layers) {
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

define([
  "dojo/_base/declare",
  "dojo/dom",
  "basemaps/js/layerList",
  "//openlayers.org/en/v4.4.2/build/ol.js",
  //"//cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.6/proj4.js",
  //"basemaps/js/proj3035"
], function(
  declare,
  dom,
  layerList,
  ol
  //proj4,
  //proj3035
) {
  return declare(null, {
    mapa: null,
    // Layer list object (required for Identify)
    layerListObj: null,
    // store clicked location for displaying popup
    clickPoint: null,
    // graphic layer for identified point features
    selectedGraphics: null,
    currentExtent: null,
    constructor: function(params){
      var mapConfig = params.mapConfig;

      var basemapLayer = new ol.layer.Tile({
        title: 'Basemap TOPO',
        source: new ol.source.TileArcGISRest({
          url: mapConfig.basemap
        })
      });
      var map = new ol.Map({
        target: params.mapNode,
        layers: [
          basemapLayer

          /*new ol.layer.Tile({
            title: 'AU.MaritimeBoundary',
            source: new ol.source.TileWMS({
              url: 'http://inspire.maaamet.ee/arcgis/rest/services/public/au/MapServer/exts/InspireView/service',
              params: {LAYERS: "AU.AdministrativeBoundary", TILED: true}
            })
          })*/
        ],
        view: new ol.View({
          projection: 'EPSG:3857',
          center: [mapConfig.center.x, mapConfig.center.y],
          //center: [4548448, 4617002],
          zoom: mapConfig.zoom
          //maxResolution: 0.703125
        })
      });

      map.on('singleclick', function(evt) {
        map.getLayers().forEach(function (lyr) {
          console.log(lyr);
          //if (lyr.getProperties().id === "WMS1") {
          console.log(lyr.getProperties());
          /*console.log(lyr.getSource().getGetFeatureInfoUrl(
            evt.coordinate, viewResolution, 'EPSG:3857',
            {'INFO_FORMAT': 'application/json'}
          ));*/
        });
      });

      // create layer list
      var layerlistContainer = dom.byId("layerlistContainer");
      var llwidget = new layerList({map: map, layers: mapConfig.layers}).placeAt(layerlistContainer);
      // create popup
      /*var popup = new Popup({
        // fill symbol for polygon features
        fillSymbol: new SimpleFillSymbol(
                      SimpleFillSymbol.STYLE_SOLID,
                      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2),
                      new Color([255, 255, 0, 0.25])
                    ),
        // line symbol for line features
        lineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2)
      }, domConstruct.create("div"));
      // custom class for popup
      domClass.add(popup.domNode, "popupStyle");
      // create map using json config
      var mapConfig = params.mapConfig;
      this.mapa = new Map(params.mapNode, {
        spatialReference: mapConfig.spatialReference,
        lods: mapConfig.lods,
        sliderPosition: "top-right",
        infoWindow: popup
      });

      var basemapGallery = new BasemapGallery({
        showArcGISBasemaps: false,
        map: this.mapa
      }, "basemapGallery");


      var bl1 = new BasemapLayer({
        url:"http://62.236.121.188/arcgis104/rest/services/MADS/Basemap_BORDERS/MapServer"
      });
      var bl2 = new BasemapLayer({
        url:"http://62.236.121.188/arcgis104/rest/services/MADS/Basemap_TOPO/MapServer"
      });
      var basemap1 = new Basemap({
        layers:[bl1],
        title:"",
        thumbnailUrl:"img/BORDERS_basemap.png"
      });
      var basemap2 = new Basemap({
        layers:[bl2],
        thumbnailUrl:"img/TOPO_basemap.png"
      });
      basemapGallery.add(basemap1);
      basemapGallery.add(basemap2);
      basemapGallery.startup();
      var basemapLayer = new ArcGISTiledMapServiceLayer("http://62.236.121.188/arcgis104/rest/services/MADS/Basemap_TOPO/MapServer", {
        "id": "Basemap"
      });
      this.mapa.addLayer(basemapLayer);

      this.selectedGraphics = new GraphicsLayer();
      this.mapa.addLayer(this.selectedGraphics);

      this.mapa.on("load", lang.hitch(this, function(e) {
        this.mapa.centerAndZoom(new Point(mapConfig.center.x, mapConfig.center.y, new SpatialReference({ wkid: 3035 })), mapConfig.zoom);
        this.currentExtent = this.mapa.extent;
        // draggable popup
        var handle = this.mapa.infoWindow.domNode.querySelector(".title");
        var dnd = new Moveable(this.mapa.infoWindow.domNode, {
            handle: handle
        });
        // hide pointer and outerpointer (used depending on where the pointer is shown)
        dnd.on('FirstMove', lang.hitch(this, function(e) {
          var arrowNode =  this.mapa.infoWindow.domNode.querySelector(".outerPointer");
          arrowNode.classList.add("hidden");
          arrowNode =  this.mapa.infoWindow.domNode.querySelector(".pointer");
          arrowNode.classList.add("hidden");
        }.bind(this)));

        // on map click
        on(this.mapa, "click", lang.hitch(this, function(evt){
          console.log(this.mapa.extent);
          // hide layer top group menu
          query(".layerTopGroupMenu").forEach(function(node){
            domStyle.set(node, {"display": "none"});
          });
          // run identifies
          this.runIdentifies(evt);
        }));
      }));
      this.mapa.on("extent-change", lang.hitch(this, function (e){
        if (((e.extent.xmax > 8200000) || (e.extent.xmin < 800000) || (e.extent.ymax > 7300000) || (e.extent.ymin < 1200000)) && (this.currentExtent)) {
          this.mapa.setExtent(this.currentExtent);
        }
        this.currentExtent = e.extent;
      }));*/
    },
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
    }
  });
});

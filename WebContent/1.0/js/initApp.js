define([
	"dojo/_base/declare",
	"dojo/request",
	"dojo/on", 
	"dojo/dom",
	"dojo/_base/window",
	"basemaps/js/mapManager",
	"widgets/loginWidget",
	"dojo/domReady!"
	//"dojox/geo/openlayers/Map",
	//"esri/request",
	//"esri/config",
	//"mads/js/startupWindow",
	//"mads/js/widgetPanel",
	//"widgets/coordsWidget",
	//"widgets/scaleWidget",
	//"require"
], function(
	declare, request, on, dom, win, mapManager, loginWidget//, require
) {
	return declare(null, {
		mM: null,
		login: null,
		//widgetPanel: null,
		constructor: function(){
			/*var cookies = document.cookie;
			console.log("cookies", cookies);
			//document.cookie = "name=value";
			if (document.cookie.indexOf("_agreedMADSterms_") === -1) {
				var startupBoxDiv = dom.byId("startupBox");
				document.getElementById("startupBox").style.display = "block";
				var startBox = new startupWindow().placeAt(startupBoxDiv);
			}
			else {
				document.getElementById("startupBox").style.display = "none";
				document.getElementById("screenCover").style.display = "none";
			}*/
	
			// read mads config file
			var windowUrl = window.location.pathname;
			windowUrl = windowUrl.replace("index.html", "");

			request.get(windowUrl + basemapsVersion + "/config/config.json", {
				handleAs: "json"
			}).then(function(config){
				this.mM = new mapManager({mapNode: "map", mapConfig: config.map});
			},
			function(error){
				console.log("Error. Unable to read application configuration file. Error message: ", error.message);
			});
			
			// on Admin link click init login window
			var adminButton = dom.byId("adminLink");
			on(adminButton, "click", function(evt){
				//var startupBoxDiv = dom.byId("startupBox");
				//document.getElementById("startupBox").style.display = "block";
				var lgn = new loginWidget().placeAt(win.body());
	        });
		}

    /*requestSucceeded: function(response, io) {
      // set up proxy page
      esriConfig.defaults.io.proxyUrl = response.proxyUrl;
      // create map manager
      this.mM = new mapManager({mapNode: "map", mapConfig: response.map});
      this.mM.mapa.on("load", lang.hitch(this, function(e) {
        // add layers to the map (read from config)
        this.mM.addOperationalLayers(response.map.layers);
      }));
      //on(this.mM.mapa, "layers-add-result", lang.hitch(this, function(e) {
      this.mM.mapa.on("layers-add-result", lang.hitch(this, function(e) {
        // create coords widget
        var coordsContainer = dom.byId("coordsContainer");
        var widget = new coordsWidget({map: this.mM.mapa}).placeAt(coordsContainer);

        // create scale widget
        var scaleContainer = dom.byId("scaleContainer");
        widget = new scaleWidget({map: this.mM.mapa}).placeAt(scaleContainer);

        // create widget panel
        var widgetPanelNode = dojo.byId("widgetPanel");
        this.widgetPanel = new widgetPanel({
            title: "Widget",
            resizable: true,
            dockable: false,
            style: "position:absolute;top:20px;right:20px;width:304px;height:60%;"
        }, widgetPanelNode);
        this.widgetPanel.startup();
        // hide widget panel on
        this.widgetPanel.domNode.style.display = "none";
        this.widgetPanel.domNode.style.visibility = "hidden";

        // init widgets from config file
        initWidgets(response.widgets);

        function initWidgets(widgets) {
          var widgetModules = [],
              widgetConfigs = [];
          // each widget has js module. Module urls are store in the main config
          array.forEach(widgets, function(widget){
            widgetModules.push(widget.url);
            widgetConfigs.push(widget);
          });
          // include widgets modules
          require(widgetModules, function() {
            array.forEach(arguments, function(argument, i){
              // create widget using it's module
              var widget = new argument({map: this.mM.mapa, widgetPanel: this.widgetPanel, config: widgetConfigs[i]});
            });
          });
        }
      }));


    },
    requestFailed: function(error, io) {
      console.log("Error. Unable to read application configuration file. Error message: ", error.message);
    }*/
	});
});

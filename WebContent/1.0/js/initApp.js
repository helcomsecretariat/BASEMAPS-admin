define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/request",
	"dojo/on", 
	"dojo/dom",
	"dojo/_base/window",
	"basemaps/js/mapManager",
	"basemaps/js/utils",
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
	declare, lang, request, on, dom, win, mapManager, utils, loginWidget//, require
) {
	return declare(null, {
		mM: null,
		utils: null,
		loggedIn: false,
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
	
			this.utils = new utils();
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
			
			// on Admin link click get logged in user.
			var adminButton = dom.byId("adminLink");
			on(adminButton, "click", lang.hitch(this, function(evt){
				this.getUser();
	        }));
			
			// on Logout link click logout user.
			var logoutButton = dom.byId("logoutLink");
			on(logoutButton, "click", lang.hitch(this, function(evt){
				this.logout();
	        }));
		},
		
		getUser: function() {
			var url = "sc/users/current";
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						console.log(response);
					}
					else if (response.type == "success") {
						// if user not logged in, init login window
						if (response.item.id == null) {
							var lgn = new loginWidget().placeAt(win.body());
						}
						// if user logged in, enable map and logout links and open Admin view
						else {
							this.utils.show("mapLink", "block");
							this.utils.changeText("logoutLink", "Logout (" + response.item.name + ")");
							this.utils.show("logoutLink", "block");
							
							// TODO: open Admin view
						}
					}
				}),
				lang.hitch(this, function(error){
					alert("Something went wrong (on checking user logged in). Contact administrator, please.");
					console.log(error);
				})
			);
		},
		
		logout: function() {
			var url = "sc/logout";
			request.post(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						console.log(response);
					}
					// if logout succeed, disable map and logout links and open Map view
					else if (response.type == "success") {
						this.utils.show("mapLink", "none");
						this.utils.changeText("logoutLink", "Logout");
						this.utils.show("logoutLink", "none");
						
						// TODO: open Map view
					}
				}),
				lang.hitch(this, function(error){
					alert("Something went wrong (on logout). Contact administrator, please.");
					console.log(error);
				})
			);
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

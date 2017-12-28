define([
  "dojo/_base/declare",
  "dojo/on",
  "dojo/_base/lang",
  "dojo/dom-construct",
  "dojo/dom-style",
  "dojo/_base/array",
  "esri/request",
  "esri/layers/WMSLayer",
  "mads/js/widgetIcon",
  "dijit/form/CheckBox",
  "dojo/store/Memory",
  "dijit/form/Select",
  "esri/request",
  "esri/dijit/util/busyIndicator",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dojo/text!./templates/wmsWidget.html"
], function(declare, on, lang, domConstruct, domStyle, array, esriRequest, WMSLayer, widgetIcon, checkBox, Memory, Select, esriRequest, busyIndicator, _WidgetBase, _TemplatedMixin, template){
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    baseClass: "wmsWidget",
    widgetIcon: null,
    widgetPanel: null,
    map: null,
    bI: null,
    //wmsList: null,
    //wmsListStore: null,
    constructor: function(params) {
      this.widgetIcon = new widgetIcon({config: params.config, widgetPanel: params.widgetPanel, widget: this});
      this.widgetPanel = params.widgetPanel;
      this.map = params.map;
      // show busy circle when loading wms
      this.bI = busyIndicator.create({target: this.widgetPanel.id, imageUrl: "widgets/images/loading.gif", backgroundOpacity: 0});


    },

    postCreate: function() {
      this.getWmsServicesList();
    },

    getWmsServicesList: function() {
      var windowUrl = window.location.pathname;
      windowUrl = windowUrl.replace("index.html", "");
      var requestHandle = esriRequest({
        url: windowUrl + "config/wms.json",
        handleAs: "json"
      });
      requestHandle.then(lang.hitch(this, function(response) {
        array.forEach(response.services, lang.hitch(this, function(service) {
          // look for layer ids that starts with
          var opt = document.createElement('option');
          opt.value = service.url;
          opt.innerHTML = service.name;
          this.wmsSelect.appendChild(opt);
        }));

        on(this.wmsSelect, "change", lang.hitch(this, function(e){
          this.wmsSearchInput.value = e.target.selectedOptions[0].value;
        }));
      }), lang.hitch(this, function(error) {
        console.log("Error. Can't get wms services list. Error message: ", error.message);
        //this.setupLayerListAndDisplayLayer();
      }));
    },

    checkWmsInput: function() {
      // check if there is form input value
  		if (this.wmsSearchInput.value.length > 0) {
  			this.connectToWmsService();
  		}
  		else {
  			this.wmsRequestMessage.innerHTML = "Input service URL.";
  		}
  	},

    clearWmsLayerList: function()
  	{
  		// hide list section and display search section
  	   this.wmsSearchInput.value = '';
  		 domConstruct.empty(this.wmsLayerListSection);
  	   this.wmsRequestMessage.innerHTML = '';
  		 domStyle.set(this.wmsInputSection, "display", "block");
  		 domStyle.set(this.wmsLayerListSection, "display", "none");
       domStyle.set(this.wmsClearLayerList, "display", "none");

       // remove layers from the map
       var layerIds = lang.clone(this.map.layerIds);
       array.forEach(layerIds, lang.hitch(this, function(layerId) {
         // look for layer ids that starts with
         if (layerId.startsWith("wmsLayer_")) {
           var lyr = this.map.getLayer(layerId);
           this.map.removeLayer(lyr);
         }
       }));
  	},

    connectToWmsService: function() {
      var map = this.map;
      var bI = this.bI;
      // show busy circle
      bI.show();
      var serviceUrl = this.wmsSearchInput.value;
      var wmsRequestMessage = this.wmsRequestMessage;
      var wmsInputSection = this.wmsInputSection;
      var wmsLayerListSection = this.wmsLayerListSection;
      // add get capabilities parameter to input url
      var serviceGetCapabilitiesUrl = serviceUrl+"?request=GetCapabilities&service=WMS";
      // create a wms request
      var serviceRequest = esriRequest({
  		  url: serviceGetCapabilitiesUrl,
  		  handleAs: "xml"
  		});
  		serviceRequest.then(wmsRequestSucceeded, wmsRequestFailed);

      function wmsRequestSucceeded(xml) {
        var wmsLayer = new WMSLayer(serviceUrl);
        // when wms created - create wms layer list
  			wmsLayer.on("load", createWmsLayerList);
        // hide search section and display list section
  			domStyle.set(wmsInputSection, "display", "none");
  			domStyle.set(wmsLayerListSection, "display", "block");
        domStyle.set(this.wmsClearLayerList, "display", "block");
  		}

      function wmsRequestFailed(error) {
  			console.log("requestFailedWMS", error.message);
  			wmsRequestMessage.innerHTML = 'Unable to load service.';
        // hide busy circle
        bI.hide();
  		}

      function createWmsLayerList(evt) {
        // create url node
        if (evt.layer.url) {
  				domConstruct.create('div', {
  					"innerHTML": "<span style='font-weight: bold'> WMS URL: </span>" + evt.layer.url,
  					"class": "wmsItem"
  				}, wmsLayerListSection);
  			}
        // create title node
  			if (evt.layer.title) {
  				domConstruct.create('div', {
  					"innerHTML": "<span style='font-weight: bold'> WMS title: </span>" + evt.layer.title,
  					"class": "wmsItem"
  				}, wmsLayerListSection);
  			}
        // create description node
  			if (evt.layer.description) {
  				domConstruct.create('div', {
  					"innerHTML": "<span style='font-weight: bold'> WMS description: </span>" + evt.layer.description,
  					"class": "wmsItem"
  				}, wmsLayerListSection);
  			}
        // create layer list nodes for each wms layer
  			if (evt.layer.layerInfos.length > 0) {
  				domConstruct.create('div', {
  					"innerHTML": "<span style='font-weight: bold;'> WMS layers: </span>",
  					"class": "wmsItem"
  				}, wmsLayerListSection);
  				array.forEach(evt.layer.layerInfos, function(layerInfo) {
  					addLayerNode(evt.layer.title, layerInfo);
  				});
  			}
        // hide busy circle
        bI.hide();
      }

      function addLayerNode(title, layerInfo) {
        // if layer is a leaf construct layer list nodes
        if (layerInfo.subLayers.length === 0) {
          var layerNode = domConstruct.create("div", {
  					"class": "wmsLayerContainer"
  				}, wmsLayerListSection);
          var layerTextNode = domConstruct.create("div", null, layerNode);
          var layerLegendNode = domConstruct.create("div", null, layerNode);
  				var layerTitleNode = domConstruct.create("div", {
  					"innerHTML": layerInfo.title,
  					"class": "wmsLayerTitle"
  				});
  				domConstruct.place(layerTitleNode, layerTextNode, "first");
          // check box to show/hide layer
          var cb = new dijit.form.CheckBox({
              "class": "wmsLayerCheckbox"
            }
          );
          cb.placeAt(layerTextNode, "last");

          // show/hide layer and show legend on check box state change
          on(cb, "change", function(checked){
            if (checked) {
              bI.show();
              addLayerToMap(layerInfo.name);
              if (layerInfo.legendURL) {
                var image = domConstruct.create('img', {
                  "src": layerInfo.legendURL
                }, layerLegendNode);
              }
            }
            else {
              var lyr = map.getLayer("wmsLayer_"+layerInfo.name);
              map.removeLayer(lyr);
              domConstruct.empty(layerLegendNode);
            }
          });
        }
        // if group layer - do not include in the list. Add node for each sublayer
        else {
          array.forEach(layerInfo.subLayers, function(layerInfo) {
  					addLayerNode(layerInfo.title, layerInfo);
  				});
        }

  		}

      // Create separate wms layer for each layer added to the map
      function addLayerToMap(layername) {
  			var wmsLayer0 = new WMSLayer(serviceUrl, {"id": "wmsLayer_"+layername});
  			wmsLayer0.on("load", function(evt) {
      		wmsLayer0.setVisibleLayers([layername]);
  				map.addLayer(wmsLayer0);
    		});
        wmsLayer0.on("update-end", function(e) {
    			bI.hide();
    		});
  		}
    }




    /*,
    postCreate: function() {
      console.log(this.wmswidgetIcon);
      on(this.wmswidgetIcon, "click", lang.hitch(this, function(){
        alert("sudas");
      }));
    }*/
  });
});

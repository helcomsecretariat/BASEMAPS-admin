define([
  "dojo/_base/declare",
  "dojo/_base/lang", "dojo/_base/fx",  // "dojo/mouse", "dojo/dom-class", "dojo/_base/window",
  "dojo/on",
  "dojo/dom",
  "dojo/query",
  "dojo/dom-style",
  "dojo/request",
  "dojo/_base/array", "dojo/dom-construct",  //"dojo/query!css3",
  "dojo/store/Memory","dijit/tree/ObjectStoreModel", "dijit/Tree", "dijit/form/FilteringSelect",
  "dijit/form/CheckBox", "dijit/Tooltip",
  "basemaps/js/utils",
  "//openlayers.org/en/v4.4.2/build/ol.js",
  //"esri/request", "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
  //"dijit/form/HorizontalSlider", "dijit/form/HorizontalRule", "dijit/form/HorizontalRuleLabels",
  "dijit/_WidgetBase", "dijit/_TemplatedMixin",
  "dojo/text!../templates/adminLayerList.html",
  "dojo/text!../templates/adminFormsOneLabel.html",
], function(
  declare,
  lang, baseFx,  //domStyle, mouse, domClass, win,
  on,
  dom,
  query,
  domStyle,
  request,
  array, domConstruct, //array, query,
  Memory, ObjectStoreModel, Tree, FilteringSelect,
  checkBox, Tooltip,
  utils,
  ol,
  //esriRequest, IdentifyTask, IdentifyParameters,
  //HorizontalSlider, HorizontalRule, HorizontalRuleLabels,
  _WidgetBase, _TemplatedMixin, template,
  adminFormsOneLabel
){
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    baseClass: "adminLayerList",
    map: null,
    utils: null,
    configLayers: null,
    tree: null,
    store: null,
    data: null,
    dataFiltering: [{ id: 'layerlist', leaf: false}],
    legendInfo: {},
    metadataIDS: {},
    identify: {},
    visitedNodesIds: {},
    formsContainer: null,
    constructor: function(params) {
    	this.formsContainer = params.forms;
    	this.utils = new utils();
    	this.data = [{ id: 'layerlist', leaf: false}];
    	
    	// SUKURTI formos obiektą
    	
    },
    
    topCategoryButtonClick: function() {
    	console.log(this.formsContainer);
    	var adminFormsHeader = dom.byId("adminFormsHeader");
    	adminFormsHeader.innerHTML = "LAbas";
    	var adminFormsBody = dom.byId("adminFormsBody");
    	domConstruct.place(adminFormsOneLabel, adminFormsBody);
	},
	
	topLayerButtonClick: function() {
		alert("topLayerButtonClick");
	},
	
	adminFormSaveClick: function() {
    	//domConstruct.place(adminFormsOneLabel, this.formsContainer.adminFormsBody);
	},
	
	adminFormCancelClick: function() {
		alert("close");
		var adminFormsBody = dom.byId("adminFormsBody");
		domConstruct.empty(adminFormsBody);
	},

    postCreate: function() {
      /*this.getLegendInfo();
      this.getMetadataIDS();*/
      //console.log("OpenLayers.ProxyHost", ol.ProxyHost);
      //ol.ProxyHost = "http://62.236.121.188/website/MADS/v11_js_29-06-2017/proxy/proxy.ashx?url=''";
      //console.log("OpenLayers.ProxyHost", ol.ProxyHost);
      
    	this.getLayersData();
    	//this.createTree();

      // on search button click
      /*on(this.collapseLayerList, "click", lang.hitch(this, function(){
        var llcnode = dom.byId("layerlistContainer");
        //var llcnode = dijit.byId("layerlistContainer").domNode;
        var containerWidth = domStyle.get(llcnode, "width");
        var slidePane = dojo.animateProperty({
          node: llcnode,
          duration: 500,
          properties: {
              width: {
                  end: 25
              }
          },
          onBegin: function(){
            document.getElementById("collapseLayerList").style.display = "none";
          },
          onEnd: function(){
            document.getElementById("layerlistSectionsContainer").style.display = "none";
            document.getElementById("expandLayerList").style.display = "block";
            var zoomcontroll = dojo.query('.ol-zoom')[0];
            domStyle.set(zoomcontroll, {"left": "5px"});
          }
        });
        slidePane.play();

        var zoomcontroll = dojo.query('.ol-zoom')[0];
        var slideZoom = dojo.animateProperty({
          node: zoomcontroll,
          duration: 500,
          properties: {
              left: {
                  end: 30
              }
          }
        });
        slideZoom.play();
      }));

      on(this.expandLayerList, "click", lang.hitch(this, function(){
        var llcnode = dom.byId("layerlistContainer");
        //var llcnode = dijit.byId("layerlistContainer").domNode;
        var containerWidth = domStyle.get(llcnode, "width");
        var slidePane = dojo.animateProperty({
          node: llcnode,
          duration: 500,
          properties: {
              width: {
                  end: 350
              }
          },
          onBegin: function(){
            document.getElementById("layerlistSectionsContainer").style.display = "block";
            document.getElementById("expandLayerList").style.display = "none";
          },
          onEnd: function(){
            document.getElementById("collapseLayerList").style.display = "block";
          }
        });
        slidePane.play();

        var zoomcontroll = dojo.query('.ol-zoom')[0];
        var slideZoom = dojo.animateProperty({
          node: zoomcontroll,
          duration: 500,
          properties: {
              left: {
                  end: 355
              }
          }
        });
        slideZoom.play();
      }));*/

      // on collapse button click
      /*on(this.collapseAllButton, "click", lang.hitch(this, function(){
        this.tree.collapseAll();
      }));

      // on hide button click
      on(this.hideAllButton, "click", lang.hitch(this, function(){
        //this.hideAllClicked = true;
        for (var id in this.visitedNodesIds) {
          if (this.visitedNodesIds.hasOwnProperty(id)) {
            var n = this.tree.getNodeFromItem(id);
            delete this.visitedNodesIds[id];
            domStyle.set(n.rowNode, {
              "background-color": ""
            });
            if (n.checkBox) {
              n.checkBox.set("checked", false);
            }
          }
        }
      }));*/
    },
    
    destroy: function() {
    	
    },
    
    getLayersData: function() {
		var url = "sc/categories/tree";
		request.get(url, {
			handleAs: "json"
		}).then(
			lang.hitch(this, function(response){
				if (response.type == "error") {
					console.log(response);
				}
				else if (response.type == "success") {
					this.createTree(response.item);
				}
			}),
			lang.hitch(this, function(error){
				alert("Something went wrong (on categories/tree). Please contact administrator.");
				console.log(error);
			})
		);
	},
    
    // get all services layers legend info from rest
    getLegendInfo: function() {
      var requestHandle = null;
      array.forEach(this.map.layerIds, lang.hitch(this, function(layerId){
        if (layerId !== "Basemap") {
          var lyr = this.map.getLayer(layerId);
          requestHandle = esriRequest({
            url: lyr.url+"/legend",
            content: { f: "json" },
            handleAs: "json",
            callbackParamName: "callback"
          });
          requestHandle.then(lang.hitch(this, function(response) {
            this.legendInfo[layerId] = [];
            array.forEach(response.layers, lang.hitch(this, function(layer){
              this.legendInfo[layerId][layer.layerId] = layer.legend;
            }));
          }), lang.hitch(this, function(error) {
            console.log("Error. Can't get legend info for " + layerId + ". Error message: ", error.message);
          }));
        }
      }));
    },

    /*getMetadataIDS: function() {
      var windowUrl = window.location.pathname;
      windowUrl = windowUrl.replace("index.html", "");
      var requestHandle = esriRequest({
        url: windowUrl + "config/metadataIDS.json",
        //url: "http://62.236.121.188/website/MADS/v10_js_11-05-2017/config/metadataIDS.json",
        handleAs: "json"
      });
      requestHandle.then(lang.hitch(this, function(response) {
        this.metadataIDS = response;
        this.setupLayerListAndDisplayLayer();
      }), lang.hitch(this, function(error) {
        console.log("Error. Can't get metadata IDs. Error message: ", error.message);
        this.setupLayerListAndDisplayLayer();
      }));
    },

    setupLayerListAndDisplayLayer: function() {
      this.createTree();
      var datasetID = this.getURLParameter("datasetID");
      if (datasetID) {
        this.showLayer(datasetID);
      }
    },*/

    addLayerToDataArray: function(layer, parentLayerId, topGroup) {
    	//var isLeaf = (layer.children.length > 0 ? false : true);
    	var isLeaf = (layer.name ? true : false);
    	var lyr = {
			id: layer.id,
			parent: parentLayerId,
			name: layer.label,
			topGroup: topGroup,
			//leaf: !layer.isGroup,
			leaf: isLeaf,
			wms: null,
			wfs: null,
			metadata: null
    	};
    	/*if (isLeaf) {
			lyr["wms"] = layer.wms;
			lyr["wfs"] = layer.wfs;
			lyr["metadata"] = layer.metadata;
    	}*/
    	this.data.push(lyr);
    	if (!isLeaf) {
    		this.dataFiltering.push(lyr);
    		array.forEach(layer.layers, lang.hitch(this, function(l){
    			this.addLayerToDataArray(l, layer.id, false);
    		}));
    	}
    },

    createDataArray: function(input) {
    	array.forEach(input, lang.hitch(this, function(record){
    		this.addLayerToDataArray(record, "layerlist", true);
    	}));
    	
      /*for(var i=this.map.layerIds.length-1; i>=0; i--){
        var layerId = this.map.layerIds[i];
        if (layerId !== "Basemap") {
          // add top most level to layer list
          this.data.push({id: layerId+"_top", parent: "layerlist", name: layerId, topGroup: true, leaf: false, layer: layerId});

          var lyr = this.map.getLayer(layerId);
          //for each layer in service
          array.forEach(lyr.layerInfos, lang.hitch(this, function(lyrInfo){

            // check if layer is a leaf
            var isLeaf = false;
            if (lyrInfo.subLayerIds) {
              isLeaf = false;
            }
            else {
              isLeaf = true;
            }
            // add all levels and set parent levels
            if (lyrInfo.parentLayerId === -1) {
              this.data.push({id: layerId+"_"+lyrInfo.id, parent: layerId+"_top", name: lyrInfo.name, topGroup: false, leaf: isLeaf, layer: layerId, visibilityId: lyrInfo.id, metadataId: this.metadataIDS[layerId+"_"+lyrInfo.id]});
            }
            else {
              this.data.push({id: layerId+"_"+lyrInfo.id, parent: layerId+"_"+lyrInfo.parentLayerId, name: lyrInfo.name, topGroup: false, leaf: isLeaf, layer: layerId, visibilityId: lyrInfo.id, metadataId: this.metadataIDS[layerId+"_"+lyrInfo.id]});
            }
          }));

          // create Identify Task for each service
          //var idp = new IdentifyParameters();
          //idp.tolerance = 6;
          //idp.returnGeometry = true;
          //idp.layerOption = IdentifyParameters.LAYER_OPTION_TOP;
          //idp.layerIds = [];

          //this.identify[layerId] = {
          //  "task": new IdentifyTask(lyr.url),
          //  "params": idp
          //};
        }
      //}));
      }*/
    },

    /*validURL: function(url) {
      var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
      '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
      '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
      '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
      '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
      '(\#[-a-z\d_]*)?$','i'); // fragment locater
      if(!pattern.test(url)) {
        return false;
      } else {
        return true;
      }
    },*/

    createTree: function(input) {
      var mapa = this.map;
      var visitedNodesIds = this.visitedNodesIds;

      /*var urlPattern = new RegExp('^(https?:\/\/)?'+ // protocol
      '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
      '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
      '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
      '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
      '(\#[-a-z\d_]*)?$','i'); // fragment locater
      */
      //var validURL = this.validURL;
      //var identify = this.identify;
      //var legendInfo = this.legendInfo;
      this.createDataArray(input);

      // data store for layerlist
      var treeStore = new Memory({
        data: this.data,
        getChildren: function(object){
            return this.query({parent: object.id});
        }
      });
      this.store = treeStore;

      var treeModel = new ObjectStoreModel({
        store: treeStore,
        query: {id: 'layerlist'}
      });

      // data store for search (doesn't include layers, but just layer groups)
      /*var storeFiltering = new Memory({
        data: this.dataFiltering
      });
      var filteringSelect = new FilteringSelect({
        id: "layerSearchInput",
        name: "layerSearch",
        class: "layerSearchInput",
        queryExpr: "*${0}*",
        autoComplete: false,
        required: false,
        forceWidth: true,
        hasDownArrow: false,
        placeHolder: "Search...",
        store: storeFiltering,
        searchAttr: "name",
        onChange: lang.hitch(this, function(state){
          var id = dijit.byId("layerSearchInput").get('value');
          this.showLayer(id);
          // clear search field
          dijit.byId("layerSearchInput").set("value", "");
        })
      }, this.layerSearchInput).startup();*/

      this.tree = new Tree({
        model: treeModel,
        showRoot: false,
        getIconClass:function(item, opened){

        },
        getNodeFromItem: function (id) {
          //return this._itemNodesMap[item.name[0]];
          return this._itemNodesMap[ id ][0];
        },

        _createTreeNode: function(args) {
          var tnode = new dijit._TreeNode(args);
          tnode.labelNode.innerHTML = args.label;
          // if tree node is a service layer
          //if (tnode.item.topGroup) {
        	  //console.log("if (tnode.item.topGroup) {", tnode.item);
            // get the service layer for changing opacity and moving up and down
            //var layerOpacity = mapa.getLayer(tnode.item.layer);
            // create an arrow button to open menu
            //var topGroupButton = domConstruct.create("div", { "class": "topGroupButton" }, tnode.rowNode, "last");
            // open menu and hide previously open menu
            /*on(topGroupButton, "click", function(){
                query(".layerTopGroupMenu").forEach(function(node){
                domStyle.set(node, {"display": "none"});
              });
              var pos = dojo.position(topGroupButton, true);
              domStyle.set(layerTopGroupMenu, {"top": pos.y +13+"px", "left": pos.x+"px", "display": "block"});
            });*/

            // create a menu
            //var layerTopGroupMenu = domConstruct.create("div", { "class": "layerTopGroupMenu" }, win.body(), "last");
            // create opacity thing
            //var opacityThing = domConstruct.create("div", { "class": "layerTopGroupMenuContainer", "style": "margin-bottom: 20px" }, layerTopGroupMenu, "last");
            //var opacityLabel = domConstruct.create("div", { "class": "layerTopGroupMenuLabels", innerHTML: "Layers opacity" }, opacityThing, "first");
            //var sliderDiv = domConstruct.create("div", { "class": "sliderDiv" }, opacityThing, "last");
            /*var slider = new HorizontalSlider({
              name: "slider",
              value: layerOpacity.opacity,
              minimum: 0,
              maximum: 1,
              intermediateChanges: true,
              showButtons: false,
              onChange: function(value){
                layerOpacity.setOpacity(value);
              }
            }, sliderDiv);

            var sliderLabelsNode = domConstruct.create("div", {}, opacityThing, "last");
            var sliderLabels = new HorizontalRuleLabels({
              container: "bottomDecoration",
              labelStyle: "font-size: 10px;",
              labels: ["min", "max"]
            }, sliderLabelsNode);

            slider.startup();
            sliderLabels.startup();*/

            // create move up and down things
            //var upThing = domConstruct.create("div", { "class": "layerTopGroupMenuMoveUp", innerHTML: "Move up" }, layerTopGroupMenu, "last");
            //var downThing = domConstruct.create("div", { "class": "layerTopGroupMenuMoveDown", innerHTML: "Move down" }, layerTopGroupMenu, "last");

            // on up thing clicked change layer order, move tree node and reposition menu
            /*on(upThing, "click", function(){
              mapa.reorderLayer(layerOpacity, mapa.layerIds.indexOf(tnode.item.name)+1);
              dojo.place(tnode.domNode, tnode.domNode.previousSibling, "before");
              var pos = dojo.position(topGroupButton, true);
              domStyle.set(layerTopGroupMenu, {"top": pos.y +13+"px", "left": pos.x+"px", "display": "block"});
            });*/

            // on up thing clicked change layer order, move tree node and reposition menu
            /*on(downThing, "click", function(){
              // because of the Basemap layer has always index 0, check layers position before reordering
              if (mapa.layerIds.indexOf(tnode.item.name) > 1) {
                mapa.reorderLayer(layerOpacity, mapa.layerIds.indexOf(tnode.item.name)-1);
                dojo.place(tnode.domNode, tnode.domNode.nextSibling, "after");
                var pos = dojo.position(topGroupButton, true);
                domStyle.set(layerTopGroupMenu, {"top": pos.y +13+"px", "left": pos.x+"px", "display": "block"});
              }
            });*/

          //}
          // if tree node is a data layer
          //else if (tnode.item.leaf) {
          if (tnode.item.leaf) {
            domConstruct.destroy(tnode.expandoNode);
            var cb = new dijit.form.CheckBox();
            cb.placeAt(tnode.contentNode, "first");

            // set sublayers label width depending on sublayer level in the tree
            var rowNodePadding = domStyle.get(tnode.rowNode, "padding-left");
            var labelNodeWidth = 258 - rowNodePadding;
            domStyle.set(tnode.labelNode, {"width": labelNodeWidth+"px"});

            // metadata button
            /*var metadataButton;
            //if(urlPattern.test(tnode.item.metadata)) {
            if(tnode.item.metadata.length > 0) {
              metadataButton = domConstruct.create("div", { "class": "metadataButtonActive" }, tnode.contentNode, "last");
              new Tooltip({
                connectId: [metadataButton],
                showDelay: 100,
                label: "View metadata"
              });
            }
            else {
              metadataButton = domConstruct.create("div", { "class": "metadataButtonInactive" }, tnode.contentNode, "last");
              new Tooltip({
                connectId: [metadataButton],
                showDelay: 100,
                label: "Metadata not available"
              });
            }*/
            /*if (validURL(tnode.item.metadata)) {
              console.log("valid");
            }
            else {
              console.log("not valid");
            }*/
            //console.log(regexp.url(tnode.item.metadata));

            /*new Tooltip({
              connectId: [metadataButton],
              showDelay: 100,
              label: "View metadata"
            });*/
            /*if ((tnode.item.wms.url.length == 0) || (tnode.item.wms.layerName.length == 0)) {
              domStyle.set(tnode.labelNode, {"color": "#C3C3C3"});
              cb.set('disabled', true);
              new Tooltip({
                connectId: [tnode.rowNode],
                showDelay: 100,
                label: "Data are not available for displaying."
              });
            }*/


            // create legend node
            /*tnode.item.legendContainerDiv = domConstruct.create("div", { "class": "legendContainerDiv" }, tnode.rowNode, "last");
            var legendURL = tnode.item.wms.url + "?SERVICE=WMS&VERSION="+tnode.item.wms.version+"&SERVICENAME="+tnode.item.wms.servicename+"&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&LOGIN="+tnode.item.wms.login+"&PASSWORD="+tnode.item.wms.password+"&LAYER="+tnode.item.wms.layerName;
            var image = domConstruct.create('img', {
              "src": legendURL
            }, tnode.item.legendContainerDiv);*/
            //var layer = mapa.getLayer(tnode.item.layer);
            //var lIs = legendInfo[layer.id][tnode.item.visibilityId];
            // create legend row
            /*array.forEach(lIs, lang.hitch(this, function(lI){
              var legendRow = domConstruct.create("div", { "class": "legendRow" }, legendContainerDiv, "last");

              legendRow.innerHTML = lI.label;
              var legendRowStyle = {
                "background-image": 'url("'+layer.url+'/'+tnode.item.visibilityId+'/images/' + lI.url+'")',
                "line-height": lI.height+"px",
                "padding-left": lI.width+5+"px",
                "margin-left": "22px",
                "width": 238-rowNodePadding+"px"
              };
              domStyle.set(legendRow, legendRowStyle);
            }));*/

            // on sublayer check box click
            on(cb, "change", function(checked){
              //var visible = layer.visibleLayers;
              if (checked) {
                if (!tnode.item.wmsMapLayer) {
                  if ((tnode.item.wms.url.length > 0) && (tnode.item.wms.layerName.length > 0)) {
                    tnode.item.wmsMapLayer = new ol.layer.Tile({
                      id: tnode.item.id,
                      source: new ol.source.TileWMS({
                        url: tnode.item.wms.url,
                        params: {
                          SERVICENAME: tnode.item.wms.servicename,
                          LAYERS: tnode.item.wms.layerName,
                          LOGIN: tnode.item.wms.login,
                          PASSWORD: tnode.item.wms.password,
                          //TILED: false,
                          //VERSION: tnode.item.wms.version,
                          VERSION: "1.3.0",
                          CRS: "EPSG:3857"
                        }
                      })
                    });
                    /*tnode.item.wmsMapLayer = new ol.layer.Image({
                      source: new ol.source.ImageWMS({
                        url: tnode.item.wms.url,
                        params: {
                          SERVICENAME: tnode.item.wms.servicename,
                          LAYERS: tnode.item.wms.layerName,
                          LOGIN: tnode.item.wms.login,
                          PASSWORD: tnode.item.wms.password//,
                          //TILED: false,
                          //VERSION: tnode.item.wms.version,
                          //SRS: "EPSG:3857"
                        },
                        ratio: 1
                      })
                    });*/
                    console.log(tnode.item.wmsMapLayer.getSource().url);
                    mapa.addLayer(tnode.item.wmsMapLayer);
                    domStyle.set(tnode.item.legendContainerDiv, "display", "block");
                  }
                  else {
                    alert("This layer is not available.");
                  }
                }
                else {
                  tnode.item.wmsMapLayer.setVisible(true);
                  domStyle.set(tnode.item.legendContainerDiv, "display", "block");
                }
                /*if (!tnode.item.wfsMapLayer) {
                  if ((tnode.item.wfs.url.length > 0) && (tnode.item.wfs.layerName.length > 0)) {

                      var vectorSource = new ol.source.Vector({
                        format: new ol.format.GeoJSON(),
                        url: function(extent) {
                          return 'http://arealinformation.miljoeportal.dk/gis/services/public/MapServer/WFSServer?service=WFS&' +
                                  'version=1.1.0&request=GetFeature&typeName=HABITAT_OMR&' +
                                  'outputFormat=text/xml&srsname=EPSG:3857&' +
                                  'bbox=' + extent.join(',') + ',EPSG:3857';
                        },
                        strategy: ol.loadingstrategy.bbox
                      });
                      tnode.item.wfsMapLayer = new ol.layer.Vector({
                        source: vectorSource,
                        style: new ol.style.Style({
                          stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 100, 1.0)',
                            width: 1
                          })
                        })
                      });

                      mapa.addLayer(tnode.item.wfsMapLayer);
                  }
                  else {
                    alert("This layer is not available.");
                  }

                }
                else {
                  tnode.item.wfsMapLayer.setVisible(true);
                }*/



                // make sublayer visible
                //visible.push(tnode.item.visibilityId);
                //layer.setVisibleLayers(visible);

                // show legend
                //domStyle.set(legendContainerDiv, "display", "block");

                // add sublayer for identify task
                //identify[tnode.item.layer].params.layerIds.push(tnode.item.visibilityId);

                // set tree path nodes style on select
                array.forEach(tnode.tree.path, lang.hitch(this, function(object, i){
                  if (i>0) {
                    var n = tnode.tree.getNodeFromItem(object.id);
                    domStyle.set(n.rowNode, {
                      "background-color": "#A5C0DE"
                    });
                    if (visitedNodesIds.hasOwnProperty(object.id)) {
                      visitedNodesIds[object.id] = visitedNodesIds[object.id] + 1;
                    }
                    else {
                      visitedNodesIds[object.id] = 1;
                    }
                  }
                }));
                //console.log(visitedNodesIds);
              }
              else {
                if (tnode.item.wmsMapLayer) {
                  tnode.item.wmsMapLayer.setVisible(false);
                }
                // hide sublayer
                //var index = visible.indexOf(tnode.item.visibilityId);
                //if (index > -1) {
                  //visible.splice(index, 1);
                  //layer.setVisibleLayers(visible);

                  // remove sublayer for identify task
                  //identify[tnode.item.layer].params.layerIds.splice(index, 1);

                  // remove tree path nodes style on unselect
                  //console.log(tnode.tree.path);

                  array.forEach(tnode.tree.path, lang.hitch(this, function(object, i){
                    if (i>0) {
                        var n = tnode.tree.getNodeFromItem(object.id);
                        if (visitedNodesIds[object.id] == 1) {
                          delete visitedNodesIds[object.id];
                          domStyle.set(n.rowNode, {
                            "background-color": ""
                          });
                        }
                        else if (visitedNodesIds[object.id] > 1) {
                          visitedNodesIds[object.id] = visitedNodesIds[object.id] - 1;
                        }
                    }
                  }));
                  //}
                  //console.log(visitedNodesIds);
                //}
                // hide legend
                domStyle.set(tnode.item.legendContainerDiv, "display", "none");
              }
            });
            tnode.checkBox = cb;

            // on row menu button click


            /*on(metadataButton, "click", function(){
              if (tnode.item.metadata.length > 0) {
                window.open(tnode.item.metadata, '_blank');
              }
            });*/

          }
          return tnode;
        }
      });
      this.tree.placeAt(this.adminLayerListTree);
      this.tree.startup();
    },

    showLayer: function(id) {
      var layerId = null;
      // if layer id passed as a paramether
      if (this.store.get(id)) {
        layerId = id;
      }
      // if metadata id passed as a paramether
      /*else {
        for (var property in this.metadataIDS) {
          if (this.metadataIDS.hasOwnProperty(property)) {
            if (this.metadataIDS[property] === id) {
              layerId = property;
            }
          }
        }
      }*/

      var treePath = [];
      if (layerId) {
        while (this.store.get(layerId).parent) {
          treePath.unshift(layerId);
          layerId = this.store.get(layerId).parent;

        }
        treePath.unshift("layerlist");
        this.tree.set('paths', [treePath]).then(lang.hitch(this, function(path) {
          // expand found group
          if(!this.tree.selectedNode.isExpanded){
            this.tree._expandNode(this.tree.selectedNode);
          }

          /*if (this.tree.selectedNode.contentNode.children.length > 0) {
            var widget = dijit.byNode(this.tree.selectedNode.contentNode.children[0]);
            if ((widget) && (widget.type === "checkbox")) {
              // check the checkbox to make sublayer visible
              widget.set('checked', true);
            }
          }*/
          var selectedTreeElement = document.getElementById(this.tree.selectedNode.id);
          document.getElementById("layerListTreeID").scrollTop = selectedTreeElement.offsetTop;
        }));
      }
      else {
        //alert("No layer with Id " + id);
      }
    },

    getURLParameter: function(name) {
			return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
		}
  });
});

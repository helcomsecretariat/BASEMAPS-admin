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
	"widgets/servicePanelWidget",
	"basemaps/js/utils",
	"basemaps/js/ol",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin",
	"dojo/text!../templates/layerlistWidget.html"
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
		layerListMode: "INPUT",
		tree: null,
		mspWmsUrl: "https://maps.helcom.fi/arcgis/services/PBS126/MspOutputData/MapServer/WMSServer",
		mspTree: null,
		store: null,
		mspStore: null,
		data: [{id: 'layerlist', leaf: false}],
		mspData: [{id: 'msplayerlist', checked: true}],
		mspArcgisLayers: null,
		mspAllParentsChecked: false,
		mspGetCapabilitiesFetched: false,
		mspArcgisRestFetched: false,
		dataFiltering: [{id: 'msplayerlist', leaf: false}],
		legendInfo: {},
		metadataIDS: {},
		identify: {},
		visitedNodesIds: {},
		rootLayerId: "layerlist",
		rootMspLayerId: "msplayerlist",
		servicePanel: null,
		constructor: function(params) {
			this.map = params.map;
			this.utils = new utils();
		},

		postCreate: function() {
			this.servicePanel = new servicePanelWidget();
			this.getLayersData();
			this.getMspLayersData();
    	
			on(this.collapseLayerList, "click", lang.hitch(this, function() {
				var llcnode = dom.byId("layerlistContainer");
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

			on(this.expandLayerList, "click", lang.hitch(this, function() {
				var llcnode = dom.byId("layerlistContainer");
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
			}));

			// on collapse button click
			on(this.collapseAllButton, "click", lang.hitch(this, function() {
				this.tree.collapseAll();
				this.utils.show("servicePanel", "none");
			}));

			// on hide button click
			on(this.hideAllButton, "click", lang.hitch(this, function() {
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
				this.utils.show("servicePanel", "none");
			}));
			
			// on MSP intput data button click
			on(this.inputDataView, "click", lang.hitch(this, function() {
				dojo.removeClass(this.inputDataView, "layerListViewButton");
				dojo.addClass(this.inputDataView, "layerListViewButtonActive");
				dojo.removeClass(this.outputDataView, "layerListViewButtonActive");
				dojo.addClass(this.outputDataView, "layerListViewButton");
				this.utils.show("layerListSection", "block");
				this.utils.show("mspLayerListSection", "none");
				this.layerListMode = "INPUT";
			}));
			
			// on MSP output data button click
			on(this.outputDataView, "click", lang.hitch(this, function() {
				dojo.removeClass(this.outputDataView, "layerListViewButton");
				dojo.addClass(this.outputDataView, "layerListViewButtonActive");
				dojo.removeClass(this.inputDataView, "layerListViewButtonActive");
				dojo.addClass(this.inputDataView, "layerListViewButton");
				this.utils.show("layerListSection", "none");
				this.utils.show("mspLayerListSection", "block");
				this.layerListMode = "OUTPUT";
			}));
		},
		
		getMspLayersData: function() {
			//var mspArcgisUrl = "http://maps.helcom.fi/arcgis/rest/services/PBS126/MspOutputData/MapServer?f=pjson";
			//var mspArcgisUrl = "https://hc-gis02:6443/arcgis/rest/services/PBS126/MspOutputData/MapServer?f=pjson";
			
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
			
			/*fetch(mspArcgisUrl).then(
					lang.hitch(this, function(response) {
						return response.text();
					})
				).then(
					lang.hitch(this, function(text) {
						this.mspArcgisRestFetched = true;
						console.log("WMS fetched");
						if (this.mspGetCapabilitiesFetched) {
							domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
						}
						var arcgisJson = JSON.parse(text);
						this.mspArcgisLayers = arcgisJson.layers;
					})
				);*/
			
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
			
			/*fetch(mspGetCapabilitiesUrl).then(
				lang.hitch(this, function(response) {
					return response.text();
				})
			).then(
				lang.hitch(this, function(text) {
					this.mspGetCapabilitiesFetched = true;
					console.log("WMS fetched");
					if (this.mspArcgisRestFetched) {
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
					var result = mspGetCapabilitiesParser.read(text);
					this.createMspTree(result.Capability.Layer);
				})
			);*/
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
				//console.log(layer);
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
					
					//var infoButton = null;
					//if ((tnode.item.type == "WMS") || (tnode.item.type == "WFS")){
					/*if (tnode.item.type == "WMS") {
						infoButton = domConstruct.create("div", { "class": "wmsGreenIcon" }, tnode.contentNode, "last");
					}
					else if (tnode.item.type == "WFS") {
						infoButton = domConstruct.create("div", { "class": "wfsBlueIcon" }, tnode.contentNode, "last");
					}
					
					on(infoButton, "click", function() {
						that.servicePanel.header = tnode.item.name;
						that.getLabelsFromRoot(tnode.item.parent);
						that.servicePanel.setupAndShowServicePanel(tnode.item);
					});*/
					
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
						/*tnode.item.wmsMapLayer.on('rendercomplete', function(event) {
							console.log("loaded", tnode.item.name);
						});*/
						tnode.item.wmsMapLayer.setVisible(false);
						mapa.addLayer(tnode.item.wmsMapLayer);
						
						/*var showLegendButton = domConstruct.create("div", { "class": "metadataButtonActive" }, tnode.contentNode, "last");
						var hideLegendButton = domConstruct.create("div", { "class": "metadataButtonActive" }, tnode.contentNode, "last" );
						domStyle.set(hideLegendButton, "display", "none");
						on(showLegendButton, "click", function(){
							domStyle.set(tnode.item.legendContainerDiv, "display", "block");
							domStyle.set(hideLegendButton, "display", "inline-block");
							domStyle.set(showLegendButton, "display", "none");
						});
						on(hideLegendButton, "click", function(){
							domStyle.set(tnode.item.legendContainerDiv, "display", "none");
							domStyle.set(hideLegendButton, "display", "none");
							domStyle.set(showLegendButton, "display", "inline-block");
						});*/
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
								//var nodes = that.theTree.getNodesByItem(item.id);
			                    if(!tnode.isExpanded) {
			                    	that.mspTree._expandNode(tnode);
			                    }
							}
							
							// set tree path nodes style on select
							/*array.forEach(tnode.tree.path, lang.hitch(this, function(object, i) {
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
							}));*/
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
            
							/*array.forEach(tnode.tree.path, lang.hitch(this, function(object, i) {
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
							}));*/
						}
					});
					tnode.checkBox = cb;
					//}
					return tnode;
				}
			});
			this.mspTree.placeAt(this.mspLayerListTree);
			this.mspTree.startup();
			/*this.mspTree.onLoadDeferred.then(lang.hitch(this, function() {
				array.forEach(this.mpsTreePaths, lang.hitch(this, function(node) {
					this.mspTree._expandNode(node);
				}));
				
				console.log(this.mpsTreePaths);
				//this.mspTree.set('paths', this.mpsTreePaths );	
			}));*/
		},
    
		getLayersData: function() {
			var url = "sc/categories/tree";
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log(response);
					}
					else if (response.type == "success") {
						console.log("tree", response.item);
						this.createTree(response.item);
					}
				}),
				lang.hitch(this, function(error){
					alert("Something went wrong (on categories/tree). Please contact administrator.");
					console.log(error);
				})
			);
		},

		addLayerToDataArray: function(layer, parentLayerId) {
			var lyr = {
				id: layer.id.toString(),
				parent: parentLayerId,
				name: layer.label,
				helcomId: layer.helcomMetadata,
				type: null,
				wms: null,
				wfs: null,
				download: null,
				arcgis: null,
				metadata: layer.metadata,
				emptyCategory: false
			};
    	
			if ((layer.wmses) && (layer.wmses[0])) {
				lyr.wms = layer.wmses[0];
				lyr.type = "WMS";
			}
			if ((layer.wfses) && (layer.wfses[0])) {
				lyr.wfs = layer.wfses[0];
				lyr.type = "WFS";
			}
			if ((layer.others) && (layer.others[0])) {
				if (layer.others[0].type == "DOWNLOAD") {
					lyr.download = layer.others[0];
					lyr.type = "DOWNLOAD";
				}
				else if (layer.others[0].type == "ARCGIS") {
					lyr.arcgis = layer.others[0];
					lyr.type = "ARCGIS";
				}
			}
			if (layer.layers) {
				lyr.type = "CATEGORY";
				if (layer.layers.length == 0) {
					lyr.emptyCategory = true;
				}
			}
			if (!lyr.emptyCategory) {
				this.data.push(lyr);
			}
				
			if (lyr.type == "CATEGORY") {
				this.dataFiltering.push(lyr);
				layer.layers.sort(this.comparePosition);
				array.forEach(layer.layers, lang.hitch(this, function(l) {
					this.addLayerToDataArray(l, layer.id.toString());
				}));
			}
		},

		createDataArray: function(input) {
			input.sort(this.comparePosition);
			array.forEach(input, lang.hitch(this, function(record) {
				this.addLayerToDataArray(record, this.rootLayerId);
			}));
		},
		
		getLabelsFromRoot: function(id) {
			var storeElem = this.store.query({id: id})[0];
			var part = storeElem.name + " -> ";
			this.servicePanel.header = part.concat(this.servicePanel.header);
			if (storeElem.parent != this.rootLayerId) {
				this.getLabelsFromRoot(storeElem.parent);
			}
		},
		
		comparePosition: function(a,b) {
			if (a.position < b.position)
				return -1;
			if (a.position > b.position)
				return 1;
			return 0;
		},

		createTree: function(input) {
			var mapa = this.map;
			var that = this;
			var visitedNodesIds = this.visitedNodesIds;

			this.createDataArray(input);

			// data store for layerlist
			var treeStore = new Memory({
				data: this.data,
				getChildren: function(object){
					return this.query({parent: object.id});
				}/*,
				getParent: function(object){
					return this.query({id: object.parent});
				}*/
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
					return this._itemNodesMap[ id ][0];
				},

				_createTreeNode: function(args) {
					var tnode = new dijit._TreeNode(args);
					tnode.labelNode.innerHTML = args.label;

					/*if (tnode.item.emptyCategory) {
						//domStyle.set(tnode.labelNode, {"color": "#999999"});
						domStyle.set(tnode.labelNode, {"display": "none"});
					}*/
          
					var infoButton = null;
					var infoLabel = null;
					if ((tnode.item.type == "WMS") || (tnode.item.type == "WFS") || (tnode.item.type == "DOWNLOAD") || (tnode.item.type == "ARCGIS")) {
						if (tnode.item.type == "WMS") {
							//domStyle.set(tnode.labelNode, {"color": "green"});
							infoButton = domConstruct.create("div", { "class": "wmsGreenIcon" }, tnode.contentNode, "last");
							infoLabel = "WMS layer";
						}
						else if (tnode.item.type == "WFS") {
							//domStyle.set(tnode.labelNode, {"color": "blue"});
							infoButton = domConstruct.create("div", { "class": "wfsBlueIcon" }, tnode.contentNode, "last");
							infoLabel = "WFS feature type";
						}
						else if (tnode.item.type == "DOWNLOAD") {
							infoButton = domConstruct.create("div", { "class": "downloadOrangeIcon" }, tnode.contentNode, "last");
							infoLabel = "Downloadable resource";
						}
						else if (tnode.item.type == "ARCGIS") {
							infoButton = domConstruct.create("div", { "class": "arcgisPurpleIcon" }, tnode.contentNode, "last");
							infoLabel = "ArcGIS REST MapServer layer";
						}
						
						if (infoButton != null) {
							new Tooltip({
								connectId: [infoButton],
								showDelay: 10,
								position: ["below"],
								label: infoLabel
							});
						}
						
						/*on(infoButton, "click", function() {
							console.log("infoButton", tnode.item);
							that.servicePanel.header = tnode.item.name;
							that.getLabelsFromRoot(tnode.item.parent);
							that.servicePanel.setupAndShowServicePanel(tnode.item);
						});*/
						
						domConstruct.destroy(tnode.expandoNode);
						var cb = new dijit.form.CheckBox();
						cb.placeAt(tnode.contentNode, "first");
						
						// set sublayers label width depending on sublayer level in the tree
						var rowNodePadding = domStyle.get(tnode.rowNode, "padding-left");
						var labelNodeWidth = 245 - rowNodePadding;
						domStyle.set(tnode.labelNode, {"width": labelNodeWidth+"px"});

						// metadata button
						//var metadataButton = domConstruct.create("div", { "class": "metadataButtonActive" }, tnode.contentNode, "last");

						// create WMS legend node
						if (tnode.item.type == "WMS") {
							tnode.item.legendContainerDiv = domConstruct.create("div", { "class": "legendContainerDiv" }, tnode.rowNode, "last");
							if (tnode.item.wms.styles.length > 0) {
								var legendURL = tnode.item.wms.styles[0].urls[0];
								var image = domConstruct.create('img', {
									"src": legendURL
								}, tnode.item.legendContainerDiv);
							}
						}
												
						// on sublayer check box click
						on(cb, "change", function(checked) {
							if (checked) {
								console.log("check", tnode.item);
								if (tnode.item.type == "WMS") {
									//console.log("checked", tnode.item);
									if (!tnode.item.wmsMapLayer) {
										if ((tnode.item.wms.url.length > 0) && (tnode.item.wms.name.length > 0)) {
											tnode.item.wmsMapLayer = new ol.layer.Tile({
												id: tnode.item.id,
												wmsId: tnode.item.wms.id,
												name: tnode.item.name,
												identifyFormats: tnode.item.wms.info.formats,
												source: new ol.source.TileWMS({
													url: tnode.item.wms.url,
													params: {
														LAYERS: tnode.item.wms.name,
														STYLES: (tnode.item.wms.styles[0] ? tnode.item.wms.styles[0].name : ""),
														//TILED: false,
														VERSION: tnode.item.wms.info.version,
														//VERSION: "1.3.0",
														CRS: "EPSG:3857"
													}
												})
											});
	                   
											mapa.addLayer(tnode.item.wmsMapLayer);
											domStyle.set(tnode.item.legendContainerDiv, "display", "block");
	                    
											if (tnode.item.wms.info.boundWest) {
												var view = mapa.getView();
												view.fit(ol.proj.transformExtent([tnode.item.wms.info.boundWest, tnode.item.wms.info.boundSouth, tnode.item.wms.info.boundEast, tnode.item.wms.info.boundNorth], 'EPSG:4326', 'EPSG:3857'));
											}
										}
										else {
											alert("This layer is not available.");
										}
									}
									else {
										tnode.item.wmsMapLayer.setVisible(true);
										domStyle.set(tnode.item.legendContainerDiv, "display", "block");
									}
	
									if ((typeof tnode.item.wms.info.scaleMax == "number") || (typeof tnode.item.wms.info.scaleMin == "number")) {
										that.servicePanel.header = tnode.item.name;
										that.getLabelsFromRoot(tnode.item.parent);
										that.servicePanel.setupAndShowScaleMessage(tnode.item.wms.info.scaleMin, tnode.item.wms.info.scaleMax);
									}
								}
								//else {
								that.servicePanel.header = tnode.item.name;
								that.getLabelsFromRoot(tnode.item.parent);
								that.servicePanel.setupAndShowServicePanel(tnode.item);
								//}
								
								// set tree path nodes style on select
								array.forEach(tnode.tree.path, lang.hitch(this, function(object, i) {
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
							}
							else {
								console.log("unclick", tnode.item);
								if (tnode.item.type == "WMS") {
									if (tnode.item.wmsMapLayer) {
										tnode.item.wmsMapLayer.setVisible(false);
									}
									// hide legend
									domStyle.set(tnode.item.legendContainerDiv, "display", "none");
								}
								
								that.servicePanel.cleanServicePanel();
								that.utils.show("servicePanel", "none");
								
								array.forEach(tnode.tree.path, lang.hitch(this, function(object, i) {
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
							}
						});
						tnode.checkBox = cb;
					}
					return tnode;
				}
			});
			this.tree.placeAt(this.layerListTree);
			this.tree.startup();
		},

		showLayer: function(id) {
			var layerId = null;
			// if layer id passed as a paramether
			if (this.store.get(id)) {
				layerId = id;
			}
			var treePath = [];
			if (layerId) {
				while (this.store.get(layerId).parent) {
					treePath.unshift(layerId);
					layerId = this.store.get(layerId).parent;
				}
				treePath.unshift("layerlist");
				this.tree.set('paths', [treePath]).then(lang.hitch(this, function(path) {
					// expand found group
					if (!this.tree.selectedNode.isExpanded) {
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

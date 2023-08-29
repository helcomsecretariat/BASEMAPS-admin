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
	"dojo/store/Memory","dijit/tree/ObjectStoreModel", "dijit/Tree",
	"dijit/form/CheckBox", "dijit/Tooltip",
	"dojox/widget/TitleGroup", "dijit/TitlePane", 
	"dijit/layout/AccordionContainer", "dijit/layout/ContentPane", "dijit/form/Select",
	"widgets/servicePanelWidget",
	"basemaps/js/utils",
	//"basemaps/js/ol",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin",
	"dojo/text!./templates/inputDataLayerList.html"
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
	Memory, ObjectStoreModel, Tree,
	checkBox, Tooltip,
	TitleGroup, TitlePane,
	AccordionContainer, ContentPane, Select,
	servicePanelWidget,
	utils,
	//ol,
	_WidgetBase, _TemplatedMixin, template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "layerlistWidget",
		utils: null,
		map: null,
		layerListMode: null,
		tree: null,
		store: null,
		data: [{id: 'layerlist', leaf: false}],
		dataFiltering: [{id: 'msplayerlist', leaf: false}],
		visitedNodesIds: {},
		rootLayerId: "layerlist",
		servicePanel: null,
		popupOverlay: null,
		popupContent: null,
		popupHeader: null,
		popupAttrTable: null,
		mapsLayersCount: null,
		layersCounter: null,
		identifyResults: [],
		highlightLayer: null,
		seaUseCodes: {},
		constructor: function(params) {
			this.map = params.map;
			this.servicePanel = params.sp;
			this.utils = new utils();
			this.layerListMode = "INPUT";
		},

		postCreate: function() {
			this.getSeaUseCodes();
			    	
			// on collapse button click
			on(this.collapseAllButton, "click", lang.hitch(this, function() {
				this.tree.collapseAll();
				this.utils.show("servicePanel", "none");
			}));

			// on hide button click
			on(this.hideAllButton, "click", lang.hitch(this, function() {
				this.hideAllLayers();
			}));
			
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
			
			this.map.addOverlay(this.popupOverlay);
			
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
				if (this.layerListMode == "INPUT") {
					this.cleanHighlight();
					var popupCoordinate = evt.coordinate;
					var viewResolution = this.map.getView().getResolution();
					var viewProjection = this.map.getView().getProjection();
									
					var layers = this.map.getLayers().getArray();
					this.mapsLayersCount = 0;
					for (var i = layers.length-1; i > 0; i--) {
						if (("wmsId" in layers[i].getProperties()) && (layers[i].getVisible())) {
							this.mapsLayersCount = this.mapsLayersCount + 1;
						}
					}
					
					this.layersCounter = 0;
					this.identifyResults = [];
					for (var i = layers.length-1; i > 0; i--) {
						if (("wmsId" in layers[i].getProperties()) && (layers[i].getVisible())) {
							var infoFormat = "application/json";
							var u = layers[i].getSource().getGetFeatureInfoUrl(popupCoordinate, viewResolution, viewProjection, {"buffer": 10, "INFO_FORMAT": ""});
							this.getInfo(layers[i].getProperties().wmsId, u, popupCoordinate, layers[i].getProperties().name);
						}
					}
					
					query(".metadataBox").forEach(function(node){
						domStyle.set(node, {"display": "none"});
					});
				}
			}));
		},
		
		hideAllLayers: function() {
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
			this.cleanHighlight();
		},
		
		getInfo: function(id, u, popupCoordinate, name) {
			var url = "sc/tools/get-features";
			var data = {
				"id": id,
				"url": u
			};
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
		
		cleanHighlight: function() {
			this.highlightLayer.setSource(null);
			this.popupHeader.innerHTML = "";
			domConstruct.empty(this.popupAttrTable);
			this.popupOverlay.setPosition(undefined);
			//popupCloser.blur();
		},
		
		getSeaUseCodes: function() {
			console.log("get codes");
			var serviceUrl = "sc/tools/get-data";
			var url = "https://maps.helcom.fi/arcgis/rest/services/Basemaps/MSPoutput/MapServer/7/query?where=1%3D1&outFields=Attribute_code_for_sea_use%2C+Basemaps&returnGeometry=false&f=json";
			var servicedata = {
				"url": url,
				"format": "json"
			};
			request.post(serviceUrl, this.utils.createPostRequestParams(servicedata)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log("Getting Sea Use Codes failed", response);
					}
					else if (response.type == "success") {
						if (response.item) {
							array.forEach(response.item.features, lang.hitch(this, function(feature) {
								this.seaUseCodes[feature.attributes.Attribute_code_for_sea_use] = feature.attributes.Basemaps;
							}));
						}
						console.log("got codes success");
					}
					this.getLayersData();
				}),
				lang.hitch(this, function(error) {
					alert("Something went wrong (on getSeuaUseCodes). Please contact administrator.");
					console.log(error);
				})
			);
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
						console.log(response.item);
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
				//helcomId: layer.helcomMetadata,
				description: layer.description,
				tags: null,
				type: null,
				wms: null,
				wfs: null,
				download: null,
				arcgis: null,
				metadata: layer.metadata,
				emptyCategory: false
			};
			
			if ((layer.tags != null) && (layer.tags.length > 0)) {
				let tmp = layer.tags.split(";");
				let tags = [];
				array.forEach(tmp, lang.hitch(this, function(tag) {
					tags.push(this.seaUseCodes[tag]);
				}));
				lyr.tags = tags;
			}
    	
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
						
						let tTip = new Tooltip({
							connectId: [tnode.contentNode],
							showDelay: 10,
							position: ["after"]
						});
						let tTipContent = domConstruct.create("div", {"style": "font-size: 13px;"}, tTip.domNode, "last");
						if (tnode.item.type == "WMS") {
							infoButton = domConstruct.create("div", { "class": "wmsGreenIcon" }, tnode.contentNode, "last");
							domConstruct.create("div", {"innerHTML": "WMS layer", "style": "font-size: 13px; font-weight: bold;"}, tTipContent, "last");
						}
						else if (tnode.item.type == "WFS") {
							infoButton = domConstruct.create("div", { "class": "wfsBlueIcon" }, tnode.contentNode, "last");
							domConstruct.create("div", {"innerHTML": "WFS feature type", "style": "font-size: 13px; font-weight: bold;"}, tTipContent, "last");
						}
						else if (tnode.item.type == "DOWNLOAD") {
							infoButton = domConstruct.create("div", { "class": "downloadOrangeIcon" }, tnode.contentNode, "last");
							domConstruct.create("div", {"innerHTML": "Downloadable resource", "style": "font-size: 13px; font-weight: bold;"}, tTipContent, "last");
						}
						else if (tnode.item.type == "ARCGIS") {
							infoButton = domConstruct.create("div", { "class": "arcgisPurpleIcon" }, tnode.contentNode, "last");
							domConstruct.create("div", {"innerHTML": "ArcGIS REST MapServer layer", "style": "font-size: 13px; font-weight: bold;"}, tTipContent, "last");
						}
						
						domConstruct.create("div", {"innerHTML": "Keywords:", "style": "font-size: 13px;"}, tTipContent, "last");
						array.forEach(tnode.item.tags, lang.hitch(this, function(tag) {
							domConstruct.create("div", {"innerHTML": tag, "style": "font-size: 13px; margin-left: 10px; color: #444; max-width: 300px;"}, tTipContent, "last");
						}));
						domConstruct.create("div", {"innerHTML": "Description:", "style": "font-size: 13px;"}, tTipContent, "last");
						domConstruct.create("div", {"innerHTML": tnode.item.description, "style": "font-size: 13px; margin-left: 10px; color: #444; max-width: 300px;"}, tTipContent, "last");
						
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
						// create ARCGIS legend node
						if (tnode.item.type == "ARCGIS") {
							var lastSlashIndex = tnode.item.arcgis.url.lastIndexOf("/");
							var layerNr = parseInt(tnode.item.arcgis.url.substring(lastSlashIndex+1));
							var legendUrl = tnode.item.arcgis.url.substring(0, lastSlashIndex) + "/legend?f=pjson";
							var serviceUrl = "sc/tools/get-data";
							
							var servicedata = {
								"url": tnode.item.arcgis.url.substring(0, lastSlashIndex) + "/legend?f=pjson",
								"format": "json"
							};
							console.log("get arcgis legend node", servicedata);
							request.post(serviceUrl, that.utils.createPostRequestParams(servicedata)).then(
								lang.hitch(that, function(response) {
									if (response.type == "error") {
										console.log("Can't get ArcGIS MapServer legend.", response);
										domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
									}
									else if (response.type == "success") {
										console.log("got arcgis legend node success");
										if (response.item) {
											var legendInfo = response.item.layers.find(layer => {
												return layer.layerId == layerNr
											});
											if (legendInfo) {
												tnode.item.legendContainerDiv = domConstruct.create("div", { "class": "legendContainerDiv" }, tnode.rowNode, "last");
												// create legend row	
												array.forEach(legendInfo.legend, lang.hitch(that, function(row){
													var legendRow = domConstruct.create("div", { "class": "legendRow" }, tnode.item.legendContainerDiv, "last");
													legendRow.innerHTML = row.label;
													var legendRowStyle = {
														"background-image": 'url("'+tnode.item.arcgis.url+'/images/' + row.url+'")',
														"line-height": row.height+"px",
														"padding-left": row.width+5+"px",
														"margin-left": "22px",
														"width": 238-rowNodePadding+"px"
													};
													domStyle.set(legendRow, legendRowStyle);
												}));
											}
										}
									}
								}),
								lang.hitch(that, function(error) {
									console.log(error);
									//domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
								})
							);
							/*fetch(legendUrl)
								.then(lang.hitch(this, function(response) {
									return response.text();
								}))
								.then(lang.hitch(this, function(text) {
									var resp = JSON.parse(text);
									if (resp.error) {
										console.log("Can't get ArcGIS MapServer legend.", resp.error);
									}
									else {
										var legendInfo = resp.layers.find(layer => {
											return layer.layerId == layerNr
										});
										//console.log(legendInfo);
										if (legendInfo) {
											tnode.item.legendContainerDiv = domConstruct.create("div", { "class": "legendContainerDiv" }, tnode.rowNode, "last");
											// create legend row	
											array.forEach(legendInfo.legend, lang.hitch(this, function(row){
												var legendRow = domConstruct.create("div", { "class": "legendRow" }, tnode.item.legendContainerDiv, "last");
												legendRow.innerHTML = row.label;
												var legendRowStyle = {
													"background-image": 'url("'+tnode.item.arcgis.url+'/images/' + row.url+'")',
													"line-height": row.height+"px",
													"padding-left": row.width+5+"px",
													"margin-left": "22px",
													"width": 238-rowNodePadding+"px"
												};
												domStyle.set(legendRow, legendRowStyle);
											}));
										}
									}
								}));*/
						}
												
						// on sublayer check box click
						on(cb, "change", function(checked) {
							if (checked) {
								console.log(tnode.item);
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
											if (tnode.item.legendContainerDiv) {
												domStyle.set(tnode.item.legendContainerDiv, "display", "block");
											}
	                    
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
										if (tnode.item.legendContainerDiv) {
											domStyle.set(tnode.item.legendContainerDiv, "display", "block");
										}
									}
	
									if ((typeof tnode.item.wms.info.scaleMax == "number") || (typeof tnode.item.wms.info.scaleMin == "number")) {
										that.servicePanel.header = tnode.item.name;
										that.getLabelsFromRoot(tnode.item.parent);
										that.servicePanel.setupAndShowScaleMessage(tnode.item.wms.info.scaleMin, tnode.item.wms.info.scaleMax);
									}
								}
								else if (tnode.item.type == "ARCGIS") {
									if (!tnode.item.agsMapLayer) {
										if (tnode.item.arcgis.url.length > 0) {
											var lastSlashIndex = tnode.item.arcgis.url.lastIndexOf("/");
											var layerNr = tnode.item.arcgis.url.substring(lastSlashIndex+1);
											var agsUrl = tnode.item.arcgis.url.substring(0, lastSlashIndex);
											tnode.item.agsMapLayer = new ol.layer.Image({
												id: tnode.item.id,
												agsId: tnode.item.arcgis.id,
												source: new ol.source.ImageArcGISRest({
													ratio: 1,
													url: agsUrl,
													params: {
														LAYERS: "show:"+layerNr
														//STYLES: (tnode.item.wms.styles[0] ? tnode.item.wms.styles[0].name : ""),
														//TILED: false,
														//VERSION: tnode.item.wms.info.version,
														//VERSION: "1.3.0",
														//CRS: "EPSG:3857"
													}
												})
											});
	                   
											mapa.addLayer(tnode.item.agsMapLayer);
											if (tnode.item.legendContainerDiv) {
												domStyle.set(tnode.item.legendContainerDiv, "display", "block");
											}
												                    
											/*if (tnode.item.wms.info.boundWest) {
												var view = mapa.getView();
												view.fit(ol.proj.transformExtent([tnode.item.wms.info.boundWest, tnode.item.wms.info.boundSouth, tnode.item.wms.info.boundEast, tnode.item.wms.info.boundNorth], 'EPSG:4326', 'EPSG:3857'));
											}*/
										}
										else {
											alert("This layer is not available.");
										}
									}
									else {
										tnode.item.agsMapLayer.setVisible(true);
										if (tnode.item.legendContainerDiv) {
											domStyle.set(tnode.item.legendContainerDiv, "display", "block");
										}
									}
	
									/*if ((typeof tnode.item.wms.info.scaleMax == "number") || (typeof tnode.item.wms.info.scaleMin == "number")) {
										that.servicePanel.header = tnode.item.name;
										that.getLabelsFromRoot(tnode.item.parent);
										that.servicePanel.setupAndShowScaleMessage(tnode.item.wms.info.scaleMin, tnode.item.wms.info.scaleMax);
									}*/
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
								if (tnode.item.type == "WMS") {
									if (tnode.item.wmsMapLayer) {
										tnode.item.wmsMapLayer.setVisible(false);
									}
									// hide legend
									if (tnode.item.legendContainerDiv) {
										domStyle.set(tnode.item.legendContainerDiv, "display", "none");
									}
									that.cleanHighlight();
								}
								else if (tnode.item.type == "ARCGIS") {
									if (tnode.item.agsMapLayer) {
										tnode.item.agsMapLayer.setVisible(false);
									}
									// hide legend
									if (tnode.item.legendContainerDiv) {
										domStyle.set(tnode.item.legendContainerDiv, "display", "none");
									}
									//that.cleanHighlight();
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

		/*showLayer: function(id) {
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

					//if (this.tree.selectedNode.contentNode.children.length > 0) {
					//	var widget = dijit.byNode(this.tree.selectedNode.contentNode.children[0]);
					//	if ((widget) && (widget.type === "checkbox")) {
					//		// check the checkbox to make sublayer visible
					//		widget.set('checked', true);
					//	}
					//}
					var selectedTreeElement = document.getElementById(this.tree.selectedNode.id);
					document.getElementById("layerListTreeID").scrollTop = selectedTreeElement.offsetTop;
				}));
			}
			else {
				//alert("No layer with Id " + id);
			}
		},*/

		getURLParameter: function(name) {
			return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
		}
	});
});

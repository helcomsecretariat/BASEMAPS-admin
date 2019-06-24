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
	"dojox/widget/TitleGroup", "dijit/TitlePane", 
	"dijit/layout/AccordionContainer", "dijit/layout/ContentPane", "dijit/form/Select",
	"widgets/servicePanelWidget",
	"widgets/inputDataLayerList",
	"widgets/outputDataLayerList",
	"basemaps/js/utils",
	//"basemaps/js/ol",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin",
	"dojo/text!../templates/leftPanel.html"
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
	checkBox, Tooltip,
	TitleGroup, TitlePane,
	AccordionContainer, ContentPane, Select,
	servicePanelWidget,
	inputDataLayerList,
	outputDataLayerList,
	utils,
	//ol,
	_WidgetBase, _TemplatedMixin, template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "leftPanel",
		utils: null,
		map: null,
		inputDataLL: null,
		outputDataLL: null,
		
		constructor: function(params) {
			this.map = params.map;
			this.utils = new utils();
		},

		postCreate: function() {
			var servicePanel = new servicePanelWidget();
			this.inputDataLL = new inputDataLayerList({map: this.map, sp: servicePanel}).placeAt(this.inputDataSection);
			this.outputDataLL = new outputDataLayerList({map: this.map, sp: servicePanel}).placeAt(this.outputDataSection);
			    	
			on(this.collapseLeftPanel, "click", lang.hitch(this, function() {
				var llcnode = dom.byId("leftPanelContainer");
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
						document.getElementById("collapseLeftPanel").style.display = "none";
					},
					onEnd: function(){
						document.getElementById("leftPanelSectionsContainer").style.display = "none";
						document.getElementById("expandLeftPanel").style.display = "block";
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

			on(this.expandLeftPanel, "click", lang.hitch(this, function() {
				var llcnode = dom.byId("leftPanelContainer");
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
						document.getElementById("leftPanelSectionsContainer").style.display = "block";
						document.getElementById("expandLeftPanel").style.display = "none";
					},
					onEnd: function(){
						document.getElementById("collapseLeftPanel").style.display = "block";
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

			// on MSP intput data button click
			on(this.inputDataView, "click", lang.hitch(this, function() {
				dojo.removeClass(this.inputDataView, "leftPanelViewButton");
				dojo.addClass(this.inputDataView, "leftPanelViewButtonActive");
				dojo.removeClass(this.outputDataView, "leftPanelViewButtonActive");
				dojo.addClass(this.outputDataView, "leftPanelViewButton");
				this.utils.show("inputDataSection", "block");
				this.utils.show("outputDataSection", "none");
				this.inputDataLL.layerListMode = "INPUT";
				this.outputDataLL.layerListMode = "INPUT";
				//this.outputDataLL.cleanMspHighlight();
				this.outputDataLL.hideAllLayers();
				this.mspFeaturesUrl = null;
			}));
			
			// on MSP output data button click
			on(this.outputDataView, "click", lang.hitch(this, function() {
				dojo.removeClass(this.outputDataView, "leftPanelViewButton");
				dojo.addClass(this.outputDataView, "leftPanelViewButtonActive");
				dojo.removeClass(this.inputDataView, "leftPanelViewButtonActive");
				dojo.addClass(this.inputDataView, "leftPanelViewButton");
				this.utils.show("inputDataSection", "none");
				this.utils.show("outputDataSection", "block");
				//this.utils.show("mspFilterContainerID", "none");
				//this.utils.show("mspLayerListTreeID", "none");
				this.inputDataLL.layerListMode = null;
				this.outputDataLL.layerListMode = null;
				this.inputDataLL.hideAllLayers();
			}));
		}
	});
});

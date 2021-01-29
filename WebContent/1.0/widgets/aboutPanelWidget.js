define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-style",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/_base/array",
	"basemaps/js/utils",
	"dijit/TitlePane"
], function(declare, lang, dom, domStyle, domConstruct, on, array, utils, TitlePane) {
	return declare(null, {
		utils: null,
		aboutPanel: null,
		header: "",
		infoContainer: null,
		closeButton: null,
		constructor: function() {
			this.utils = new utils();
			this.aboutPanel = new TitlePane({ id: "aboutPanel", class: "aboutPanelWidget"});
			domConstruct.place(this.aboutPanel.domNode, "mainWindow");
			this.aboutPanel.startup();
		    
			this.closeButton = domConstruct.create("div", { "class": "servicePanelWidgetCloseButton" }, this.aboutPanel.focusNode, "last");
		    on(this.closeButton, "click", lang.hitch(this, function() {
				this.utils.show("aboutPanel", "none");
			}));
		    
		    //var mspInputButton = domConstruct.create("div", { "class": "toolLink", "style": "margin-top: 10px; display: inline-block;", "innerHTML": "MSP input data manual"}, this.aboutPanel.containerNode, "last");
		    //var mspOutputButton = domConstruct.create("div", { "class": "toolLink", "style": "margin-left: 20px; margin-top: 10px; display: inline-block;", "innerHTML": "MSP output data manual"}, this.aboutPanel.containerNode, "last");
		    
		    domConstruct.create("div", { "style": "margin-top: 10px;", "innerHTML": "<b>Basemaps</b> is a map service to access Baltic Sea maritime spatial planning (MSP) data. The service contains two sections:"}, this.aboutPanel.containerNode, "last");
		    domConstruct.create("ul", { "style": "margin-top: 10px;", "innerHTML": "<li><b>MSP Input data section</b> contains MSP related input data that can be accessed directly from the original sources using web services.</li><li><b>MSP Output data section</b> contains MSP plan data provided by Countries in harmonized format according to the <a href='https://vasab.org/wp-content/uploads/2019/04/Guidelines-on-transboundary-MSP-output-data-structure-ADOPTEDbyVASAB__HELCOM.pdf' target='_blank'>Guidelines on transboundary MSP output data structure in the Baltic Sea</a>.</li>"}, this.aboutPanel.containerNode, "last");
		    domConstruct.create("div", { "style": "margin-top: 10px;", "innerHTML": "<a href= 'https://maps.helcom.fi/website/docs/BASEMAPS_Instructions_Admin.pdf' target='_blank'><b>Basemaps</b> user guide</a>"}, this.aboutPanel.containerNode, "last");
		    //domConstruct.create("div", { "style": "margin-top: 10px;", "innerHTML": "<a href= 'https://www.youtube.com/watch?v=XSIV03PeE4k' target='_blank'>Animated clip about<b>Basemaps</b></a>"}, this.aboutPanel.containerNode, "last");
		    domConstruct.create("div", { "style": "margin-top: 10px;", "innerHTML": "<b>Basemaps</b> was developed by HELCOM Secretariat under different projects related to Maritime Spatial Planning. If you have more questions or if you have technical issues, feel free to contact the HELCOM Secretariat at data@helcom.fi"}, this.aboutPanel.containerNode, "last");
		    
		    //var mspInputSection = domConstruct.create("div", { "style": "margin-top: 10px; font-style: italic;", "innerHTML": "<a href= 'http://www.helcom.fi/Documents/BASEMAPSInstructions_Users_V1.pdf' target='_blank'>MSP input data manual</a>"}, this.aboutPanel.containerNode, "last");
		    //var mspOutputSection = domConstruct.create("div", { "style": "display: none; margin-top: 10px; font-style: italic;", "innerHTML": "MSP input data manual is not available yet."}, this.aboutPanel.containerNode, "last");
		    
		    /*on(mspInputButton, "click", lang.hitch(this, function() {
		    	domStyle.set(mspOutputSection, "display", "none");
		    	domStyle.set(mspInputSection, "display", "block");
			}));
		    on(mspOutputButton, "click", lang.hitch(this, function() {
		    	domStyle.set(mspInputSection, "display", "none");
		    	domStyle.set(mspOutputSection, "display", "block");
			}));*/
		},
		setupAndShowAboutPanel: function(info) {
			this.aboutPanel.set("title", "About Basemaps");
			this.aboutPanel.set("open", true);
			//this.constructPopupInfo(info);
			this.utils.show("aboutPanel", "block");
		}
	});
});

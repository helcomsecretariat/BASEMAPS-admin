define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/_base/array",
	"basemaps/js/utils",
	"dijit/TitlePane"
], function(declare, lang, dom, domConstruct, on, array, utils, TitlePane){
	return declare(null, {
		utils: null,
		servicePanel: null,
		header: "",
		infoContainer: null,
		constructor: function() {
			this.utils = new utils();
			this.servicePanel = new TitlePane({ id: "servicePanel", class: "servicePanelWidget"});
			domConstruct.place(this.servicePanel.domNode, "mainWindow");
			this.servicePanel.startup();
		    
			var closeButton = domConstruct.create("div", { "class": "servicePanelWidgetCloseButton" }, this.servicePanel.focusNode, "last");
		    on(closeButton, "click", lang.hitch(this, function() {
				this.cleanServicePanel();
				this.utils.show("servicePanel", "none");
			}));
		    
		    this.infoContainer = domConstruct.create("div", { "class": "servicePanelInfoContainer" }, this.servicePanel.containerNode, "last");
		},
		cleanServicePanel: function() {
			domConstruct.empty(this.infoContainer);
		},
		setupAndShowServicePanel: function(info) {
			this.cleanServicePanel();
			this.servicePanel.set("title", this.header);
			this.servicePanel.set("open", true);
			console.log(info);
			if (info.type == "WMS") {
				this.constructWmsInfo(info);
			}
			
			
			
			
			this.utils.show("servicePanel", "block");
		},
		constructWmsInfo: function(info) {
			if (info.type) {
				this.buildInfoElement("Service type", info.type);
				if (info.wms.info.organisation)
					this.buildInfoElement("Host organization", info.wms.info.organisation);
				else
					this.buildInfoElement("Host organization", "No information");
				
				if (info.wms.url)
					this.buildInfoElement("Wms url", info.wms.url);
				
				if (info.wms.name)
					this.buildInfoElement("Wms layer name", info.wms.name);
				
				if ((info.wms.info.languages) && (info.wms.info.languages.length > 0))
					this.buildInfoElement("Language support", info.wms.info.languages);
				else
					this.buildInfoElement("Language support", "No information");
				
				if (info.wms.info.queryable != null)
					this.buildInfoElement("Identification support", info.wms.info.queryable);		
				else
					this.buildInfoElement("Identification support", "No information");
					
				if (info.wms.info.scaleMax)
					this.buildInfoElement("Max display scale", info.wms.info.scaleMax);
				else
					this.buildInfoElement("Max display scale", "No max display scale limit or information about it is not provided");
				
				if (info.wms.info.scaleMin)
					this.buildInfoElement("Min display scale", info.wms.info.scaleMin);
				else
					this.buildInfoElement("Min display scale", "No min display scale limit or information about it is not provided");
				
				if ((info.metadata.length) && (info.metadata.length > 0))
					this.buildMetadataContainer(info.metadata);
				else
					this.buildInfoElement("Metadata", "No metadata provided");
			}
		},
		buildInfoElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "servicePanelInfoElementContainer"}, this.infoContainer, "last");
			var infoLabel = domConstruct.create("div", { "class": "servicePanelInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "servicePanelInfoElementValue", "innerHTML": value }, infoContainer, "last");
		},
		buildMetadataContainer: function(metadata) {
			var container = domConstruct.create("div", {"style": "margin-top: 20px;"}, this.infoContainer, "last");
			array.forEach(metadata, lang.hitch(this, function(record) {
				var subcontainer = domConstruct.create("div", {"class": "servicePanelMetadataBox"}, container, "last");
				
				var provider = domConstruct.create("div", {"style": "display: table;"}, subcontainer, "last");
				var providerLabel = domConstruct.create("span", { "class": "servicePanelInfoElementLabel", "innerHTML": "Metadata source: " }, provider, "last");
				var providerValue = domConstruct.create("span", { "class": "servicePanelInfoElementValue", "innerHTML": record.source }, provider, "last");
				
				var format = domConstruct.create("div", {"style": "display: table;"}, subcontainer, "last");
				var formatLabel = domConstruct.create("span", { "class": "servicePanelInfoElementLabel", "innerHTML": "Metadata format: " }, format, "last");
				var formatValue = domConstruct.create("span", { "class": "servicePanelInfoElementValue", "innerHTML": record.format }, format, "last");
				
				var url = domConstruct.create("div", {"style": "display: table;"}, subcontainer, "last");
				var urlLabel = domConstruct.create("span", { "class": "servicePanelInfoElementLabel", "innerHTML": "URL: " }, url, "last");
				var urlValue = domConstruct.create("a", { "class": "servicePanelInfoElementValue", "href": record.url, "target": "_blank", "innerHTML": record.url }, url, "last");
			}));
		}
	});
});

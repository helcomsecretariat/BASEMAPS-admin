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
			if (info.type == "WMS") {
				this.constructWmsInfo(info);
			}
			else if (info.type == "WFS") {
				this.constructWfsInfo(info);
				console.log(info);
			}
			this.utils.show("servicePanel", "block");
		},
		setupAndShowScaleMessage: function(min, max) {
			this.cleanServicePanel();
			this.servicePanel.set("title", this.header);
			this.servicePanel.set("open", true);
			if (typeof min == 'number') {
				var infoMin = "Minimum display scale for this layer is 1 : " + Math.ceil(min);
				domConstruct.create("div", {/*"class": "scaleMessage", */"innerHTML": infoMin}, this.infoContainer, "last");
			}
			if (typeof max == 'number') {
				var infoMax = "Maximum display scale for this layer is 1 : " + Math.ceil(max);
				domConstruct.create("div", {/*"class": "scaleMessage", */"innerHTML": infoMax}, this.infoContainer, "last");
			}
			this.utils.show("servicePanel", "block");
		},
		setupAndShowWfsDownload: function(info) {
			console.log("check wfs");
			this.cleanServicePanel();
			this.servicePanel.set("title", this.header);
			this.servicePanel.set("open", true);
			
			domConstruct.create("div", {"innerHTML": "Get features of this WFS layer"}, this.infoContainer, "last");
			
			var url = info.wfs.url + "?service=wfs&version=" + info.wfs.info.version + "&request=GetFeature&typeNames=" + info.wfs.name;
			domConstruct.create("a", { "class": "formLink", "href": url, "target": "_blank", "innerHTML": "Download" }, this.infoContainer, "last");
			/*var button = domConstruct.create("div", {"class": "formLink", "innerHTML": "Download"}, this.infoContainer, "last");
			on(button, "click", lang.hitch(this, function() {
				var url = info.wfs.url + "?service=wfs&version=" + info.wfs.info.version + "&request=GetFeature&typeNames=" + info.wfs.name;
			    console.log("download", url);
			}));*/
			this.utils.show("servicePanel", "block");
		},
		constructWmsInfo: function(info) {
			if (info.type) {
				this.buildInfoElement("Service type", info.type);
				if (info.wms.info.organisation)
					this.buildInfoElement("Host organization", info.wms.info.organisation);
				else
					this.buildInfoElement("Host organization", "No information");
				
				if (info.wms.info.accessConstraints)
					this.buildInfoElement("Access constraints", info.wms.info.accessConstraints);
				
				if (info.wms.info.fees)
					this.buildInfoElement("Fees", info.wms.info.fees);
				
				if (info.wms.url)
					this.buildInfoElement("Wms url", info.wms.url);
				
				if (info.wms.name)
					this.buildInfoElement("Wms layer name", info.wms.name);
				
				if (info.wms.info.title)
					this.buildInfoElement("Wms layer title", info.wms.info.title);
				
				if (info.wms.info.description)
					this.buildInfoElement("Wms layer description", info.wms.info.description);
				
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
		constructWfsInfo: function(info) {
			if (info.type) {
				this.buildInfoElement("Service type", info.type);
				if (info.wfs.info.organisation)
					this.buildInfoElement("Host organization", info.wfs.info.organisation);
				else
					this.buildInfoElement("Host organization", "No information");
				
				if (info.wfs.info.accessConstraints)
					this.buildInfoElement("Access constraints", info.wfs.info.accessConstraints);
				
				if (info.wfs.info.fees)
					this.buildInfoElement("Fees", info.wfs.info.fees);
				
				if (info.wfs.url)
					this.buildInfoElement("Wfs url", info.wfs.url);
				
				if (info.wfs.name)
					this.buildInfoElement("Wfs layer name", info.wfs.name);
				
				if (info.wfs.info.title)
					this.buildInfoElement("Wfs layer title", info.wfs.info.title);
				
				if (info.wfs.info.description)
					this.buildInfoElement("Wfs layer description", info.wfs.info.description);
				
				if ((info.wfs.info.languages) && (info.wfs.info.languages.length > 0))
					this.buildInfoElement("Language support", info.wfs.info.languages);
				else
					this.buildInfoElement("Language support", "No information");
								
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
				
				var provider = domConstruct.create("div", {"style": "display: table; table-layout: fixed; width: 100%;"}, subcontainer, "last");
				var providerLabel = domConstruct.create("span", { "class": "servicePanelInfoElementLabel", "innerHTML": "Metadata source: " }, provider, "last");
				var providerValue = domConstruct.create("span", { "class": "servicePanelInfoElementValue", "innerHTML": record.source }, provider, "last");
				
				var format = domConstruct.create("div", {"style": "display: table; table-layout: fixed; width: 100%;"}, subcontainer, "last");
				var formatLabel = domConstruct.create("span", { "class": "servicePanelInfoElementLabel", "innerHTML": "Metadata format: " }, format, "last");
				var formatValue = domConstruct.create("span", { "class": "servicePanelInfoElementValue", "innerHTML": record.format }, format, "last");
				
				var url = domConstruct.create("div", {"style": "display: table; table-layout: fixed; width: 100%;"}, subcontainer, "last");
				var urlLabel = domConstruct.create("span", { "class": "servicePanelInfoElementLabel", "innerHTML": "URL: " }, url, "last");
				var urlValue = domConstruct.create("a", { "class": "servicePanelInfoElementValue", "href": record.url, "target": "_blank", "innerHTML": record.url }, url, "last");
			}));
		}
	});
});

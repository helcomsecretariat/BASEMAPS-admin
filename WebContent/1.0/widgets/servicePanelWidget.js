define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/_base/array",
	"basemaps/js/utils",
	"dijit/TitlePane",
	"dijit/Tooltip"
], function(declare, lang, dom, domConstruct, on, array, utils, TitlePane, Tooltip){
	return declare(null, {
		utils: null,
		servicePanel: null,
		header: "",
		infoContainer: null,
		closeButton: null,
		constructor: function() {
			this.utils = new utils();
			this.servicePanel = new TitlePane({ id: "servicePanel", class: "servicePanelWidget"});
			domConstruct.place(this.servicePanel.domNode, "mainWindow");
			this.servicePanel.startup();
		    
			this.closeButton = domConstruct.create("div", { "class": "servicePanelWidgetCloseButton" }, this.servicePanel.focusNode, "last");
		    on(this.closeButton, "click", lang.hitch(this, function() {
				this.cleanServicePanel();
				this.utils.show("servicePanel", "none");
			}));
		    
		    this.infoContainer = domConstruct.create("div", { "class": "servicePanelInfoContainer" }, this.servicePanel.containerNode, "last");
		},
		cleanServicePanel: function() {
			domConstruct.empty(this.infoContainer);
		},
		setupAndShowPopup: function(info) {
			//this.cleanServicePanel();
			this.servicePanel.set("title", this.header);
			this.servicePanel.set("open", true);
			this.constructPopupInfo(info);
			this.utils.show("servicePanel", "block");
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
			}
			else if (info.type == "DOWNLOAD") {	
				this.constructDownloadInfo(info);
			}
			else if (info.type == "ARCGIS") {
				this.constructArcgisInfo(info);
			}
			this.utils.show("servicePanel", "block");
		},
		setupAndShowScaleMessage: function(min, max) {
			this.cleanServicePanel();
			this.servicePanel.set("title", this.header);
			this.servicePanel.set("open", true);
			if ((typeof min == 'number') && (!(typeof max == 'number'))){
				var infoMin = "Layer is not shown above 1 : " + Math.ceil(min).toLocaleString() + " map scale.";
				domConstruct.create("div", {"innerHTML": infoMin}, this.infoContainer, "last");
			}
			else if ((typeof max == 'number') && (!(typeof min == 'number'))){
				var infoMax = "Layer is not shown below 1 : " + Math.ceil(max).toLocaleString() + " map scale.";
				domConstruct.create("div", {"innerHTML": infoMax}, this.infoContainer, "last");
			}
			else if ((typeof max == 'number') && (typeof min == 'number')) {
				var infoMax = "Layer is not shown above 1 : " + Math.ceil(min).toLocaleString() + " and below 1 : " + Math.ceil(max).toLocaleString()+ " map scale.";
				domConstruct.create("div", {"innerHTML": infoMax}, this.infoContainer, "last");
			}
			this.utils.show("servicePanel", "block");
		},
		setupAndShowWfsDownload: function(info) {
			this.cleanServicePanel();
			this.servicePanel.set("title", this.header);
			this.servicePanel.set("open", true);
			
			domConstruct.create("div", {"innerHTML": "Get features of WFS feature type"}, this.infoContainer, "last");
			
			var url = info.wfs.url + "?service=wfs&version=" + info.wfs.info.version + "&request=GetFeature&typeNames=" + info.wfs.name;
			domConstruct.create("a", { "class": "serviceWindowDownloadLink", "href": url, "target": "_blank", "innerHTML": "Download" }, this.infoContainer, "last");
			/*var button = domConstruct.create("div", {"class": "serviceWindowDownloadLink", "innerHTML": "Download"}, this.infoContainer, "last");
			on(button, "click", lang.hitch(this, function() {
				var url = info.wfs.url + "?service=wfs&version=" + info.wfs.info.version + "&request=GetFeature&typeNames=" + info.wfs.name;
			    console.log("download", url);
			}));*/
			this.utils.show("servicePanel", "block");
		},
		setupAndShowDownloadResource: function(info) {
			this.cleanServicePanel();
			this.servicePanel.set("title", this.header);
			this.servicePanel.set("open", true);
			
			domConstruct.create("div", {"innerHTML": "Download this resource"}, this.infoContainer, "last");
			domConstruct.create("a", { "class": "serviceWindowDownloadLink", "href": info.download.url, "target": "_blank", "innerHTML": "Download" }, this.infoContainer, "last");
			this.utils.show("servicePanel", "block");
		},
		constructWmsInfo: function(info) {
			if (info.type == "WMS") {
				this.buildInfoElement("Resource type", "WMS layer");
				if (info.wms.info.organisation)
					this.buildInfoElement("Host organization", info.wms.info.organisation);
				else
					this.buildInfoElement("Host organization", "No information");
				
				if (info.wms.info.accessConstraints) {
					if ((info.wms.info.accessConstraintsEn) && (info.wms.info.accessConstraintsEn.toLowerCase().replace(/\s/g, "") != info.wms.info.accessConstraints.toLowerCase().replace(/\s/g, ""))) {
						this.buildInfoElementTranslated("Access constraints", info.wms.info.accessConstraintsEn, info.wms.info.accessConstraints);
					}
					else {
						this.buildInfoElement("Access constraints", info.wms.info.accessConstraints);
					}
				}
					
				if (info.wms.info.fees) {
					if ((info.wms.info.feesEn) && (info.wms.info.feesEn.toLowerCase().replace(/\s/g, "") != info.wms.info.fees.toLowerCase().replace(/\s/g, ""))) {
						this.buildInfoElementTranslated("Fees", info.wms.info.feesEn, info.wms.info.fees);
					}
					else {
						this.buildInfoElement("Fees", info.wms.info.fees);
					}
				}
				
				if (info.wms.url)
					this.buildInfoElement("WMS url", info.wms.url);
				
				if (info.wms.name)
					this.buildInfoElement("WMS layer name", info.wms.name);
				
				if (info.wms.info.title) {
					if ((info.wms.info.titleEn) && (info.wms.info.titleEn.toLowerCase().replace(/\s/g, "") != info.wms.info.title.toLowerCase().replace(/\s/g, ""))) {
						this.buildInfoElementTranslated("WMS layer title", info.wms.info.titleEn, info.wms.info.title);
					}
					else {
						this.buildInfoElement("WMS layer title", info.wms.info.title);
					}
				}
				
				if (info.wms.info.description) {
					if ((info.wms.info.descriptionEn) && (info.wms.info.descriptionEn.toLowerCase().replace(/\s/g, "") != info.wms.info.description.toLowerCase().replace(/\s/g, ""))) {
						this.buildInfoElementTranslated("WMS layer description", info.wms.info.descriptionEn, info.wms.info.description);
					}
					else {
						this.buildInfoElement("WMS layer description", info.wms.info.description);
					}
				}
				
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
			if (info.type == "WFS") {
				var url = info.wfs.url + "?service=wfs&version=" + info.wfs.info.version + "&request=GetFeature&typeNames=" + info.wfs.name;
				domConstruct.create("a", { "class": "serviceWindowDownloadLink", "href": url, "target": "_blank", "innerHTML": "Get features of WFS feature type" }, this.infoContainer, "last");
				this.buildInfoElement("Resource type", "WFS feature type");
				if (info.wfs.info.organisation)
					this.buildInfoElement("Host organization", info.wfs.info.organisation);
				else
					this.buildInfoElement("Host organization", "No information");
				
				if (info.wfs.info.accessConstraints) {
					if ((info.wfs.info.accessConstraintsEn) && (info.wfs.info.accessConstraintsEn.toLowerCase().replace(/\s/g, "") != info.wfs.info.accessConstraints.toLowerCase().replace(/\s/g, ""))) {
						this.buildInfoElementTranslated("Access constraints", info.wfs.info.accessConstraintsEn, info.wfs.info.accessConstraints);
					}
					else {
						this.buildInfoElement("Access constraints", info.wfs.info.accessConstraints);
					}
				}
					
				if (info.wfs.info.fees) {
					if ((info.wfs.info.feesEn) && (info.wfs.info.feesEn.toLowerCase().replace(/\s/g, "") != info.wfs.info.fees.toLowerCase().replace(/\s/g, ""))) {
						this.buildInfoElementTranslated("Fees", info.wfs.info.feesEn, info.wfs.info.fees);
					}
					else {
						this.buildInfoElement("Fees", info.wfs.info.fees);
					}
				}
				
				if (info.wfs.url)
					this.buildInfoElement("WFS url", info.wfs.url);
				
				if (info.wfs.name)
					this.buildInfoElement("WFS feature type name", info.wfs.name);
				
				if (info.wfs.info.title) {
					if ((info.wfs.info.titleEn) && (info.wfs.info.titleEn.toLowerCase().replace(/\s/g, "") != info.wfs.info.title.toLowerCase().replace(/\s/g, ""))) {
						this.buildInfoElementTranslated("WFS feature type title", info.wfs.info.titleEn, info.wfs.info.title);
					}
					else {
						this.buildInfoElement("WFS feature type title", info.wfs.info.title);
					}
				}
								
				if (info.wfs.info.description) {
					if ((info.wfs.info.descriptionEn) && (info.wfs.info.descriptionEn.toLowerCase().replace(/\s/g, "") != info.wfs.info.description.toLowerCase().replace(/\s/g, ""))) {
						this.buildInfoElementTranslated("WFS feature type description", info.wfs.info.descriptionEn, info.wfs.info.description);
					}
					else {
						this.buildInfoElement("WFS feature type description", info.wfs.info.description);
					}
				}
				
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
		constructDownloadInfo: function(info) {
			if (info.type == "DOWNLOAD") {
				domConstruct.create("a", { "class": "serviceWindowDownloadLink", "href": info.download.url, "target": "_blank", "innerHTML": "Download this resource" }, this.infoContainer, "last");
				this.buildInfoElement("Resource type", "Downloadable resource");
				if (info.download.url)
					this.buildInfoElement("Downloadable resource url", info.download.url);
				if ((info.metadata.length) && (info.metadata.length > 0))
					this.buildMetadataContainer(info.metadata);
				else
					this.buildInfoElement("Metadata", "No metadata provided");
			}
		},
		constructArcgisInfo: function(info) {
			if (info.type == "ARCGIS") {
				this.buildInfoElement("Resource type", "ArcGIS REST MapServer layer");
				if (info.arcgis.url)
					this.buildInfoElement("ArcGIS MapServer url", info.arcgis.url);
				if ((info.metadata.length) && (info.metadata.length > 0))
					this.buildMetadataContainer(info.metadata);
				else
					this.buildInfoElement("Metadata", "No metadata provided");
			}
		},
		constructPopupInfo: function(info) {
			for (var property in info) {
				if (info.hasOwnProperty(property)) {
					this.buildInfoElement(property, info[property]);
				}
			}
		},
		buildInfoElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "servicePanelInfoElementContainer"}, this.infoContainer, "last");
			var infoLabel = domConstruct.create("div", { "class": "servicePanelInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "servicePanelInfoElementValue", "innerHTML": value }, infoContainer, "last");
		},
		buildInfoElementTranslated: function(label, value, valueOriginal) {
			var infoContainer = domConstruct.create("div", {"class": "servicePanelInfoElementContainer"}, this.infoContainer, "last");
			var infoLabel = domConstruct.create("div", { "class": "servicePanelInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "servicePanelInfoElementValueTranslated", "innerHTML": value }, infoContainer, "last");
			var tTip = new Tooltip({
				connectId: [infoValue],
				showDelay: 10,
				position: ["below"]
				//label: "Translated. Original text: <span style='font-weight: bold;'>" + valueOriginal + "</span>"
			});
			domConstruct.create("div", {"innerHTML": "Original text:", "style": "font-size: 13px; font-weight: bold;"}, tTip.domNode, "last");
			domConstruct.create("div", {"innerHTML": valueOriginal, "style": "width: 200px; font-size: 13px;"}, tTip.domNode, "last");
			var anchor = domConstruct.create("a", {"href": "http://aka.ms/MicrosoftTranslatorAttribution", "target": "_blank"}, tTip.domNode, "last");
			domConstruct.create("div", {"class": "translateMicrosoft"}, anchor, "last");
		},
		buildMetadataContainer: function(metadata) {
			var container = domConstruct.create("div", {"style": "margin-top: 20px;"}, this.infoContainer, "last");
			array.forEach(metadata, lang.hitch(this, function(record) {
				var subcontainer = domConstruct.create("div", {"class": "servicePanelMetadataBox"}, container, "last");
				
				/*var provider = domConstruct.create("div", {"style": "display: table; table-layout: fixed; width: 100%;"}, subcontainer, "last");
				var providerLabel = domConstruct.create("span", { "class": "servicePanelInfoElementLabel", "innerHTML": "Metadata source: " }, provider, "last");
				var providerValue = domConstruct.create("span", { "class": "servicePanelInfoElementValue", "innerHTML": record.source }, provider, "last");*/
				
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

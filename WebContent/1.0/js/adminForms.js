define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/query",
	"dojo/dom-style",
	"dojo/request",
	"dojox/validate/web",
	"dojo/_base/array",
	"dijit/form/Select",
	"basemaps/js/utils",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin",
	"dojo/text!../templates/adminForms.html"
], function(
	declare,
	lang, on, dom, domConstruct, query, domStyle,
	request, validate, array, 
	Select, utils,
	_WidgetBase, _TemplatedMixin, template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "adminForms",
		formView: null,
		action: null,
		utils: null,
		addingWmsWithCategory: false,
		addingWfsWithCategory: false,
		addingMetadataWithCategory: false,
		wmsValidationPassed: false,
		wmsNameSelector: null,
		wmsUpdate: false,
		metadataFormatSelector: null,
		
		constructor: function() {
			this.utils = new utils();
		},
		postCreate: function() {
			on(this.addDataCategoryButton, "click", lang.hitch(this, function(){
				this.utils.show("addDataForCategoryForm", "block");
			}));
			
			/* WMS section buttons events */
			on(this.addWmsButton, "click", lang.hitch(this, function(){
				this.utils.show("addWmsButton", "none");
				this.utils.show("addWmsForm", "block");
			}));
			
			on(this.updateWmsButton, "click", lang.hitch(this, function(){
				this.utils.show("updateWmsButton", "none");
				this.utils.show("wmsDisplayForm", "none");
				this.utils.show("addWmsForm", "block");
				//this.wmsUpdate = true;
			}));
			
			on(this.wmsCancelButton, "click", lang.hitch(this, function(){
				this.hideAddWmsForm();
			}));
			
			/* Metadata section buttons events */
			on(this.addMetadataButton, "click", lang.hitch(this, function(){
				this.utils.show("addMetadataButton", "none");
				//this.hideDisplayMetadataForm();
				this.setupMetadataFormatSelector();
				this.utils.show("addMetadataForm", "block");
			}));
			
			on(this.metadataCancelButton, "click", lang.hitch(this, function(){
				this.hideAddMetadataForm();
			}));
		},
		destroy: function() {
			
		},
		
		addWmsLinkClick: function() {
			if (!this.addingWmsWithCategory) {
				this.utils.show("addCategoryWmsForm", "block");
				this.addingWmsWithCategory = true;
			}
			else {
				this.hideAddWmsForm();
			}
		},
		
		addWfsLinkClick: function() {
			if (!this.addingWfsWithCategory) {
				this.utils.show("addCategoryWfsForm", "block");
				this.addingWfsWithCategory = true;
			}
			else {
				this.utils.show("addCategoryWfsForm", "none");
				this.addingWfsWithCategory = false;
			}
		},
		
		addMetadataLinkClick: function() {
			if (!this.addingMetadataWithCategory) {
				this.utils.show("addCategoryMetadataForm", "block");
				this.addingMetadataWithCategory = true;
			}
			else {
				this.utils.show("addCategoryMetadataForm", "none");
				this.addingMetadataWithCategory = false;
			}
		},
		
		setupCategoryForm: function(view, layer, headerText) {
			this.formView = view;
			this.utils.changeText("adminFormsHeader", headerText);
			if (layer != null) {
				// TODO: display category update form
				//this.wmsUpdate = true;
				console.log(layer);
				this.setupAddCategoryForm(layer.leaf, layer.emptyCategory, layer.name, layer.helcomId);
				if (layer.leaf) {
					if (layer.metadata) {
						if (layer.metadata.length > 0) {
							this.setupMetadataDisplayForm(layer.metadata);
						}
					}
					if (layer.wms) {
						this.wmsUpdate = true;
						this.setupWmsDisplayForm(layer.wms);
					}
				}
			}
			else {
				this.wmsUpdate = false;
			}
			this.utils.show("categoryForm", "block");
		},
		
		setupDeleteCategoryForm: function(headerText) {
			this.formView = "DELETE_CATEGORY";
			this.utils.changeText("adminFormsHeader", headerText);
			this.utils.show("deleteCategoryForm", "block");
		},
		
		setupWmsInfoForm: function(headerText, url, name) {
			this.formView = "WMS_INFO";
			this.utils.changeText("adminFormsHeader", headerText);
			this.utils.show("wmsInfoForm", "block");
			this.getWmsInfo(url, name);
		},
		
		setupMetadataForm: function(headerText, metadata) {
			this.formView = "METADATA";
			this.utils.changeText("adminFormsHeader", headerText);
			this.utils.show("metadataForm", "block");
			this.showMetadata(metadata);
		},
		
		formCleanUp: function() {
			this.utils.changeText("adminFormsHeader", "");
			this.utils.changeText("adminFormMessage", "");
	    	this.utils.show("adminFormMessage", "none");
	    	if (this.formView === "MANAGE_CATEGORY") {
	    		this.hideCategoryForm();
			} else if (this.formView === "DELETE_CATEGORY") {
				this.utils.show("deleteCategoryForm", "none");
			} else if (this.formView === "WMS_INFO") {
				domConstruct.empty(this.wmsInfoContainer);
				this.utils.show("wmsInfoForm", "none");
			} /*else if (this.formView === "METADATA") {
				this.hideMetadataForm();
			}*/
	    	this.formView = null;
	    	this.action = null;
		},
		
		getCategoryInputValue: function() {
			return this.utils.getInputValue("categoryInput");
		},
		
		setCategoryInputValue: function(value) {
			this.utils.setInputValue("categoryInput", value);
		},
		
		getHelcomIdInputValue: function() {
			return this.utils.getInputValue("helcomCatalogueIdInput");
		},
		
		setHelcomIdInputValue: function(value) {
			this.utils.setInputValue("helcomCatalogueIdInput", value);
		},
		
		getWmsUrlInputValue: function() {
			return this.utils.getInputValue("wmsUrlInput");
		},
		
		getWmsNameInputValue: function() {
			return this.utils.getInputValue("wmsNameInput");
		},
		
		getMetadataUrlInputValue: function() {
			return this.utils.getInputValue("metadataUrlInput");
		},
		
		/*getWfsUrlInputValue: function() {
			return this.utils.getInputValue("adminFormAddWfsUrlInput");
		},
		
		getWfsNameInputValue: function() {
			return this.utils.getInputValue("adminFormAddWfsNameInput");
		},*/
		
		/* Hide category main function */
		hideCategoryForm: function() {
			this.hideAddCategoryForm();
			this.hideWmsSection();
			this.hideMetadataSection();
			
			this.utils.show("categoryForm", "none");
		},
		
		/* Category section functions*/
		setupAddCategoryForm: function(leaf, emptyCategory, label, helcomId) {
			this.setCategoryInputValue(label);
			if (!leaf) {
				this.utils.show("helcomCatalogueIdLabelForm", "none");
				this.utils.show("addDataForCategoryForm", "none");
				this.utils.show("addDataCategoryButton", "none");
			}
			else {
				this.setHelcomIdInputValue(helcomId);
				this.utils.show("helcomCatalogueIdLabelForm", "block");
				this.utils.show("addDataForCategoryForm", "block");
				this.utils.show("addDataCategoryButton", "none");
			}
			if (emptyCategory) {
				this.utils.show("addDataCategoryButton", "inline-block");
			}
			this.utils.show("saveCategoryButton", "none");
			this.utils.show("updateCategoryButton", "inline-block");
			//this.utils.show("addDataCategoryButton", "none");
		},
		
		hideAddCategoryForm: function() {
			this.utils.clearInput("categoryInput");
			this.utils.clearInput("helcomCatalogueIdInput");
			this.utils.show("helcomCatalogueIdLabelForm", "block");
			this.utils.show("saveCategoryButton", "inline-block");
			this.utils.show("updateCategoryButton", "none");
			this.utils.show("addDataCategoryButton", "none");
			this.utils.show("addDataForCategoryForm", "none");
		},
		
		/* WMS section functions */
		setupWmsDisplayForm: function(wms) {
			this.utils.changeText("wmsFormMessage", "WMS added to this layer:");
			this.utils.changeText("wmsDisplayUrl", wms.url);
			this.utils.changeText("wmsDisplayName", wms.name);
			this.utils.show("addWmsButton", "none");
			this.utils.show("wmsDisplayForm", "block");
			//this.showMetadata(metadata);
		},
		
		hideWmsSection: function() {
			this.wmsUpdate = false;
			this.utils.changeText("wmsFormMessage", "No WMS added to this layer");
			this.hideAddWmsForm();
			this.hideDisplayWmsForm();
		},
		
		hideAddWmsForm: function() {
			this.utils.clearInput("wmsUrlInput");
			this.hideWmsNameSelector();
			this.utils.show("addWmsForm", "none");
			if (!this.wmsUpdate) {					
				this.utils.show("addWmsButton", "block");
			}
			else {
				this.utils.show("updateWmsButton", "block");
				this.utils.show("wmsDisplayForm", "block");
			}
		},
		
		hideWmsNameSelector: function() {
			if (this.wmsNameSelector != null) {
				this.wmsNameSelector.destroy();
				this.wmsNameSelector = null;
			}
			this.utils.show("wmsNameSelectForm", "none");
			this.utils.clearInput("wmsNameInput");
			this.utils.show("wmsNameForm", "none");
			this.wmsValidationPassed = false;
		},
		
		hideDisplayWmsForm: function() {
			this.utils.changeText("wmsDisplayUrl", "");
			this.utils.changeText("wmsDisplayName", "");
			this.utils.show("wmsDisplayForm", "none");
		},
		
		/* Metadata section functions */
		setupMetadataDisplayForm: function(metadata) {
			this.utils.changeText("metadataFormMessage", "Metadata added to this layer:");
			this.utils.show("metadataDisplayForm", "block");
			this.showMetadata(metadata);
		},
		
		setupMetadataFormatSelector: function() {
			var metadataFormats = [
				{label: "HTML", value: "HTML"},
				{label: "XML", value: "XML"},
				{label: "Plain text", value: "PLAIN"}
			];
			this.metadataFormatSelector = new Select({
				options: metadataFormats
			});
			this.metadataFormatSelector.placeAt(this.metadataFormatSelect);
			this.metadataFormatSelector.startup();
		},
		
		hideMetadataSection: function() {
			this.utils.changeText("metadataFormMessage", "No metadata added to this layer (Add WMS, WFS first. Metadata will be added automatically if any present in WMS and WFS.)");
			//this.hideAddWmsForm();
			this.hideDisplayMetadataForm();
		},
		
		hideAddMetadataForm: function() {
			this.utils.clearInput("metadataUrlInput");
			this.hideMetadataFormatSelector();
			this.utils.show("addMetadataForm", "none");
			this.utils.show("addMetadataButton", "block");
		},
		
		hideMetadataFormatSelector: function() {
			if (this.metadataFormatSelector != null) {
				this.metadataFormatSelector.destroy();
				this.metadataFormatSelector = null;
			}
		},
		
		hideDisplayMetadataForm: function() {
			domConstruct.empty(this.metadataDisplayForm);
			this.utils.show("metadataDisplayForm", "none");
		},
		
		/*hideMetadataForm: function() {
			domConstruct.empty(this.metadataContainer);
			this.utils.show("metadataForm", "none");
			this.hideMetadataFormatSelector();
		},*/
		
		
	
		showMessage: function(text) {
			var u = this.utils;
			u.changeText("adminFormMessage", text);
	    	u.show("adminFormMessage", "block");
	    	setTimeout(function(){ 
	    		u.changeText("adminFormMessage", "");
	    		u.show("adminFormMessage", "none");
	    	}, 10000);
		},
		hideMessage: function() {
			this.utils.changeText("adminFormMessage", "");
			this.utils.show("adminFormMessage", "none");
		},
		
		validateWmsLinkClick: function() {
			this.hideWmsNameSelector();
			var wmsUrl = this.getWmsUrlInputValue();
			if (validate.isUrl(wmsUrl)) {
				this.action = "VALIDATE_WMS";
				var url = "sc/wms/verify";
				var data = {
					"url": wmsUrl
				};
				request.post(url, this.utils.createPostRequestParams(data)).then(
					lang.hitch(this, function(response){
						this.hideWmsNameSelector();
						if (response.type == "error") {
							this.wmsValidationPassed = false;
							this.showMessage("WMS did not pass validation.");
							this.utils.show("wmsNameForm", "block");
						}
						else if (response.type == "success") {
							this.wmsValidationPassed = true;
							this.showMessage("WMS is valid.");
							this.utils.show("wmsNameSelectForm", "block");
							
							var layerNames = [];
							array.forEach(response.item, lang.hitch(this, function(name){
								layerNames.push({label: name, value: name});
							}));
							this.wmsNameSelector = new Select({
								options: layerNames
							});
							this.wmsNameSelector.placeAt(this.wmsNameSelect);
							this.wmsNameSelector.startup();
						}
						this.action = null;
					}),
					lang.hitch(this, function(error){
						this.action = null;
						this.showMessage("Something went wrong (on wms/verify). Please contact administrator.");
					})
				);
			}
			else {
				this.showMessage("Url is not valid.");
			}
		},
		
		getWmsInfo: function(wmsUrl, wmsName) {
			var url = "sc/wms/info";
			var data = {
				"url": wmsUrl,
				"name": wmsName
			};
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("WMS did not pass validation. Can't get WMS info.");
					}
					else if (response.type == "success") {
						console.log(response);
						this.buildWmsInfoElement("WMS service URL", wmsUrl);
						this.buildWmsInfoElement("Layer name", wmsName);
						this.buildWmsInfoElement("Layer title", response.item.title);
						this.buildWmsInfoElement("WMS version", response.item.version);
						this.buildWmsInfoElement("Supported languages", response.item.languages.join(", "));
						this.buildWmsInfoElement("Organization", response.item.organisation);
						this.buildWmsInfoElement("Keywords", response.item.keywords.join(", "));
						this.buildWmsMetadataElement("Metadata", response.item.metadata);
						this.buildWmsInfoElement("GetFeatureInfo support", response.item.queryable);
						this.buildWmsInfoElement("GetFeatureInfo response formats", response.item.formats.join(", "));
						this.buildWmsInfoElement("Supported CRSes", response.item.crs.join(", "));
						this.buildWmsInfoElement("Min display scale", response.item.scaleMin == "NaN" ? "" : response.item.scaleMin);
						this.buildWmsInfoElement("Max display scale", response.item.scaleMax == "NaN" ? "" : response.item.scaleMax);
						this.buildWmsStyleElement("Styles", response.item.styles);
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on wms/info). Please contact administrator.");
				})
			);
		},
		
		buildWmsInfoElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "wmsInfoElementContainer"}, this.wmsInfoContainer, "last");
			var infoLabel = domConstruct.create("div", { "class": "wmsInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "wmsInfoElementValue", "innerHTML": value }, infoContainer, "last");
		},
		
		buildWmsMetadataElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "wmsInfoElementContainer"}, this.wmsInfoContainer, "last");
			var infoLabel = domConstruct.create("div", { "class": "wmsInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "wmsInfoElementValue"}, infoContainer, "last");
			
			array.forEach(value, lang.hitch(this, function(record){
				var metadataContainer = domConstruct.create("div", {"style": { "margin-bottom": "5px" }}, infoValue, "last");
				var metadataLabel = domConstruct.create("div", { "style": { "font-size": "14px", "font-weight": "bold" }, "innerHTML": record.format }, metadataContainer, "last");
				var metadataURL = domConstruct.create("div", { "innerHTML": record.url }, metadataContainer, "last");
			}));
		},
		
		buildWmsStyleElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "wmsInfoElementContainer"}, this.wmsInfoContainer, "last");
			var infoLabel = domConstruct.create("div", { "class": "wmsInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "wmsInfoElementValue"}, infoContainer, "last");
			
			array.forEach(value, lang.hitch(this, function(record){
				var styleContainer = domConstruct.create("div", {"style": { "margin-bottom": "5px" }}, infoValue, "last");
				var styleName = domConstruct.create("div", { "style": { "font-size": "14px", "font-weight": "bold" }, "innerHTML": "Name: " + record.name }, styleContainer, "last");
				var styleURL = domConstruct.create("div", { "innerHTML": record.urls[0] }, styleContainer, "last");
				var styleImage = domConstruct.create("img", { "src": record.urls[0] }, styleContainer, "last");
			}));
		},
		
		showMetadata: function(metadata) {
			console.log(metadata);
			array.forEach(metadata, lang.hitch(this, function(record){
				var container = domConstruct.create("div", {"style": { "border-bottom": "1px solid #cccccc", "margin-bottom": "5px", "margin-top": "15px" }}, this.metadataDisplayForm, "last");
				var provider = domConstruct.create("div", { "style": { "font-size": "14px", "font-weight": "bold" }, "innerHTML": "Metadata source: " + record.source }, container, "last");
				var format = domConstruct.create("div", { "style": { "font-size": "14px", "font-weight": "bold" }, "innerHTML": "Metadata format: " + record.format }, container, "last");
				var url = domConstruct.create("a", { "href": record.url, "target": "_blank", "innerHTML": record.url }, container, "last");
			}));
			
			/*on(this.metadataNewButton, "click", lang.hitch(this, function(){
				this.hideMetadataFormatSelector();
				this.utils.show("metadataFormatForm", "block");
				this.utils.show("metadataUrlForm", "block");
				this.utils.show("metadataSaveButton", "inline-block");
				
				var metadataFormats = [
					{label: "HTML", value: "HTML"},
					{label: "XML", value: "XML"},
					{label: "Plain text", value: "PLAIN"}
				];
				this.metadataFormatSelector = new Select({
					options: metadataFormats
				});
				this.metadataFormatSelector.placeAt(this.metadataFormatSelect);
				this.metadataFormatSelector.startup();
			}));*/
		}
	});
});

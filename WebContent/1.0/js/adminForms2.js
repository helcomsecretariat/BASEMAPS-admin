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
	"dojo/text!../templates/adminForms2.html"
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
		currentCategory: null,
		currentCategoryWmses: [],
		currentCategoryCategories: [],
		
		constructor: function(params) {
			this.utils = new utils();
		},
		postCreate: function() {
			/*on(this.addDataCategoryButton, "click", lang.hitch(this, function(){
				this.utils.show("addDataForCategoryForm", "block");
			}));*/
			
			/* WMS section buttons events */
			/*on(this.addWmsButton, "click", lang.hitch(this, function(){
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
			}));*/
			
			/* Metadata section buttons events */
			/*on(this.addMetadataButton, "click", lang.hitch(this, function(){
				this.utils.show("addMetadataButton", "none");
				//this.hideDisplayMetadataForm();
				this.setupMetadataFormatSelector();
				this.utils.show("addMetadataForm", "block");
			}));*/
			
			/*on(this.metadataCancelButton, "click", lang.hitch(this, function(){
				this.hideAddMetadataForm();
			}));*/
		},
		destroy: function() {
			
		},
		
		manageCategoryCloseButtonClick: function() {
			this.cleanCategoryLabel();
			this.cleanHelcomCatalogueId();
			this.cleanCategoryMetadataLink();
			
			this.cleanMetadataDisplayForm();
			this.cleanMetadataAddForm();
			
			this.cleanCategoryDisplayForm();
			this.cleanCategoryAddForm();
			
			this.cleanWmsDisplayForm();
			this.cleanWmsAddForm();
			
			this.cleanWmsInfoDisplayForm();
			
			this.utils.show("categoryForm", "none");
			this.utils.changeText("adminFormsHeader", "");
			this.utils.changeText("adminFormMessage", "");
	    	this.utils.show("adminFormMessage", "none");
		},
		
		/* --- MANAGE CATEGORY BUTTONS START --- */
		
		// --- category info
		editCategoryLabelClick: function() {
			this.utils.setInputValue("categoryLabelInput", this.utils.getTextValue("categoryLabel").trim());
			this.utils.show("categoryLabel", "none");
			this.utils.show("categoryLabelInput", "inline-block");
			this.utils.show("editCategoryLabel", "none");
			this.utils.show("cancelCategoryLabel", "inline-block");
			this.utils.show("saveCategoryLabel", "inline-block");
		},
		
		cancelCategoryLabelClick: function() {
			this.cleanCategoryLabel();
		},
		
		editHelcomCatalogueIdClick: function() {
			if (this.utils.getTextValue("helcomCatalogueId") === "Not assigned") {
				this.utils.setInputValue("helcomCatalogueIdInput", "");
			}
			else {
				this.utils.setInputValue("helcomCatalogueIdInput", this.utils.getTextValue("helcomCatalogueId").trim());
			}
			
			this.utils.show("helcomCatalogueId", "none");
			this.utils.show("helcomCatalogueIdInput", "inline-block");
			this.utils.show("editHelcomCatalogueId", "none");
			this.utils.show("cancelHelcomCatalogueId", "inline-block");
			this.utils.show("saveHelcomCatalogueId", "inline-block");
		},
		
		cancelHelcomCatalogueIdClick: function() {
			this.cleanHelcomCatalogueId();
		},
		
		editCategoryMetadataLinkClick: function() {
			if (this.utils.getTextValue("categoryMetadataLink") === "Not assigned") {
				this.utils.setInputValue("categoryMetadataLinkInput", "");
			}
			else {
				this.utils.setInputValue("categoryMetadataLinkInput", this.utils.getTextValue("categoryMetadataLink").trim());
			}
			
			this.utils.show("categoryMetadataLink", "none");
			this.utils.show("categoryMetadataLinkInput", "inline-block");
			this.utils.show("editCategoryMetadataLink", "none");
			this.utils.show("cancelCategoryMetadataLink", "inline-block");
			this.utils.show("saveCategoryMetadataLink", "inline-block");
		},
		
		cancelCategoryMetadataLinkClick: function() {
			this.cleanCategoryMetadataLink();
		},
		
		// --- category metadata
		addMetadataClick: function() {
			this.utils.show("addMetadataForm", "block");
			this.utils.show("addMetadata", "none");
			this.setupMetadataFormatSelector(this.metadataFormatSelect);
		},
		
		cancelMetadataClick: function() {
			this.cleanMetadataAddForm();
		},
		
		// ---category categories
		addCategoryClick: function() {
			this.utils.show("addCategoryForm", "block");
			this.utils.show("addCategory", "none");
			this.setupMetadataFormatSelector(this.addCategoryMetadataFormatSelect);
		},
		
		cancelCategoryClick: function() {
			this.cleanCategoryAddForm();
		},
		
		// --- category wms
		addWmsClick: function() {
			this.utils.show("addWmsForm", "block");
			this.utils.show("addWms", "none");
		},
		
		cancelWmsClick: function() {
			this.cleanWmsAddForm();
		},
		
		validateWmsClick: function() {
			this.cleanWmsNameAndLabelForms();
			var wmsUrl = this.utils.getInputValue("wmsUrlInput").trim();
			if (validate.isUrl(wmsUrl)) {
				this.validateWms(wmsUrl);
			}
			else {
				this.showMessage("Wms url is not valid.");
			}
		},
		/* --- MANAGE CATEGORY BUTTONS END --- */
		
		
						
		/* --- MANAGE CATEGORY CLEAN START--- */
		
		// --- category info		
		cleanCategoryLabel: function() {
			this.utils.show("categoryLabel", "inline-block");
			this.utils.show("categoryLabelInput", "none");
			this.utils.show("editCategoryLabel", "inline-block");
			this.utils.show("cancelCategoryLabel", "none");
			this.utils.show("saveCategoryLabel", "none");
		},
		
		cleanHelcomCatalogueId: function() {
			this.utils.show("helcomCatalogueId", "inline-block");
			this.utils.show("helcomCatalogueIdInput", "none");
			this.utils.show("editHelcomCatalogueId", "inline-block");
			this.utils.show("cancelHelcomCatalogueId", "none");
			this.utils.show("saveHelcomCatalogueId", "none");
		},
		
		cleanCategoryMetadataLink: function() {
			this.utils.show("categoryMetadataLink", "inline-block");
			this.utils.show("categoryMetadataLinkInput", "none");
			this.utils.show("editCategoryMetadataLink", "inline-block");
			this.utils.show("cancelCategoryMetadataLink", "none");
			this.utils.show("saveCategoryMetadataLink", "none");
		},
		
		// --- category metadata
		cleanMetadataDisplayForm: function() {
			domConstruct.empty(this.metadataDisplayForm);
		},
		
		cleanMetadataAddForm: function() {
			this.cleanMetadataFormatSelector();
			this.utils.clearInput("metadataUrlInput");
			this.utils.show("addMetadataForm", "none");
			this.utils.show("addMetadata", "inline-block");
		},
		
		// --- category Categories
		cleanCategoryDisplayForm: function() {
			domConstruct.empty(this.categoryDisplayForm);
		},
		
		cleanCategoryAddForm: function() {
			this.cleanMetadataFormatSelector();
			this.utils.clearInput("addCategoryLabelInput");
			this.utils.clearInput("addCategoryHelcomIdInput");
			this.utils.clearInput("addCategoryMetadataUrlInput");
			this.utils.show("addCategoryForm", "none");
			this.utils.show("addCategory", "inline-block");
		},
		
		// --- category wms
		cleanWmsDisplayForm: function() {
			domConstruct.empty(this.wmsDisplayForm);
		},
		
		cleanWmsAddForm: function() {
			this.cleanWmsNameAndLabelForms();
			this.utils.clearInput("wmsUrlInput");
			this.utils.show("addWmsForm", "none");
			this.utils.show("addWms", "inline-block");
			
		},
		
		cleanWmsInfoDisplayForm: function() {
			domConstruct.empty(this.wmsDisplayInfoForm);
		},
		/* --- MANAGE CATEGORY CLEAN END--- */
		
		
		
		/* --- MANAGE CATEGORY UTILS START--- */
		
		// --- category metadata
		displayMetadata: function(metadata) {
			array.forEach(metadata, lang.hitch(this, function(record) {
				var container = domConstruct.create("div", {"class": "formSubSectionGroup"}, this.metadataDisplayForm, "last");
				var content = domConstruct.create("div", {"style": "display: inline-block; width: 90%"}, container, "last");
				var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 10%"}, container, "last");
				
				var provider = domConstruct.create("div", null, content, "last");
				var providerLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Metadata source: " }, provider, "last");
				var providerValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": record.source }, provider, "last");
				
				var format = domConstruct.create("div", null, content, "last");
				var formatLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Metadata format: " }, format, "last");
				var formatValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": record.format }, format, "last");
				
				var url = domConstruct.create("div", null, content, "last");
				var urlLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "URL: " }, url, "last");
				var urlValue = domConstruct.create("a", { "class": "textLabel", "href": record.url, "target": "_blank", "innerHTML": record.url }, url, "last");
				
				var button = domConstruct.create("div", {"class": "formDeleteLink", "innerHTML": "Delete"}, buttonContainer, "last");
				on(button, "click", lang.hitch(this, function() {
					
				    if (confirm("Please confirm removing metadata") == true) {
				    	console.log("one", this.currentCategory.metaData);
				    	var index = this.currentCategory.metaData.findIndex(x => x.id == record.id);
						if (index > -1) {
							this.currentCategory.metaData.splice(index, 1);
							this.deleteMetadata();
						}
				    }
				}));
			}));
		},
		
		deleteMetadata: function() {
			console.log("two", this.currentCategory.metaData);
			var url = "sc/categories/update";
			request.post(url, this.utils.createPostRequestParams(this.currentCategory)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.showMessage("Failed to delete metadata.");
					}
					else if (response.type == "success") {
						console.log("three", this.currentCategory.metaData, response);
						this.showMessage("Metadata deleted.");
						this.cleanMetadataDisplayForm();
						if ((this.currentCategory.metaData) && (this.currentCategory.metaData.length > 0)) {
							this.displayMetadata(this.currentCategory.metaData);
						}
						else {
							var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No metadata assigned for this category"}, this.metadataDisplayForm, "last");
						}
					}
				}),
				lang.hitch(this, function(error) {
					this.formsObj.showMessage("Something went wrong (on categories/update). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		setupMetadataFormatSelector: function(node) {
			var metadataFormats = [
				{label: "HTML", value: "HTML"},
				{label: "XML", value: "XML"},
				{label: "Plain text", value: "PLAIN"}
			];
			this.metadataFormatSelector = new Select({
				options: metadataFormats
			});
			this.metadataFormatSelector.placeAt(node);
			this.metadataFormatSelector.startup();
		},
		
		cleanMetadataFormatSelector: function() {
			if (this.metadataFormatSelector != null) {
				this.metadataFormatSelector.destroy();
				this.metadataFormatSelector = null;
			}
		},
		
		// --- category categories
		displayCategories: function(categories) {
			array.forEach(categories, lang.hitch(this, function(category) {
				var container = domConstruct.create("div", {"class": "formSubSectionGroup"}, this.categoryDisplayForm, "last");
				var content = domConstruct.create("div", {"style": "display: inline-block; width: 90%"}, container, "last");
				var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 10%"}, container, "last");
				
				var label = domConstruct.create("div", null, content, "last");
				var labelLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Label: " }, label, "last");
				var labelValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": category.label }, label, "last");
				
				var helcomId = domConstruct.create("div", null, content, "last");
				var helcomIdLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "HELCOM id: " }, helcomId, "last");
				var helcomIdValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": category.helcomId }, helcomId, "last");
								
				var button = domConstruct.create("div", {"class": "formDeleteLink", "innerHTML": "Delete"}, buttonContainer, "last");
				on(button, "click", lang.hitch(this, function() {
					
				    if (confirm("Please confirm removing category " + category.label + " with all content") == true) {
				    	this.deleteCategory(category.id);
				    }
				}));
			}));
		},
		
		deleteCategory: function(id) {
			var url = "sc/categories/delete/" + id;
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("Failed to delete category.");
					}
					else if (response.type == "success") {
						this.showMessage("Category deleted.");
						var index = this.currentCategoryCategories.findIndex(x => x.id == id);
						if (index > -1) {
							this.currentCategoryCategories.splice(index, 1);
							this.cleanCategoryDisplayForm();
							this.displayCategories(this.currentCategoryCategories);
						}
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on categories/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		// --- category wms
		validateWms: function(wmsUrl) {
			var url = "sc/wms/verify";
			var data = {
				"url": wmsUrl
			};
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					console.log(response);
					//this.hideWmsNameAndLabelSelector();
					if (response.type == "error") {
						this.wmsValidationPassed = false;
						this.showMessage("WMS did not pass validation.");
						this.utils.show("wmsLayerNameInputGroup", "block");
					}
					else if (response.type == "success") {
						this.wmsValidationPassed = true;
						this.showMessage("WMS is valid.");
						this.utils.show("wmsLayerNameSelectGroup", "block");
						
						this.utils.setInputValue("wmsLabelInput", response.item.organization);
						
						var layerNames = [];
						array.forEach(response.item.names, lang.hitch(this, function(name){
							layerNames.push({label: name, value: name});
						}));
						this.setupWmsNameSelector(layerNames);
						
					}
					//this.utils.show("wmsLabelForm", "block");
					//this.action = null;
				}),
				lang.hitch(this, function(error){
					this.action = null;
					this.showMessage("Something went wrong (on wms/verify). Please contact administrator.");
				})
			);
		},
		
		setupWmsNameSelector: function(names) {
			this.wmsNameSelector = new Select({
				options: names
			});
			this.wmsNameSelector.placeAt(this.wmsNameSelect);
			this.wmsNameSelector.startup();
		},
		
		cleanWmsNameAndLabelForms: function() {
			if (this.wmsNameSelector != null) {
				this.wmsNameSelector.destroy();
				this.wmsNameSelector = null;
			}
			this.utils.show("wmsLayerNameSelectGroup", "none");
			this.utils.clearInput("wmsNameInput");
			this.utils.show("wmsLayerNameInputGroup", "none");
			this.utils.clearInput("wmsLabelInput");
			this.utils.clearInput("wmsHelcomIdInput");
			this.wmsValidationPassed = false;
		},
				
		displayWmses: function(wmses) {
			array.forEach(wmses, lang.hitch(this, function(wms) {
				var container = domConstruct.create("div", {"class": "formSubSectionGroup"}, this.wmsDisplayForm, "last");
				var content = domConstruct.create("div", {"style": "display: inline-block; width: 90%"}, container, "last");
				var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 10%"}, container, "last");
				
				var label = domConstruct.create("div", null, content, "last");
				var labelLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Label: " }, label, "last");
				var labelValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": wms.label }, label, "last");
				
				var name = domConstruct.create("div", null, content, "last");
				var nameLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Name: " }, name, "last");
				var nameValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": wms.name }, name, "last");
				
				var url = domConstruct.create("div", null, content, "last");
				var urlLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "URL: " }, url, "last");
				var urlValue = domConstruct.create("a", { "class": "textLabel", "href": wms.url, "target": "_blank", "innerHTML": wms.url }, url, "last");
				
				var button = domConstruct.create("div", {"class": "formDeleteLink", "innerHTML": "Delete"}, buttonContainer, "last");
				on(button, "click", lang.hitch(this, function() {
					
				    if (confirm("Please confirm removing WMS: " + wms.label) == true) {
				    	this.deleteWms(wms.serviceCatId);
				    }
				}));
			}));
		},
		
		deleteWms: function(id) {
			var url = "sc/categories/delete/" + id;
			//this.getTreePath(this.store.get(this.currentObjId).parent);
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("Failed to delete WMS.");
					}
					else if (response.type == "success") {
						this.showMessage("WMS deleted.");
						var index = this.currentCategoryWmses.findIndex(x => x.serviceCatId == id);
						if (index > -1) {
							this.currentCategoryWmses.splice(index, 1);
							this.cleanWmsDisplayForm();
							this.displayWmses(this.currentCategoryWmses);
						}
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on categories/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		/* --- MANAGE CATEGORY UTILS END --- */
		
		
		
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
		
		setupManageCategoryForm: function(layer, categories, wmses, headerText) {
			
			//this.formView = view;
			this.utils.changeText("adminFormsHeader", headerText);
			
			/* --- CATEGORY INFO SECTION START --- */
			this.utils.setTextValue("categoryLabel", layer.name);
			
			if ((layer.helcomId) && (layer.helcomId.length > 0)) {
				this.utils.setTextValue("helcomCatalogueId", layer.helcomId);
			}
			else {
				this.utils.setTextValue("helcomCatalogueId", "Not assigned");
			}
			
			if (layer.type == "CATEGORY") {
				this.utils.show("categoryMetadataSection", "block");
				if ((layer.metadata) && (layer.metadata.length > 0)) {
					this.utils.setTextValue("categoryMetadataLink", layer.metadata[0].url);
				}
				else {
					this.utils.setTextValue("categoryMetadataLink", "Not assigned");
				}
				
				this.utils.show("categoryCategoriesForm", "block");
				this.utils.show("categoryWmsForm", "block");
				this.utils.show("categoryMetadataForm", "none");
				if ((categories) && (categories.length > 0)) {
					this.displayCategories(categories);
				}
				else {
					var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No sub-categories"}, this.categoryDisplayForm, "last");
				}
				if ((wmses) && (wmses.length > 0)) {
					this.displayWmses(wmses);
				}
				else {
					var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No WMSes in this category"}, this.wmsDisplayForm, "last");
				}
			}
			else {
				this.utils.show("categoryMetadataSection", "none");
				
				this.utils.show("categoryCategoriesForm", "none");
				this.utils.show("categoryWmsForm", "none");
				this.utils.show("categoryMetadataForm", "block");
				if ((layer.metadata) && (layer.metadata.length > 0)) {
					this.displayMetadata(layer.metadata);
				}
				else {
					var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No metadata assigned for this category"}, this.metadataDisplayForm, "last");
				}
			}
			
			if (layer.type == "WMS") {
				this.utils.show("categoryWmsInfoForm", "block");
				console.log("WMS", layer);
				this.getWmsInfo(layer.wms.url, layer.wms.name);
			}
			else {
				this.utils.show("categoryWmsInfoForm", "none");
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
		
		getWmsLabelInputValue: function() {
			return this.utils.getInputValue("wmsLabelInput");
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
			this.hideWmsNameAndLabelSelector();
			this.utils.show("addWmsForm", "none");
			if (!this.wmsUpdate) {					
				this.utils.show("addWmsButton", "block");
			}
			else {
				this.utils.show("updateWmsButton", "block");
				this.utils.show("wmsDisplayForm", "block");
			}
		},
		
		hideWmsNameAndLabelSelector: function() {
			if (this.wmsNameSelector != null) {
				this.wmsNameSelector.destroy();
				this.wmsNameSelector = null;
			}
			this.utils.show("wmsNameSelectForm", "none");
			this.utils.clearInput("wmsNameInput");
			this.utils.show("wmsNameForm", "none");
			this.utils.clearInput("wmsLabelInput");
			this.utils.show("wmsLabelForm", "none");
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
			this.hideWmsNameAndLabelSelector();
			var wmsUrl = this.getWmsUrlInputValue();
			if (validate.isUrl(wmsUrl)) {
				this.action = "VALIDATE_WMS";
				var url = "sc/wms/verify";
				var data = {
					"url": wmsUrl
				};
				request.post(url, this.utils.createPostRequestParams(data)).then(
					lang.hitch(this, function(response){
						console.log(response);
						this.hideWmsNameAndLabelSelector();
						if (response.type == "error") {
							this.wmsValidationPassed = false;
							this.showMessage("WMS did not pass validation.");
							this.utils.show("wmsNameForm", "block");
						}
						else if (response.type == "success") {
							this.wmsValidationPassed = true;
							this.showMessage("WMS is valid.");
							this.utils.show("wmsNameSelectForm", "block");
							
							this.utils.setInputValue("wmsLabelInput", response.item.organization);
							var layerNames = [];
							array.forEach(response.item.names, lang.hitch(this, function(name){
								layerNames.push({label: name, value: name});
							}));
							this.wmsNameSelector = new Select({
								options: layerNames
							});
							this.wmsNameSelector.placeAt(this.wmsNameSelect);
							this.wmsNameSelector.startup();
						}
						this.utils.show("wmsLabelForm", "block");
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
			var infoContainer = domConstruct.create("div", {"class": "wmsInfoElementContainer"}, this.wmsDisplayInfoForm, "last");
			var infoLabel = domConstruct.create("div", { "class": "wmsInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "wmsInfoElementValue", "innerHTML": value }, infoContainer, "last");
		},
		
		buildWmsMetadataElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "wmsInfoElementContainer"}, this.wmsDisplayInfoForm, "last");
			var infoLabel = domConstruct.create("div", { "class": "wmsInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "wmsInfoElementValue"}, infoContainer, "last");
			
			array.forEach(value, lang.hitch(this, function(record){
				var metadataContainer = domConstruct.create("div", {"style": { "margin-bottom": "5px" }}, infoValue, "last");
				var metadataLabel = domConstruct.create("div", { "style": { "font-size": "14px", "font-weight": "bold" }, "innerHTML": record.format }, metadataContainer, "last");
				var metadataURL = domConstruct.create("div", { "innerHTML": record.url }, metadataContainer, "last");
			}));
		},
		
		buildWmsStyleElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "wmsInfoElementContainer"}, this.wmsDisplayInfoForm, "last");
			var infoLabel = domConstruct.create("div", { "class": "wmsInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "wmsInfoElementValue"}, infoContainer, "last");
			
			array.forEach(value, lang.hitch(this, function(record){
				var styleContainer = domConstruct.create("div", {"style": { "margin-bottom": "5px" }}, infoValue, "last");
				var styleName = domConstruct.create("div", { "style": { "font-size": "14px", "font-weight": "bold" }, "innerHTML": "Name: " + record.name }, styleContainer, "last");
				var styleURL = domConstruct.create("div", { "innerHTML": record.urls[0] }, styleContainer, "last");
				var styleImage = domConstruct.create("img", { "src": record.urls[0] }, styleContainer, "last");
			}));
		}
	});
});

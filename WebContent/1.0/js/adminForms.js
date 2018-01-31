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
		utils: null,
		addingWmsWithCategory: false,
		addingWfsWithCategory: false,
		addingMetadataWithCategory: false,
		wmsValidationPassed: false,
		wmsNameSelector: null,
		
		constructor: function() {
			this.utils = new utils();
		},
		postCreate: function() {
		
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
		
		setupAddCategoryForm: function(headerText) {
			this.formView = "ADD_CATEGORY";
			this.utils.changeText("adminFormsHeader", headerText);
			this.utils.show("addCategoryForm", "block");
		},
		
		setupDeleteCategoryForm: function(headerText) {
			this.formView = "DELETE_CATEGORY";
			this.utils.changeText("adminFormsHeader", headerText);
			this.utils.show("deleteCategoryForm", "block");
		},
		
		formCleanUp: function() {
			this.utils.changeText("adminFormsHeader", "");
			this.utils.changeText("adminFormMessage", "");
	    	this.utils.show("adminFormMessage", "none");
	    	if (this.formView === "ADD_CATEGORY") {
	    		this.hideAddCategoryForm();
			} else if (this.formView === "DELETE_CATEGORY") {
				this.utils.show("deleteCategoryForm", "none");
			}
	    	this.formView = null;
		},
		
		getCategoryInputValue: function() {
			return this.utils.getInputValue("categoryInput");
		},
		
		getWmsUrlInputValue: function() {
			return this.utils.getInputValue("wmsUrlInput");
		},
		
		getWmsNameInputValue: function() {
			return this.utils.getInputValue("wmsNameInput");
		},
		
		/*getWfsUrlInputValue: function() {
			return this.utils.getInputValue("adminFormAddWfsUrlInput");
		},
		
		getWfsNameInputValue: function() {
			return this.utils.getInputValue("adminFormAddWfsNameInput");
		},*/
		
		hideAddCategoryForm: function() {
			this.utils.clearInput("categoryInput");
			this.utils.show("addCategoryForm", "none");
			if (this.addingWmsWithCategory) {
				this.hideAddWmsForm();
			}
		},
		
		hideAddWmsForm: function() {
			this.utils.clearInput("wmsUrlInput");
			this.hideWmsNameSelector();
			this.utils.show("addCategoryWmsForm", "none");
			this.addingWmsWithCategory = false;
		},
		
		hideWmsNameSelector: function() {
			if (this.wmsNameSelector != null) {
				this.wmsNameSelector.destroy();
				this.wmsNameSelector = null;
			}
			this.utils.show("wmsNameSelectForm", "none");
			this.utils.clearInput("wmsNameForm");
			this.utils.show("wmsNameForm", "none");
			this.wmsValidationPassed = false;
		},
	
		showMessage: function(text) {
			var u = this.utils;
			u.changeText("adminFormMessage", text);
	    	u.show("adminFormMessage", "block");
	    	setTimeout(function(){ 
	    		u.changeText("adminFormMessage", "");
	    		u.show("adminFormMessage", "none");
	    	}, 6000);
		},
		hideMessage: function() {
			this.utils.changeText("adminFormMessage", "");
			this.utils.show("adminFormMessage", "none");
		},
		
		validateWmsLinkClick: function() {
			var wmsUrl = this.getWmsUrlInputValue();
			if (validate.isUrl(wmsUrl)) {
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
					}),
					lang.hitch(this, function(error){
						this.showMessage("Something went wrong (on validating WMS). Please contact administrator.");
					})
				);
			}
			else {
				this.showMessage("WMS url is not valid.");
			}
		}
	});
});

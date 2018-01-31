define([
	"dojo/_base/declare",
	"dojo",
	"dojo/_base/lang",
	"dojo/mouse",
	"dojo/on",
	"dojo/dom",
	"dojo/query",
	"dojo/dom-style",
	"dojo/request",
	"dojox/validate/web",
	"dojo/_base/array", 
	"dojo/dom-construct",
	"dojo/store/Memory",
	"dijit/tree/ObjectStoreModel", 
	"dijit/Tree", 
	"dijit/form/FilteringSelect",
	"dijit/form/CheckBox", 
	"dijit/Tooltip",
	"basemaps/js/utils",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/text!../templates/adminUsersList.html"
], function(
	declare,
	dojo,
	lang,
	mouse,
	on,
	dom,
	query,
	domStyle,
	request,
	validate,
	array,
	domConstruct,
	Memory, 
	ObjectStoreModel, 
	Tree, 
	FilteringSelect,
	checkBox, 
	Tooltip,
	utils,
	_WidgetBase, 
	_TemplatedMixin, 
	template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "adminUsersList",
		utils: null,
		formsObj: null,
		constructor: function(params) {
			this.formsObj = params.forms;
			this.utils = new utils();
		},
    
		addUserButtonClick: function() {
			this.formsObj.formCleanUp();
			//this.formsObj.setupForm("TOP_CATEGORY", "Add top category");
		},
	
		postCreate: function() {
			/*on(this.formsObj.adminFormSaveButton, "click", lang.hitch(this, function(){
				this.formsObj.hideMessage();
				console.log(this.formsObj.formView);
				if ((this.formsObj.formView === "TOP_CATEGORY") || 
		    		(this.formsObj.formView === "TOP_LAYER") || 
		    		(this.formsObj.formView === "ADD_CATEGORY")) {
					var val = this.formsObj.getOneLabelInputValue();
					if (validate.isText(val)) {
						this.saveCategory(val);
					}
					else {
						this.formsObj.showMessage("Label is not valid.");
					}
				} else if (this.formsObj.formView === "DELETE_CATEGORY") {
					console.log("on click");
					this.deleteCategory();
				}
				
			}));
			
			on(this.formsObj.adminFormCancelButton, "click", lang.hitch(this, function(){
				this.currentObjId = null;
				this.formsObj.formCleanUp();
			}));*/
		},
    
		saveCategory: function(label) {
			var url = "sc/categories/add";
			var data = {
				"label": label
			};
			if (this.currentObjId != null) {
				data.parent = this.currentObjId;
			}
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					this.utils.clearInput("adminFormOneLabelInput");
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to add category.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("Category added.");
						this.refreshLayerList();
					}
				}),
				lang.hitch(this, function(error){
					this.utils.clearInput("adminFormOneLabelInput");
					this.formsObj.showMessage("Something went wrong (on adding category). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		deleteCategory: function() {
			var url = "sc/categories/delete/" + this.currentObjId;
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.currentObjId = null;
						this.formsObj.formCleanUp();
						this.formsObj.showMessage("Failed to delete category.");
					}
					else if (response.type == "success") {
						this.currentObjId = null;
						this.formsObj.formCleanUp();
						this.formsObj.showMessage("Category deleted.");
						this.refreshLayerList();
					}
				}),
				lang.hitch(this, function(error){
					this.currentObjId = null;
					this.formsObj.formCleanUp();
					this.formsObj.showMessage("Something went wrong (on deleting category). Please contact administrator.");
					console.log(error);
				})
			);
		},

		destroy: function() {

		}
	});
});
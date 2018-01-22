define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/query",
	"dojo/dom-style",
	"dojo/request",
	"dojo/_base/array", 
	"basemaps/js/utils",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin",
	"dojo/text!../templates/adminForms.html"
], function(
	declare,
	lang, on, dom, domConstruct, query, domStyle,
	request, array, utils,
	_WidgetBase, _TemplatedMixin, template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "adminForms",
		formView: null,
		utils: null,
		
		constructor: function() {
			this.utils = new utils();
		},
		postCreate: function() {
		
		},
		destroy: function() {
			
		},
		
		adminFormCancelButtonClick: function() {
			this.formCleanUp();
		},
		
		setupForm: function(view) {
			this.formView = view;
			if (view === "TOP_CATEGORY") {
				this.utils.changeText("adminFormsHeader", "Add top category");
				this.setupOneLabelForm();
			}
			else if (view === "TOP_LAYER") {
				this.utils.changeText("adminFormsHeader", "Add top layer");
				this.setupOneLabelForm();
			}
		},
		
		formCleanUp: function() {
			this.utils.changeText("adminFormsHeader", "");
			this.utils.changeText("adminFormSaveButton", "");
	    	this.utils.changeText("adminFormCancelButton", "");
	    	this.utils.changeText("adminFormMessage", "");
	    	this.utils.show("adminFormMessage", "none");
	    	if ((this.formView === "TOP_CATEGORY") || (this.formView === "TOP_LAYER")) {
	    		this.hideOneLabelForm();
			}
	    	this.formView = null;
		},
		
		setupOneLabelForm: function() {
			this.utils.changeText("adminFormSaveButton", "Save");
	    	this.utils.changeText("adminFormCancelButton", "Close");
	    	this.utils.show("oneLabelForm", "block");
	    	this.utils.show("adminFormButtons", "block");
		},
		
		getOneLabelInputValue: function() {
			return this.utils.getInputValue("adminFormOneLabelInput");
		},
		
		hideOneLabelForm: function() {
			this.utils.clearInput("adminFormOneLabelInput");
			this.utils.show("oneLabelForm", "none");
	    	this.utils.show("adminFormButtons", "none");
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
		}
	});
});

define([
	"dojo/_base/declare",
	"dojo/parser",
	"dojo/_base/lang", 
	"dojo/on",
	"dojo/dom",
	"dojo/dom-style",
	"dojo/request",
	"dojo/_base/array", 
	"dojo/dom-construct",
	"basemaps/js/adminLayerList2",
	"basemaps/js/adminUsersList",
	"basemaps/js/adminMspValidation",
	"basemaps/js/adminForms2",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/text!../templates/adminView.html",
	"dojo/domReady!"
], function(
	declare, parser, lang, on, dom, domStyle, request, array, domConstruct, adminLayerList, adminUsersList, adminMspValidation, adminForms,
	_WidgetBase, _TemplatedMixin, template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "adminView",
		adminForms: null,
		adminLayerList: null,
		adminUsersList: null,
		adminMspValidation: null,
		userRole: null,
		userRights: null,
		userCountry: null,
		userName: null,
		
		constructor: function(params) {
			this.userRole = params.role;
			this.userRights = params.rights;
			this.userCountry = params.country;
			this.userName = params.name;
		},
		
		layersButtonClick: function() {
			this.adminForms.cleanAdminForm();
			this.showLayerList();
		},
		
		usersButtonClick: function() {
			this.adminForms.cleanAdminForm();
			if (this.adminUsersList == null) {
				this.adminUsersList = new adminUsersList({forms: this.adminForms}).placeAt(this.adminUsersListSection);
			}
			this.showUsersList();
		},
		
		mspOutputButtonClick: function() {
			this.adminForms.cleanAdminForm();
			if (this.adminMspValidation == null) {
				this.adminMspValidation = new adminMspValidation({forms: this.adminForms, role: this.userRole, country: this.userCountry, name: this.userName}).placeAt(this.adminMspValidationSection);
			}
			this.showMspValidation();
		},
		
		postCreate: function() {
			this.adminForms = new adminForms().placeAt(this.adminFormsSection);
			this.adminLayerList = new adminLayerList({forms: this.adminForms, role: this.userRole, rights: this.userRights}).placeAt(this.adminLayerListSection);
		},
    
		destroy: function() {
			
		},
		
		show: function(open) {
			domStyle.set(this.domNode, "display", open ? "block" : "none");
		},
		
		showViewButtons: function(open) {
			domStyle.set(this.adminToolsViews, "display", open ? "block" : "none");
		},
		
		showUsersButton: function(open) {
			domStyle.set(this.usersView, "display", open ? "block" : "none");
		},
		
		showLayerList: function() {
			if (this.adminUsersList)
				domStyle.set(this.adminUsersList.domNode, {"display": "none"});
			if (this.adminMspValidation)
				domStyle.set(this.adminMspValidation.domNode, {"display": "none"});
			if (this.adminLayerList)
				domStyle.set(this.adminLayerList.domNode, {"display": "block"});
		},
		
		showUsersList: function() {
			if (this.adminLayerList)
				domStyle.set(this.adminLayerList.domNode, {"display": "none"});
			if (this.adminMspValidation)
				domStyle.set(this.adminMspValidation.domNode, {"display": "none"});
			if (this.adminUsersList)
				domStyle.set(this.adminUsersList.domNode, {"display": "block"});
		}, 
		
		showMspValidation: function() {
			if (this.adminLayerList)
				domStyle.set(this.adminLayerList.domNode, {"display": "none"});
			if (this.adminUsersList)
				domStyle.set(this.adminUsersList.domNode, {"display": "none"});
			if (this.adminMspValidation)
				domStyle.set(this.adminMspValidation.domNode, {"display": "block"});
		}, 
	});
});

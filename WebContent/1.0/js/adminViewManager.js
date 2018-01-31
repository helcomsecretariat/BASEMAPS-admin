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
	"basemaps/js/adminLayerList",
	"basemaps/js/adminUsersList",
	"basemaps/js/adminForms",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/text!../templates/adminView.html",
	"dojo/domReady!"
], function(
	declare, parser, lang, on, dom, domStyle, request, array, domConstruct, adminLayerList, adminUsersList, adminForms,
	_WidgetBase, _TemplatedMixin, template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "adminView",
		adminForms: null,
		adminLayerList: null,
		adminUsersList: null,
		
		constructor: function(params) {
			console.log(params);
			
		},
		
		layersButtonClick: function() {
			this.showLayerList();
		},
		
		usersButtonClick: function() {
			if (this.adminUsersList == null) {
				this.adminUsersList = new adminUsersList({forms: this.adminForms}).placeAt(this.adminUsersListSection);
			}
			//else {
			//	domStyle.set(this.adminUsersList.domNode, {"display": "block"});
			//}
			this.showUsersList();
			//domStyle.set(this.adminLayerList.domNode, {"display": "none"});
			//this.adminLayerList.domNode.style("visibility", "hidden");
			//console.log(this.adminLayerList.domNode);
		},
		
		postCreate: function() {
			this.adminForms = new adminForms().placeAt(this.adminFormsSection);
			this.adminLayerList = new adminLayerList({forms: this.adminForms}).placeAt(this.adminLayerListSection);
			//var llwidget = new layerList({map: map}).placeAt(this.layerlistContainer);
			/*on(this.collapseAllButton, "click", lang.hitch(this, function(){
			
			}));*/
			//alert("adminView created");
			//parser.parse();
			/*console.log(this.tabCont);
			var tc = new TabContainer({
		        style: "height: 100%; width: 100%;"
		    }, this.tabCont);
			console.log(tc);
		    var cp1 = new ContentPane({
		         title: "Food",
		         content: "We offer amazing food"
		    });
		    tc.addChild(cp1);

		    var cp2 = new ContentPane({
		         title: "Drinks",
		         content: "We are known for our drinks."
		    });
		    tc.addChild(cp2);

		    tc.startup();*/
			
		},
    
		destroy: function() {
		
		},
		
		show: function(open) {
			domStyle.set(this.domNode, "display", open ? "block" : "none");
		},
		
		showViewButtons: function(open) {
			domStyle.set(this.adminToolsViews, "display", open ? "block" : "none");
		},
		
		showLayerList: function() {
			domStyle.set(this.adminUsersList.domNode, {"display": "none"});
			domStyle.set(this.adminLayerList.domNode, {"display": "block"});
		},
		
		showUsersList: function() {
			domStyle.set(this.adminLayerList.domNode, {"display": "none"});
			domStyle.set(this.adminUsersList.domNode, {"display": "block"});
		}
	});
});

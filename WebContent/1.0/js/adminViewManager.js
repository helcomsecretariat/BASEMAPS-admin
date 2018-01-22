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
	"basemaps/js/adminForms",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/text!../templates/adminView.html",
	"dojo/domReady!"
], function(
	declare, parser, lang, on, dom, domStyle, request, array, domConstruct, adminLayerList, adminForms,
	_WidgetBase, _TemplatedMixin, template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "adminView",
		
		constructor: function() {
			//parser.parse();
			
		},
		
		layersButtonClick: function() {
			alert("Layers");
		},
		
		usersButtonClick: function() {
			alert("Users");
		},
		
		postCreate: function() {
			var af = new adminForms().placeAt(this.adminFormsSection);
			var all = new adminLayerList({forms: af}).placeAt(this.adminLayerListSection);
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
		}
	});
});

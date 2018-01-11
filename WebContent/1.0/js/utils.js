define([
	"dojo/_base/declare",
	"dojo/on", 
	"dojo/dom",
	"dojo/dom-style"	
], function(
	declare, on, dom, domStyle
) {
	return declare(null, {
		
		constructor: function(){
			
			// on Admin link click init login window
			//var adminButton = dom.byId("adminLink");
			//on(adminButton, "click", function(evt){
			//	var lgn = new loginWidget();
	        //});
		},
		show: function(elementId, display) {
			var element = dom.byId(elementId);
			domStyle.set(element, {"display": display});
		},
		changeText: function(elementId, text) {
			var element = dom.byId(elementId);
			element.innerHTML = text;
		}
	});
});

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
		},
		clearInput: function(elementId) {
			var element = dom.byId(elementId);
			element.value = "";
		},
		getInputValue: function(elementId) {
			return dom.byId(elementId).value;
		},
		setInputValue: function(elementId, value) {
			dom.byId(elementId).value = value;
		},
		getTextValue: function(elementId) {
			return dom.byId(elementId).innerHTML;
		},
		setTextValue: function(elementId, value) {
			dom.byId(elementId).innerHTML = value;
		},
		createPostRequestParams(data) {
			return {
				data: JSON.stringify(data),
				handleAs: "json",
				headers: {
					"Content-Type": 'application/json; charset=utf-8',
					"Accept": "application/json"
				}
			}
		},
		createPostWithTimeoutRequestParams(data) {
			return {
				data: JSON.stringify(data),
				handleAs: "json",
				headers: {
					"Content-Type": 'application/json; charset=utf-8',
					"Accept": "application/json"
				},
				timeout: 60000
			}
		}
	});
});

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
	"basemaps/js/utils",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/text!../templates/adminMspValidation.html"
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
	utils,
	_WidgetBase, 
	_TemplatedMixin, 
	template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "adminMspValidation",
		utils: null,
		formsObj: null,
		constructor: function(params) {
			this.formsObj = params.forms;
			this.utils = new utils();
		},
    
		postCreate: function() {
						
			on(this.mspFileInput, "change", lang.hitch(this, function() {
				var selectedFile = document.getElementById("mspFileInput").files[0];
				var zip = new JSZip();
				zip.loadAsync( selectedFile /* = file blob */).then(function(zip) {
					Object.keys(zip.files).forEach(function (filename) {
						console.log(filename);
							/*zip.files[filename].async('string').then(function (fileData) {
								console.log(fileData) // These are your file contents      
							})*/
					});
				}, function() {alert("Not a valid zip file")}); 
			}));
		}		
	});
});
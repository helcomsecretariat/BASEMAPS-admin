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
		selectedFile: null,
		constructor: function(params) {
			this.formsObj = params.forms;
			this.utils = new utils();
		},
    
		postCreate: function() {
			var exts = ["shp", "shx", "dbf", "sbn", "sbx", "fbn", "fbx", "ain", "aih", "atx", "ixs", "mxs", "prj", "xml", "cpg"];
			
			on(this.mspFileInput, "change", lang.hitch(this, function() {
				this.formsObj.cleanValidationForm();
				var filenames = [];
				this.utils.show("validationForm", "block");
				this.selectedFile = document.getElementById("mspFileInput").files[0];
				const lastDot = this.selectedFile.name.lastIndexOf('.');
				const uploadExt = this.selectedFile.name.substring(lastDot + 1);
				if (uploadExt.toLowerCase() == "zip") {
					var zip = new JSZip();
					zip.loadAsync(this.selectedFile).then(lang.hitch(this, function(zip) {
						this.utils.show("checkExtGroup", "block");
						var index = 0;
						for (let filename of Object.keys(zip.files)) {
							index += 1;
							const ld = filename.lastIndexOf('.');
							const ext = filename.substring(ld + 1);
							//var res = filename.split(".");
							//var ext = res[res.length - 1];
							var extInExts = (exts.indexOf(ext.toLowerCase()) > -1);
							if (!extInExts) {
								this.utils.setTextValue("checkExtMessage", "Violation of rule 2. ZIP archive contains not allowed file with extension \"" + ext + "\".");
								break;
							}
							else {
								if (ext.toLowerCase() == "shp") {
									filenames.push(filename);
								}
								if (index == Object.keys(zip.files).length) {
									this.utils.setTextValue("checkExtMessage", "ZIP archive contains Shapefile(s): " + filenames.join(", ")); 
									this.utils.show("validateButton", "block");
								}
							}
						}
					}), lang.hitch(this, function() {
						his.utils.setTextValue("checkZipMessage", "Violation of rule 1. Not a valid ZIP archive. Please select a valid ZIP archive."); 
						this.utils.show("checkZipGroup", "block");
					})); 
				}
				else {
					this.utils.setTextValue("checkZipMessage", "Violation of rule 1. Not a ZIP archive. Please select a ZIP archive."); 
					this.utils.show("checkZipGroup", "block");
				}
			}));
			
			on(this.formsObj.validateButton, "click", lang.hitch(this, function() {
				domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
				this.uploadFile();
				var u = this.utils;
				
				setTimeout(function() {
					document.getElementById("mspFileInput").value = "";
					u.show("validateButton", "none");
		    	}, 3000);
			}));
			
			on(this.formsObj.uploadValidDataButton, "click", lang.hitch(this, function() {
				alert("Upload functionality is under development.");
			}));
		},

		uploadFile: function() {
			const formData = new FormData();
			formData.append("file", this.selectedFile);
			formData.append("f", "json");
			const options = {
				method: 'POST',
				body: formData
			};

			fetch("https://maps.helcom.fi/arcgis/rest/services/PBS126/data_tools/GPServer/uploads/upload", options)
				.then(lang.hitch(this, function(response) {
					return response.text();
				}))
				.then(lang.hitch(this, function(text) {
					var resp = JSON.parse(text);
					this.utils.show("uploadGroup", "block");
					if (resp.error) {
						this.utils.setTextValue("shpUploadMessage", "Selected file was not uploaded to the server. Something went wrong.");
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
					else {
						if (resp.item.itemName) {
							this.utils.setTextValue("shpUploadMessage", resp.item.itemName + " was uploaded to the server for processing.");
						}
						if (resp.item.itemID) {
							this.validateFile(resp.item.itemID);
						}
					}
				}));
		},
		validateFile: function(itemId) {
			var url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/data_tools/GPServer/Validate%20Shapefile/execute?Country=PL&Shapefile_ZIP=%7B%22itemID%22%3A%22" + itemId + "%22%7D&f=pjson";
			fetch(url)
			.then(lang.hitch(this, function(response) {
				return response.text();
			}))
			.then(lang.hitch(this, function(text) {
				var resp = JSON.parse(text);
				if (resp.error) {
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					if (resp.results) {
						if (resp.results[0].paramName == "Output") {
							var respFiles = JSON.parse(resp.results[0].value[0]);
							var validCount = 0;
							array.forEach(respFiles, lang.hitch(this, function(file) {
								var container = domConstruct.create("div", {}, this.formsObj.errorsSection, "last");
								domConstruct.create("div", {"style": "font-size: 16px; font-weight: bold; margin-top: 10px;", "innerHTML": file.file}, container, "last");
								if (file.error.length > 0) {
									if (file.fatalError) {
										domConstruct.create("div", {"style": "font-size: 16px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": file.error.length + " dataset errors encountered. Please fix errors and start validation again."}, container, "last");
									}
									else {
										domConstruct.create("div", {"style": "font-size: 16px; font-weight: bold; margin-left: 10px; margin-top: 5px;", "innerHTML": "Dataset contains " + file.fCount + " features, " + file.fGoodCount + " have passed validation."}, container, "last");
										domConstruct.create("div", {"style": "font-size: 16px; color: red; margin-left: 10px; margin-bottom: 5px;", "innerHTML": file.error.length + " feature errors encountered in " + file.fErrorCount + " features. Please fix errors and start validation again."}, container, "last");
									}
									var errorsContainer = domConstruct.create("div", {"style": "margin-left: 20px;"}, container, "last");
									array.forEach(file.error, lang.hitch(this, function(error) {
										domConstruct.create("div", {"style": "font-size: 14px;", "innerHTML": error}, errorsContainer, "last");
									}));
								}
								else {
									domConstruct.create("div", {"style": "font-size: 16px; font-weight: bold; margin-left: 10px; margin-top: 5px;", "innerHTML": "Dataset contains " + file.fCount + " features, " + file.fGoodCount + " have passed validation."}, container, "last");
									domConstruct.create("div", {"style": "font-size: 16px; font-weight: bold; margin-left: 10px; margin-top: 5px;", "innerHTML": "No errors encountered, dataset is valid."}, container, "last");
									validCount = validCount + 1;
									if (validCount == respFiles.length) {
										this.utils.show("uploadValidDataButton", "block");
									}
								}
								
							}));
							
							this.utils.show("errorReportSection", "block");
						}
					}
					
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
			}));
		}
	});
});
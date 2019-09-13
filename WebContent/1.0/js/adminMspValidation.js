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
			on(this.radioShp, "click", lang.hitch(this, function() {
				this.utils.show("wfsValidationRules", "none");
				this.utils.show("shpValidationRules", "block");
			}));
			
			on(this.radioWfs, "click", lang.hitch(this, function() {
				this.utils.show("shpValidationRules", "none");
				this.utils.show("wfsValidationRules", "block");
			}));
			
			var exts = ["shp", "shx", "dbf", "sbn", "sbx", "fbn", "fbx", "ain", "aih", "atx", "ixs", "mxs", "prj", "xml", "cpg"];
			var requiredExts = ["shp", "shx", "dbf"];
			
			/*on(this.mspFileInput, "input", lang.hitch(this, function() {
				console.log("input");
				domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
			}));
			
			on(this.mspFileInput, "select", lang.hitch(this, function() {
				console.log("select");
				domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
			}));*/
			
			on(this.mspFileInput, "change", lang.hitch(this, function() {
				//domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				this.formsObj.cleanValidationForm();
				var filenames = [];
				this.utils.show("validationForm", "block");
				var inputFile = document.getElementById("mspFileInput");
				if (inputFile.files.length) {
					this.selectedFile = inputFile.files[0];
					const lastDot = this.selectedFile.name.lastIndexOf('.');
					const uploadExt = this.selectedFile.name.substring(lastDot + 1);
					if (uploadExt.toLowerCase() == "zip") {
						var zip = new JSZip();
						zip.loadAsync(this.selectedFile).then(lang.hitch(this, function(zip) {
							this.utils.show("checkExtGroup", "block");
							var index = 0;
							var requiredFilesCount = 0;
							for (let filename of Object.keys(zip.files)) {
								index += 1;
								const ld = filename.lastIndexOf('.');
								const ext = filename.substring(ld + 1);
								//var res = filename.split(".");
								//var ext = res[res.length - 1];
								var extInExts = (exts.indexOf(ext.toLowerCase()) > -1);
								if (requiredExts.indexOf(ext.toLowerCase()) > -1) {
									requiredFilesCount += 1;
								}
								if (!extInExts) {
									console.log("if (!extInExts) {");
									this.utils.setTextValue("checkExtMessage", "Violation of rule 2. ZIP archive contains not valid Shapefile(s) or file(s) with not allowed extension, or files are placed in folder(s).");
									break;
								}
								else {
									if (ext.toLowerCase() == "shp") {
										filenames.push(filename);
									}
									if (index == Object.keys(zip.files).length) {
										if (requiredFilesCount == (filenames.length * 3)) {
											this.utils.setTextValue("checkExtMessage", "ZIP archive contains Shapefile(s): " + filenames.join(", ")); 
											this.utils.show("validateButton", "block");
										}
										else {
											this.utils.setTextValue("checkExtMessage", "Violation of rule 2. ZIP archive contains not valid Shapefile(s) or file(s) with not allowed extension, or files are placed in folder(s).");
											break;
										}
									}
								}
							}
						}), lang.hitch(this, function() {
							this.utils.setTextValue("checkZipMessage", "Violation of rule 1. Not a valid ZIP archive. Please select a valid ZIP archive."); 
							this.utils.show("checkZipGroup", "block");
						})); 
					}
					else {
						this.utils.setTextValue("checkZipMessage", "Violation of rule 1. Not a ZIP archive. Please select a ZIP archive."); 
						this.utils.show("checkZipGroup", "block");
					}
				}
				
			}));
			
			on(this.formsObj.validateButton, "click", lang.hitch(this, function() {
				domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
				this.uploadFile();
				this.utils.changeText("validationCloseButton", "New Validation");
				
				var u = this.utils;
				setTimeout(function() {
					document.getElementById("mspFileInput").value = "";
					u.show("validateButton", "none");
		    	}, 3000);
			}));
			
			on(this.validateWfsButton, "click", lang.hitch(this, function() {
				if (this.wfsInput.value.trim() != "") {
					this.formsObj.cleanValidationForm();
					this.utils.show("validationForm", "block");
					
					domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
					this.validateWFS(this.wfsInput.value.trim());
					this.utils.changeText("validationCloseButton", "New Validation");
					
					setTimeout(function() {
						document.getElementById("wfsInput").value = "";
			    	}, 3000);
				}
			}));
			
			
			on(this.formsObj.uploadValidDataButton, "click", lang.hitch(this, function() {
				alert("Upload functionality is under development.");
			}));
			
			on(this.formsObj.validationCloseButton, "click", lang.hitch(this, function() {
				this.wfsInput.value = "";
				this.mspFileInput.value = "";
				this.utils.show("shpValidationRules", "none");
				this.utils.show("wfsValidationRules", "none");
				this.radioShp.checked = false;
				this.radioWfs.checked = false;
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
			var url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/data_tools/GPServer/Validate_Shapefile/execute?Country=PL&Shapefile_ZIP=%7B%22itemID%22%3A%22" + itemId + "%22%7D&f=pjson";
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
									domConstruct.create("div", {"style": "font-size: 16px; color: green; font-weight: bold; margin-left: 10px; margin-top: 5px;", "innerHTML": "No errors encountered, dataset is valid."}, container, "last");
									validCount = validCount + 1;
									if (validCount == respFiles.length) {
										this.utils.show("uploadMessage", "block");
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
		},
		validateWFS: function(wfsUrl) {
			this.utils.setTextValue("wfsUrlMessage", wfsUrl); 
			this.utils.show("wfsUrlGroup", "block");
			
			var url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/data_tools/GPServer/Validate_WFS/execute?Country=PL&WFS_URL=" + wfsUrl + "&f=pjson";
			fetch(url)
			.then(lang.hitch(this, function(response) {
				domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				return response.text();
			}))
			.then(lang.hitch(this, function(text) {
				var resp = JSON.parse(text);
				console.log(resp);
				if (resp.error) {
					domConstruct.create("div", {"style": "font-size: 16px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": "Service is not responding. Please try again later."}, this.formsObj.errorsSection, "last");
					this.utils.show("errorReportSection", "block");
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					if (resp.results) {
						if (resp.results[0].paramName == "Output") {
							//var respFiles = JSON.parse(resp.results[0].value[0]);
							var respFiles = resp.results[0].value;
							var validCount = 0;
							if (respFiles.initError) {
								domConstruct.create("div", {"style": "font-size: 16px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": respFiles.error[0]}, this.formsObj.errorsSection, "last");
							}
							else {
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
										domConstruct.create("div", {"style": "font-size: 16px; color: green; font-weight: bold; margin-left: 10px; margin-top: 5px;", "innerHTML": "No errors encountered, dataset is valid."}, container, "last");
										validCount = validCount + 1;
										if (validCount == respFiles.length) {
											this.utils.show("uploadMessage", "block");
											this.utils.show("uploadValidDataButton", "block");
										}
									}
								}));
							}
							this.utils.show("errorReportSection", "block");
						}
					}
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
			}));
		}
	});
});
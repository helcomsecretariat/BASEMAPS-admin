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
		userRole: null,
		userCountry: null,
		userName: null,
		selectedFile: null,
		validation: null,
		planIds: null,
		tmpDatasets: null,
		backupUploadReportContainer: null,
		constructor: function(params) {
			this.formsObj = params.forms;
			this.userRole = params.role;
			this.userName = params.name;
			if (this.userRole == "PROVIDER") {
				this.userCountry = params.country;
			}
			this.utils = new utils();
		},
    
		postCreate: function() {			
			on(this.radioShpArea, "click", lang.hitch(this, function() {
				this.validation = "SHP_AREA";
				if (this.userRole == "ADMIN") {
					this.utils.show("shpAreaCountrySelectGroup", "block");
				}
				this.utils.show("shpSeaUseValidationRules", "none");
				this.utils.show("deleteByPlanIdValidationRules", "none");
				/*this.utils.show("wfsAreaValidationRules", "none");
				this.utils.show("wfsSeaUseValidationRules", "none");*/
				this.utils.show("shpAreaValidationRules", "block");
			}));
			
			on(this.radioShpSeaUse, "click", lang.hitch(this, function() {
				this.validation = "SHP_SEA_USE";
				if (this.userRole == "ADMIN") {
					this.utils.show("shpSeaUseCountrySelectGroup", "block");
				}
				this.utils.show("shpAreaValidationRules", "none");
				this.utils.show("deleteByPlanIdValidationRules", "none");
				/*this.utils.show("wfsAreaValidationRules", "none");
				this.utils.show("wfsSeaUseValidationRules", "none");*/
				this.utils.show("shpSeaUseValidationRules", "block");
			}));
			
			on(this.radioDeleteByPlanId, "click", lang.hitch(this, function() {
				this.validation = "DELETE";
				if (this.userRole == "ADMIN") {
					this.utils.show("deleteByPlanIdCountrySelectGroup", "block");
				}
				else {
					this.getPlanIds();
				}
				this.utils.show("shpAreaValidationRules", "none");
				this.utils.show("shpSeaUseValidationRules", "none");
				/*this.utils.show("wfsAreaValidationRules", "none");
				this.utils.show("wfsSeaUseValidationRules", "none");*/
				this.utils.show("deleteByPlanIdValidationRules", "block");
			}));
			
			/*on(this.radioWfsArea, "click", lang.hitch(this, function() {
				this.validation = "WFS_AREA";
				this.utils.show("shpAreaValidationRules", "none");
				this.utils.show("shpSeaUseValidationRules", "none");
				this.utils.show("wfsSeaUseValidationRules", "none");
				this.utils.show("wfsAreaValidationRules", "block");
			}));
			
			on(this.radioWfsSeaUse, "click", lang.hitch(this, function() {
				this.validation = "WFS_SEA_USE";
				this.utils.show("shpAreaValidationRules", "none");
				this.utils.show("shpSeaUseValidationRules", "none");
				this.utils.show("wfsAreaValidationRules", "none");
				this.utils.show("wfsSeaUseValidationRules", "block");
			}));*/
			
			on(this.deleteByPlanIdCountrySelect, "change", lang.hitch(this, function() {
				this.userCountry = this.deleteByPlanIdCountrySelect.options[this.deleteByPlanIdCountrySelect.selectedIndex].value;
				this.getPlanIds();
			}));
			
			on(this.deleteByPlanIdButton, "click", lang.hitch(this, function() {
				if (this.deleteByPlanIdPlanSelect.options.length > 0) {
					this.planIds = this.deleteByPlanIdPlanSelect.options[this.deleteByPlanIdPlanSelect.selectedIndex].value;
					if (confirm("Please confirm removing all MSP output data with plan ID '" + this.planIds + "' from Basemaps.") == true) {
						this.formsObj.cleanDeleteForm();
						this.utils.show("mspOutputForm", "block");
						this.utils.show("deleteDataForm", "block");
						this.utils.setTextValue("deleteDataMessage", "Removing MSP Plan Area and Sea use data with plan ID(s) " + this.planIds + ".");
						domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
						this.deleteData();
					}
				}
				else {
					alert("Select a plan ID to delete.");
				}
			}));
			
			on(this.mspAreaFileInput, "change", lang.hitch(this, function() {
				this.formsObj.cleanValidationForm();
				this.utils.changeText("validationCloseButton", "Close");
				this.utils.show("mspOutputForm", "block");
				this.utils.show("validationForm", "block");
				var inputFile = document.getElementById("mspAreaFileInput");
				this.validateZip(inputFile);
			}));
			
			on(this.mspSeaUseFileInput, "change", lang.hitch(this, function() {
				this.formsObj.cleanValidationForm();
				this.utils.changeText("validationCloseButton", "Close");
				this.utils.show("mspOutputForm", "block");
				this.utils.show("validationForm", "block");
				var inputFile = document.getElementById("mspSeaUseFileInput");
				this.validateZip(inputFile);
			}));
						
			on(this.formsObj.validateButton, "click", lang.hitch(this, function() {
				domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
				this.uploadFileForValidation();
				this.utils.changeText("validationCloseButton", "New Validation");
				
				var u = this.utils;
				setTimeout(function() {
					document.getElementById("mspAreaFileInput").value = "";
					document.getElementById("mspSeaUseFileInput").value = "";
					u.show("validateButton", "none");
		    	}, 3000);
			}));
			
			on(this.validateWfsButton, "click", lang.hitch(this, function() {
				if (this.wfsInput.value.trim() != "") {
					this.formsObj.cleanValidationForm();
					this.utils.show("uploadForm", "block");
					
					domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
					this.validateWFS(this.wfsInput.value.trim());
					this.utils.changeText("validationCloseButton", "New Validation");
					
					setTimeout(function() {
						document.getElementById("wfsInput").value = "";
			    	}, 3000);
				}
			}));
						
			on(this.formsObj.uploadValidDataButton, "click", lang.hitch(this, function() {
				this.formsObj.cleanValidationForm();
				this.formsObj.cleanUploadForm();
				this.utils.show("uploadForm", "block");
				domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
				if (this.validation == "SHP_AREA") {
					this.utils.setTextValue("backupDataMessage", "Backuping MSP Plan Area data with plan ID(s) " + this.planIds + ".");
					this.backupFileArea();
				}
				if (this.validation == "SHP_SEA_USE") {
					this.utils.setTextValue("backupDataMessage", "Backuping MSP Sea Use data with plan ID(s) " + this.planIds + ".");
					this.backupFileSeaUse();
				}
				
			}));
			
			on(this.formsObj.validationCloseButton, "click", lang.hitch(this, function() {
				this.validation = null;
				if (this.userRole == "ADMIN") {
					this.userCountry = null;
				}
				this.wfsInput.value = "";
				this.mspAreaFileInput.value = "";
				this.mspSeaUseFileInput.value = "";
				this.selectedFile = null;
				this.planIds = null;
				this.tmpDatasets = null;
				this.utils.show("shpAreaValidationRules", "none");
				this.utils.show("shpSeaUseValidationRules", "none");
				this.utils.show("deleteByPlanIdValidationRules", "none");
				/*this.utils.show("wfsAreaValidationRules", "none");
				this.utils.show("wfsSeaUseValidationRules", "none");*/
				this.utils.show("shpAreaCountrySelectGroup", "none");
				this.utils.show("shpSeaUseCountrySelectGroup", "none");
				this.utils.show("deleteByPlanIdCountrySelectGroup", "none");
				this.radioShpArea.checked = false;
				this.radioShpSeaUse.checked = false;
				this.radioDeleteByPlanId.checked = false;
				/*this.radioWfsArea.checked = false;
				this.radioWfsSeaUse.checked = false;*/
				this.backupUploadReportContainer = null;
			}));
		},
		
		getPlanIds: function() {
			domStyle.set(dojo.byId("loadingCover"), {"display": "block"});
			var url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/MSPoutput/MapServer/6/query?outFields=planId%2C+processStep%2C+Country&returnGeometry=false&orderByFields=planId&f=json&where=Country%3D%27" + this.userCountry + "%27";
			fetch(url)
			.then(lang.hitch(this, function(response) {
				return response.text();
			}))
			.then(lang.hitch(this, function(text) {
				var resp = JSON.parse(text);
				if (resp.error) {
					console.log(resp);
					alert("Something went wrong when getting Plan Ids. " + resp.error.message + " Please report it to data@helcom.fi.");
					domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": "Something went wrong when getting Plan Ids. " + resp.error.message + " Please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					this.deleteByPlanIdPlanSelect.options.length = 0;
					array.forEach(resp.features, lang.hitch(this, function(feature) {
						this.deleteByPlanIdPlanSelect.options[this.deleteByPlanIdPlanSelect.options.length] = new Option(feature.attributes.planId + " (" + feature.attributes.processStep + ")", feature.attributes.planId);
					}));
					this.utils.show("deleteByPlanIdPlanSelectGroup", "block");
					console.log(resp);
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
			}));
		},
		
		validateZip: function(inputFile) {
			var filenames = [];
			var exts = ["shp", "shx", "dbf", "sbn", "sbx", "fbn", "fbx", "ain", "aih", "atx", "ixs", "mxs", "prj", "xml", "cpg"];
			var requiredExts = ["shp", "shx", "dbf"];
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
								this.utils.setTextValue("checkExtMessage", "ZIP archive contains not valid Shapefile(s) or file(s) with not allowed extension, or files are placed in folder(s).");
								console.log(ext);
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
										this.utils.setTextValue("checkExtMessage", "ZIP archive contains not valid Shapefile(s) or file(s) with not allowed extension, or files are placed in folder(s).");
										break;
									}
								}
							}
						}
					}), lang.hitch(this, function() {
						this.utils.setTextValue("checkZipMessage", "Not a valid ZIP archive. Please select a valid ZIP archive."); 
						this.utils.show("checkZipGroup", "block");
					})); 
				}
				else {
					this.utils.setTextValue("checkZipMessage", "Not a ZIP archive. Please select a ZIP archive."); 
					this.utils.show("checkZipGroup", "block");
				}
			}
		},

		uploadFileForValidation: function() {
			const formData = new FormData();
			formData.append("file", this.selectedFile);
			formData.append("f", "json");
			const options = {
				method: 'POST',
				body: formData
			};
			
			fetch("https://maps.helcom.fi/arcgis/rest/services/PBS126/tools/GPServer/uploads/upload", options)
				.then(lang.hitch(this, function(response) {
					return response.text();
				}))
				.then(lang.hitch(this, function(text) {
					var resp = JSON.parse(text);
					this.utils.show("uploadGroup", "block");
					if (resp.error) {
						this.utils.setTextValue("shpUploadMessage", "Selected file was not uploaded to the server. Something went wrong. " + resp.error.message + " Please report it to data@helcom.fi.");
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
					else {
						if (resp.item.itemName) {
							this.utils.setTextValue("shpUploadMessage", resp.item.itemName + " was uploaded to the server for processing.");
						}
						if (resp.item.itemID) {
							if (this.validation == "SHP_AREA") {
								this.validateFileArea(resp.item.itemID);
							}
							if (this.validation == "SHP_SEA_USE") {
								this.validateFileSeaUse(resp.item.itemID);
							}
						}
					}
				}));
		},
		validateFileArea: function(itemId) {
			if (this.userRole == "ADMIN") {
				this.userCountry = this.shpAreaCountrySelect.options[this.shpAreaCountrySelect.selectedIndex].value;
			}
			
			var url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/tools/GPServer/validateArea/execute?Country=" + this.userCountry + "&Name=" + this.userName + "&Shapefile_ZIP=%7B%22itemID%22%3A%22" + itemId + "%22%7D&f=pjson";
			fetch(url)
			.then(lang.hitch(this, function(response) {
				return response.text();
			}))
			.then(lang.hitch(this, function(text) {
				var resp = JSON.parse(text);
				if (resp.error) {
					console.log(resp);
					alert("Something went wrong when validating MSP Area data. " + resp.error.message + " Please report it to data@helcom.fi.");
					domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": "Something went wrong when validating MSP Area data. " + resp.error.message + " Please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					if (resp.results) {
						var datasetReport = null;
						var generalReport = null;
						if (resp.results[0].paramName == "DatasetReport") {
							datasetReport = resp.results[0].value;
						}
						if (resp.results[1].paramName == "GeneralReport") {
							generalReport = resp.results[1].value;
						}
						if (resp.results[2].paramName == "TmpDatasets") {
							this.tmpDatasets = resp.results[2].value;
						}
						if (resp.results[3].paramName == "PlanIds") {
							this.planIds = resp.results[3].value;
						}
						if ((datasetReport != null) && (generalReport != null) && (this.tmpDatasets != null) && (this.planIds != null)) {
							this.utils.show("errorReportSection", "block");
							this.displayValidationReport(generalReport, datasetReport);
						}
					}
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
			}));
		},
		
		validateFileSeaUse: function(itemId) {
			if (this.userRole == "ADMIN") {
				this.userCountry = this.shpSeaUseCountrySelect.options[this.shpSeaUseCountrySelect.selectedIndex].value;
			}
			
			var url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/tools/GPServer/validateSeaUse/execute?Country=" + this.userCountry + "&Name=" + this.userName + "&ShapefileZIP=%7B%22itemID%22%3A%22" + itemId + "%22%7D&f=pjson";
			fetch(url)
			.then(lang.hitch(this, function(response) {
				return response.text();
			}))
			.then(lang.hitch(this, function(text) {
				var resp = JSON.parse(text);
				if (resp.error) {
					console.log(resp);
					alert("Something went wrong when validating Sea Use data. " + resp.error.message + " Please report it to data@helcom.fi.");
					domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": "Something went wrong when validating Sea Use data. " + resp.error.message + " Please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					if (resp.results) {
						var datasetReport = null;
						var generalReport = null;
						if (resp.results[0].paramName == "DatasetReport") {
							//datasetReport = JSON.parse(resp.results[0].value[0]);
							datasetReport = resp.results[0].value;
						}
						if (resp.results[1].paramName == "GeneralReport") {
							generalReport = resp.results[1].value;
						}
						if (resp.results[2].paramName == "TmpDatasets") {
							this.tmpDatasets = JSON.stringify(resp.results[2].value);
						}
						if (resp.results[3].paramName == "PlanIds") {
							this.planIds = resp.results[3].value;
						}
						if ((datasetReport != null) && (generalReport != null) && (this.tmpDatasets != null) && (this.planIds != null)) {
							this.utils.show("errorReportSection", "block");
							this.displayValidationReport(generalReport, datasetReport);
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
				if (resp.error) {
					domConstruct.create("div", {"style": "font-size: 16px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": "Service is not responding. Please try again later."}, this.formsObj.errorsSection, "last");
					this.utils.show("errorReportSection", "block");
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					if (resp.results) {
						if (resp.results[0].paramName == "Output") {
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
		},
		
		displayValidationReport: function(generalReport, datasetReport) {
			var container = domConstruct.create("div", {}, this.formsObj.errorsSection, "last");
			if (generalReport.error) {
				domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": generalReport.errorMessage + "."}, container, "last");
				domConstruct.create("div", {"style": "font-size: 12px;  margin-left: 10px; margin-top: 0px;", "innerHTML": "If above error is a DATABASE ERROR, please report it to data@helcom.fi. If it is an INPUT DATA ERROR - try to fix data and validate again."}, container, "last");
			}
			if (generalReport.warnings.length > 0) {
				array.forEach(generalReport.warnings, lang.hitch(this, function(warning) {
					domConstruct.create("div", {"style": "font-size: 14px; color: blue;", "innerHTML": "Warning: " + warning}, container, "last");
				}));
			}
			if (generalReport.infoMessages.length > 0) {
				array.forEach(generalReport.infoMessages, lang.hitch(this, function(infoMessage) {
					domConstruct.create("div", {"style": "font-size: 14px; color: green;", "innerHTML": infoMessage}, container, "last");
				}));
			}
			console.log(datasetReport);
			if (datasetReport.length > 0) {
				array.forEach(datasetReport, lang.hitch(this, function(dataset) {
					domConstruct.create("div", {"style": "font-size: 16px; font-weight: bold; margin-top: 10px;", "innerHTML": dataset.dataset}, container, "last");
					if (dataset.datasetError) {
						domConstruct.create("div", {"style": "font-size: 16px; font-weight: bold; margin-left: 10px; margin-top: 5px;", "innerHTML": "Dataset contains error(s)."}, container, "last");
					}
					else {
						domConstruct.create("div", {"style": "font-size: 16px; font-weight: bold; margin-left: 10px; margin-top: 5px;", "innerHTML": "Dataset contains " + dataset.featureCount + " features. " + dataset.featureGoodCount + " have passed validation and " + dataset.featureErrorCount + " are with errors."}, container, "last");
					}
					var messagesContainer = domConstruct.create("div", {"style": "margin-left: 20px;"}, container, "last");
					array.forEach(dataset.infoMessages, lang.hitch(this, function(message) {
						if ("message" in message) {
							domConstruct.create("div", {"style": "font-size: 14px;", "innerHTML": "Info: " + message.message}, messagesContainer, "last");
						}
						else if ("warnings" in message) {
							domConstruct.create("div", {"style": "font-size: 14px; color: blue;", "innerHTML": "Warning: " + message.warnings}, messagesContainer, "last");
						}
						else if ("error" in message) {
							domConstruct.create("div", {"style": "font-size: 14px; color: red;", "innerHTML": "Error: " + message.error}, messagesContainer, "last");
						}
					}));
				}));
				if (!generalReport.error) {
					this.utils.show("uploadMessage", "block");
					if (this.validation == "SHP_AREA") {
						this.utils.setTextValue("uploadNoteMessage", "Note. All current MSP Plan Area data with plan ID(s) " + this.planIds + " (if any) will be backuped on Helcom server and replaced with uploaded data in Basemaps.");
					}
					if (this.validation == "SHP_SEA_USE") {
						this.utils.setTextValue("uploadNoteMessage", "Note. All current MSP Sea Use data with plan ID(s) " + this.planIds + " (if any) will be backuped on Helcom server and replaced with uploaded data in Basemaps.");
					}
					 
					this.utils.show("uploadValidDataButton", "block");
				}
			}
		},
		
		backupFileArea: function() {
			var url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/tools/GPServer/backupArea/execute?Country=" + this.userCountry + "&Name=" + this.userName + "&PlanIds=" + this.planIds + "&f=pjson";
			fetch(url)
			.then(lang.hitch(this, function(response) {
				return response.text();
			}))
			.then(lang.hitch(this, function(text) {
				var resp = JSON.parse(text);
				if (resp.error) {
					domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": "Something went wrong when backuping MSP Area data. " + resp.error.message + " Please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					if (resp.results) {
						var result = null;
						var generalReport = null;
						if (resp.results[0].paramName == "Result") {
							result = JSON.parse(resp.results[0].value);
						}
						if (resp.results[1].paramName == "GeneralReport") {
							generalReport = resp.results[1].value;
						}
						if ((result != null) && (generalReport != null) && (this.tmpDatasets != null)) {
							this.utils.show("uploadReportSection", "block");
							this.displayBackupReport(result, generalReport);
							if ((result == 1) || (result == 2)) {
								this.utils.show("uploadDataGroup", "block");
								this.utils.setTextValue("uploadDataMessage", "Uploading MSP Area data with plan ID(s) " + this.planIds + ".");
								this.uploadFileArea();
							}
						}
						else {
							domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
						}
					}
					else {
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
				}
			}));
		},
		
		backupFileSeaUse: function() {
			var url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/tools/GPServer/backupSeaUse/execute?Country=" + this.userCountry + "&Name=" + this.userName + "&PlanIds=" + this.planIds + "&f=pjson";
			fetch(url)
			.then(lang.hitch(this, function(response) {
				return response.text();
			}))
			.then(lang.hitch(this, function(text) {
				var resp = JSON.parse(text);
				if (resp.error) {
					domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": "Something went wrong when backuping Sea Use data. " + resp.error.message + " Please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					if (resp.results) {
						var result = null;
						var generalReport = null;
						if (resp.results[0].paramName == "Result") {
							result = JSON.parse(resp.results[0].value);
						}
						if (resp.results[1].paramName == "GeneralReport") {
							generalReport = resp.results[1].value;
						}
						if ((result != null) && (generalReport != null) && (this.tmpDatasets != null)) {
							this.utils.show("uploadReportSection", "block");
							this.displayBackupReport(result, generalReport);
							if ((result == 1) || (result == 2)) {
								this.utils.show("uploadDataGroup", "block");
								this.utils.setTextValue("uploadDataMessage", "Uploading MSP Sea Use data with plan ID(s) " + this.planIds + ".");
								this.uploadFileSeaUse();
							}
						}
						else {
							domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
						}
					}
					else{
						domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
					}
				}
			}));
		},
		
		displayBackupReport: function(result, generalReport) {
			this.backupUploadReportContainer = domConstruct.create("div", {}, this.formsObj.uploadSection, "last");
			if (generalReport.error) {
				domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": generalReport.errorMessage + "."}, this.backupUploadReportContainer, "last");
				domConstruct.create("div", {"style": "font-size: 12px;  margin-left: 10px; margin-top: 0px;", "innerHTML": "Error occured, please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
			}
			if (generalReport.warnings.length > 0) {
				array.forEach(generalReport.warnings, lang.hitch(this, function(warning) {
					domConstruct.create("div", {"style": "font-size: 14px; color: blue; margin-left: 10px;", "innerHTML": "Warning: " + warning}, this.backupUploadReportContainer, "last");
				}));
			}
			if (generalReport.infoMessages.length > 0) {
				array.forEach(generalReport.infoMessages, lang.hitch(this, function(infoMessage) {
					domConstruct.create("div", {"style": "font-size: 14px; color: green; margin-left: 10px;", "innerHTML": infoMessage}, this.backupUploadReportContainer, "last");
				}));
			}
		},
		
		uploadFileArea: function() {
			var url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/tools/GPServer/uploadArea/execute?Country=" + this.userCountry + "&Name=" + this.userName + "&Input_data=" + this.tmpDatasets + "&f=pjson";
			fetch(url)
			.then(lang.hitch(this, function(response) {
				return response.text();
			}))
			.then(lang.hitch(this, function(text) {
				var resp = JSON.parse(text);
				if (resp.error) {
					domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": "Something went wrong when uploading MSP Area data. " + resp.error.message + " Please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					if (resp.results) {
						var result = null;
						var generalReport = null;
						if (resp.results[0].paramName == "Result") {
							result = JSON.parse(resp.results[0].value);
						}
						if (resp.results[1].paramName == "GeneralReport") {
							generalReport = resp.results[1].value;
						}
						if ((result != null) && (generalReport != null)) {
							this.displayUploadReport(generalReport);
						}
					}
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
			}));
		},
		
		uploadFileSeaUse: function() {
			var url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/tools/GPServer/uploadSeaUse/execute?Country=" + this.userCountry + "&Name=" + this.userName + "&Input_data=" + this.tmpDatasets + "&f=pjson";
			fetch(url)
			.then(lang.hitch(this, function(response) {
				return response.text();
			}))
			.then(lang.hitch(this, function(text) {
				var resp = JSON.parse(text);
				if (resp.error) {
					domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": "Something went wrong when uploading Sea Use data. " + resp.error.message + " Please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					if (resp.results) {
						var result = null;
						var generalReport = null;
						if (resp.results[0].paramName == "Result") {
							result = JSON.parse(resp.results[0].value);
						}
						if (resp.results[1].paramName == "GeneralReport") {
							generalReport = resp.results[1].value;
						}
						if ((result != null) && (generalReport != null)) {
							this.displayUploadReport(generalReport);
						}
					}
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
			}));
		},
		
		displayUploadReport: function(generalReport) {
			if (generalReport.error) {
				domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": generalReport.errorMessage + "."}, this.backupUploadReportContainer, "last");
				domConstruct.create("div", {"style": "font-size: 12px;  margin-left: 10px; margin-top: 0px;", "innerHTML": "Error occured, please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
			}
			if (generalReport.warnings.length > 0) {
				array.forEach(generalReport.warnings, lang.hitch(this, function(warning) {
					domConstruct.create("div", {"style": "font-size: 14px; color: blue; margin-left: 10px;", "innerHTML": "Warning: " + warning}, this.backupUploadReportContainer, "last");
				}));
			}
			if (generalReport.infoMessages.length > 0) {
				array.forEach(generalReport.infoMessages, lang.hitch(this, function(infoMessage) {
					domConstruct.create("div", {"style": "font-size: 14px; color: green; margin-left: 10px;", "innerHTML": infoMessage}, this.backupUploadReportContainer, "last");
				}));
			}
		},
		
		deleteData: function() {
			let url = "https://maps.helcom.fi/arcgis/rest/services/PBS126/tools/GPServer/deleteData/execute?Country=" + this.userCountry + "&Name=" + this.userName + "&PlanIds=" + this.planIds + "&f=pjson";
			fetch(url)
			.then(lang.hitch(this, function(response) {
				return response.text();
			}))
			.then(lang.hitch(this, function(text) {
				let resp = JSON.parse(text);
				if (resp.error) {
					domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": "Something went wrong when deleting data. " + resp.error.message + " Please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
				else {
					if (resp.results) {
						console.log(resp.results);
						let generalReport = null;
						if (resp.results[1].paramName == "GeneralReport") {
							generalReport = resp.results[1].value;
						}
						if (generalReport != null) {
							this.utils.show("deleteReportSection", "block");
							this.displayDeleteReport(generalReport);
						}
						else {
							domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
						}
					}
					domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				}
			}));
		},
		
		displayDeleteReport: function(generalReport) {
			this.backupUploadReportContainer = domConstruct.create("div", {}, this.formsObj.deleteSection, "last");
			if (generalReport.error) {
				domConstruct.create("div", {"style": "font-size: 14px; color: red; margin-left: 10px; margin-top: 5px;", "innerHTML": generalReport.errorMessage + "."}, this.backupUploadReportContainer, "last");
				domConstruct.create("div", {"style": "font-size: 12px;  margin-left: 10px; margin-top: 0px;", "innerHTML": "Error occured, please report it to data@helcom.fi."}, this.backupUploadReportContainer, "last");
			}
			if (generalReport.warnings.length > 0) {
				array.forEach(generalReport.warnings, lang.hitch(this, function(warning) {
					domConstruct.create("div", {"style": "font-size: 14px; color: blue; margin-left: 10px;", "innerHTML": "Warning: " + warning}, this.backupUploadReportContainer, "last");
				}));
			}
			if (generalReport.infoMessages.length > 0) {
				array.forEach(generalReport.infoMessages, lang.hitch(this, function(infoMessage) {
					domConstruct.create("div", {"style": "font-size: 14px; color: green; margin-left: 10px;", "innerHTML": infoMessage}, this.backupUploadReportContainer, "last");
				}));
			}
		},
	});
});
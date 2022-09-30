define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/query",
	"dojo/dom-style",
	"dojo/request",
	"dojox/validate/web",
	"dojo/_base/array",
	"dijit/form/Select",
	"dojo/data/ItemFileReadStore",
	"dijit/form/MultiSelect",
	"dojo/_base/window",
	"basemaps/js/utils",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin",
	"dojo/text!../templates/adminForms2.html"
], function(
	declare,
	lang, on, dom, domConstruct, query, domStyle,
	request, validate, array, 
	Select, ItemFileReadStore, MultiSelect,win, utils,
	_WidgetBase, _TemplatedMixin, template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "adminForms",
		formView: null,
		action: null,
		utils: null,
		tree: null,
		addingWmsWithCategory: false,
		addingWfsWithCategory: false,
		addingMetadataWithCategory: false,
		wmsValidationPassed: false,
		wmsNameSelector: null,
		wmsUpdate: false,
		wfsValidationPassed: false,
		wfsNameSelector: null,
		wfsUpdate: false,
		downloadValidationPassed: false,
		arcgisValidationPassed: false,
		metadataFormatSelector: null,
		currentObjId: null,
		currentCategory: null,
		currentCategoryWmses: [],
		currentCategoryWfses: [],
		currentCategoryDownloads: [],
		currentCategoryArcgises: [],
		currentCategoryCategories: [],
		editMode: false,
		categoryUserSelector: null,
		countryLabels: ["Helcom", "Denmark", "Estonia", "Finland", "Germany", "Latvia", "Lithuania", "Poland", "Russia", "Sweden"],
		countryCodesLabels: {"DK": "Denmark", "EE": "Estonia", "FI": "Finland", "DE": "Germany", "LV": "Latvia", "LT": "Lithuania", "PL": "Poland", "RU": "Russia", "SE": "Sweden", "HE": "Helcom"},
		summaryLabel: null,
		initLabel: null,
		countryLabelFound: false,
		wmsCount: 0,
		wmsValidCount: 0,
		wmsNotValidCount: 0,
		wfsCount: 0,
		wfsValidCount: 0,
		wfsNotValidCount: 0,
		agsCount: 0,
		agsValidCount: 0,
		agsNotValidCount: 0,
		dnlCount: 0,
		dnlValidCount: 0,
		dnlNotValidCount: 0,
		totalServicesCount: 0,
		totalValidatedServicesCount: 0,
		servicesValidationDone: true,
		validationPackage: [],
		currentValidateServiceNr: 0,
		seaUseCodes: [],
		seaUseCodesMultiSelector: null,
		
		constructor: function(params) {
			this.utils = new utils();
			this.getSeaUseCodes();
		},
		postCreate: function() {
			/*on(this.addDataCategoryButton, "click", lang.hitch(this, function(){
				this.utils.show("addDataForCategoryForm", "block");
			}));*/
			
			/* WMS section buttons events */
			/*on(this.addWmsButton, "click", lang.hitch(this, function(){
				this.utils.show("addWmsButton", "none");
				this.utils.show("addWmsForm", "block");
			}));
			
			on(this.updateWmsButton, "click", lang.hitch(this, function(){
				this.utils.show("updateWmsButton", "none");
				this.utils.show("wmsDisplayForm", "none");
				this.utils.show("addWmsForm", "block");
				//this.wmsUpdate = true;
			}));
			
			on(this.wmsCancelButton, "click", lang.hitch(this, function(){
				this.hideAddWmsForm();
			}));*/
			
			/* Metadata section buttons events */
			/*on(this.addMetadataButton, "click", lang.hitch(this, function(){
				this.utils.show("addMetadataButton", "none");
				//this.hideDisplayMetadataForm();
				this.setupMetadataFormatSelector();
				this.utils.show("addMetadataForm", "block");
			}));*/
			
			/*on(this.metadataCancelButton, "click", lang.hitch(this, function(){
				this.hideAddMetadataForm();
			}));*/
		},
		destroy: function() {
			
		},
		
		getSeaUseCodes: function() {
			var serviceUrl = "sc/tools/get-data";
			var url = "https://maps.helcom.fi/arcgis/rest/services/Basemaps/MSPoutput/MapServer/7/query?where=1%3D1&outFields=Attribute_code_for_sea_use%2C+Basemaps&returnGeometry=false&f=json";
			var servicedata = {
				"url": url,
				"format": "json"
			};
			request.post(serviceUrl, this.utils.createPostRequestParams(servicedata)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log("Getting Sea Use Codes failed", response);
					}
					else if (response.type == "success") {
						if (response.item) {
							/*console.log(response.item.features);
							var codes = {
								identifier: "value",
								label: "label",
								items: []
							};*/
							array.forEach(response.item.features, lang.hitch(this, function(feature) {
								this.seaUseCodes.push({value: feature.attributes.Attribute_code_for_sea_use, label: feature.attributes.Attribute_code_for_sea_use + " (" + feature.attributes.Basemaps + ")"});
							}));
							/*console.log(codes);
							this.seaUseCodes = new ItemFileReadStore({
								data: codes
							});*/
						}
					}
				}),
				lang.hitch(this, function(error) {
					console.log(error);
					//domStyle.set(dojo.byId("loadingCover"), {"display": "none"});
				})
			);
		},
		
		cleanAdminForm: function() {
			
			this.cleanAddUserForm();
			this.cleanUpdateUserForm();
			this.cleanChangeUserPasswordForm();
			this.cleanAddCategoryUserForm();
			this.cleanCategoryUserSelector();
			this.cleanCategoryUsersDisplayForm();
			
			this.cleanRootCategoryAddForm();
			this.cleanSummaryForm();
			this.cleanValidateServicesForm();
			
			this.cleanCategoryLabel();
			//this.cleanHelcomCatalogueId();
			this.cleanDescription();
			this.cleanTags();
			this.cleanCategoryMetadataLink();
			
			this.cleanMetadataDisplayForm();
			this.cleanMetadataAddForm();
			
			this.cleanCategoryDisplayForm();
			this.cleanCategoryAddForm();
			
			this.cleanWmsDisplayForm();
			this.cleanWmsAddForm();
			this.cleanWmsInfoDisplayForm();
			
			this.cleanWfsDisplayForm();
			this.cleanWfsAddForm();
			this.cleanWfsInfoDisplayForm();
			
			this.cleanDownloadDisplayForm();
			this.cleanDownloadAddForm();
			
			this.cleanArcgisDisplayForm();
			this.cleanArcgisAddForm();
			
			this.utils.show("categoryUsersForm", "none");
			this.utils.show("categoryForm", "none");
			this.utils.changeText("adminFormsHeader", "");
			this.utils.changeText("adminFormMessage", "");
	    	this.utils.show("adminFormMessage", "none");
		},
		
		/* --- MANAGE USER BUTTONS START --- */
		cancelAddUserClick: function() {
			this.cleanAddUserForm();
		},
		
		cancelUpdateUserClick: function() {
			this.cleanUpdateUserForm();
		},
		
		cancelChangeUserPassword: function() {
			this.cleanChangeUserPasswordForm();
		},
		
		addCategoryUserClick: function() {
			this.utils.show("addCategoryUserForm", "block");
			this.utils.show("addCategoryUser", "none");
			//this.setupMetadataFormatSelector(this.addCategoryMetadataFormatSelect);
			
		},
		
		cancelAddCategoryUserClick: function() {
			this.cleanAddCategoryUserForm();
		},
		
		setupCategoryUserSelector: function(providers) {
			this.categoryUserSelector = new Select({
				options: providers
			});
			this.categoryUserSelector.placeAt(this.addCategoryUserSelect);
			this.categoryUserSelector.startup();
		},
		
		saveAddCategoryUserClick: function() {
			var url = "sc/users/add-right";
			var data = {
				"userId": this.categoryUserSelector.get("value"), 
				"categoryId": this.currentCategory.id, 
				"rights": ["w", "r"]
			};
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.showMessage("Failed to add user rights.");
					}
					else if (response.type == "success") {
						this.showMessage("User rights changed.");
						this.cleanAddCategoryUserForm();
						this.getProviders();
					}
				}),
				lang.hitch(this, function(error) {
					this.showMessage("Something went wrong (on users/add-right). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		getProviders: function() {
			var url = "sc/users/list/PROVIDER";
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.showMessage("Failed to retrieve category users.");
					}
					else if (response.type == "success") {
						this.cleanCategoryUsersDisplayForm();
						this.cleanCategoryUserSelector();
						this.getCategoryUsers(this.currentCategory.id, response.item);
						//this.formsObj.setupCategoryUsersForm(layer, this.currentHeader, response.item);
					}
				}),
				lang.hitch(this, function(error) {
					alert("Something went wrong (on users/list/{role}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		/* --- MANAGE USER BUTTONS END --- */
		
		
		/* --- MANAGE CATEGORY BUTTONS START --- */
		
		deleteObjectClick: function() {
			console.log(this.currentCategory);
			if (confirm("Please confirm removing: " + this.currentCategory.label + " with all content.") == true) {
				this.deleteObject(this.currentObjId);
		    }
		},
		
		// --- root category
		cancelRootCategoryClick: function() {
			this.cleanRootCategoryAddForm();
		},
		
		// --- summary form
		closeSummaryFormClick: function() {
			this.cleanSummaryForm();
		},
		
		// --- validate services
		closeValidateServicesFormClick: function() {
			this.cleanValidateServicesForm();
		},
				
		// --- category info
		editCategoryLabelClick: function() {
			this.utils.setInputValue("categoryLabelInput", this.utils.getTextValue("categoryLabel").trim());
			this.utils.show("categoryLabel", "none");
			this.utils.show("categoryLabelInput", "inline-block");
			this.utils.show("categoryLabelDescription", "block");
			this.utils.show("editCategoryLabel", "none");
			this.utils.show("cancelCategoryLabel", "inline-block");
			this.utils.show("saveCategoryLabel", "inline-block");
		},
		
		cancelCategoryLabelClick: function() {
			this.cleanCategoryLabel();
		},
		
		editDescriptionClick: function() {
			if (this.utils.getTextValue("descriptionLabel") === "Not assigned") {
				this.utils.setInputValue("descriptionArea", "");
			}
			else {
				this.utils.setInputValue("descriptionArea", this.utils.getTextValue("descriptionLabel").trim());
			}
			
			this.utils.show("descriptionLabel", "none");
			this.utils.show("descriptionArea", "inline-block");
			this.utils.show("descriptionDescription", "block");
			this.utils.show("editDescription", "none");
			this.utils.show("cancelDescription", "inline-block");
			this.utils.show("saveDescription", "inline-block");
		},
		
		cancelDescriptionClick: function() {
			this.cleanDescription();
		},
		
		editTagsClick: function() {
			var message = "";
			if (this.utils.getTextValue("tagsLabel") != "Not assigned") {
				message = this.utils.getTextValue("tagsLabel").trim();
			}
			
			this.utils.show("tagsLabel", "none");
			this.utils.show("tagsSelect", "inline-block");
			this.utils.show("tagsSelectMessage", "block");
			this.utils.show("descriptionTags", "block");
			this.utils.show("editTags", "none");
			this.utils.show("cancelTags", "inline-block");
			this.utils.show("saveTags", "inline-block");
			this.setupSeaUseCodesMultiselect(this.tagsSelect, this.tagsSelectMessage, message);
		},
		
		cancelTagsClick: function() {
			this.cleanTags();
		},
		
		/*editHelcomCatalogueIdClick: function() {
			if (this.utils.getTextValue("helcomCatalogueId") === "Not assigned") {
				this.utils.setInputValue("helcomCatalogueIdInput", "");
			}
			else {
				this.utils.setInputValue("helcomCatalogueIdInput", this.utils.getTextValue("helcomCatalogueId").trim());
			}
			
			this.utils.show("helcomCatalogueId", "none");
			this.utils.show("helcomCatalogueIdInput", "inline-block");
			this.utils.show("helcomCatalogueIdDescription", "block");
			this.utils.show("editHelcomCatalogueId", "none");
			this.utils.show("cancelHelcomCatalogueId", "inline-block");
			this.utils.show("saveHelcomCatalogueId", "inline-block");
		},
		
		cancelHelcomCatalogueIdClick: function() {
			this.cleanHelcomCatalogueId();
		},*/
		
		editCategoryMetadataLinkClick: function() {
			if (this.utils.getTextValue("categoryMetadataLink") === "Not assigned") {
				this.utils.setInputValue("categoryMetadataLinkInput", "");
			}
			else {
				this.utils.setInputValue("categoryMetadataLinkInput", this.utils.getTextValue("categoryMetadataLink").trim());
			}
			
			this.utils.show("categoryMetadataLink", "none");
			this.utils.show("categoryMetadataLinkInput", "inline-block");
			this.utils.show("categoryMetadataLinkDescription", "block");
			this.utils.show("editCategoryMetadataLink", "none");
			this.utils.show("cancelCategoryMetadataLink", "inline-block");
			this.utils.show("saveCategoryMetadataLink", "inline-block");
		},
		
		cancelCategoryMetadataLinkClick: function() {
			this.cleanCategoryMetadataLink();
		},
		
		// --- category metadata
		addMetadataClick: function() {
			this.utils.show("addMetadataForm", "block");
			this.utils.show("addMetadata", "none");
			this.setupMetadataFormatSelector(this.metadataFormatSelect);
		},
		
		cancelMetadataClick: function() {
			this.cleanMetadataAddForm();
		},
		
		// ---category categories
		addCategoryClick: function() {
			this.utils.show("addCategoryForm", "block");
			this.utils.show("addCategory", "none");
			this.setupMetadataFormatSelector(this.addCategoryMetadataFormatSelect);
		},
		
		cancelCategoryClick: function() {
			this.cleanCategoryAddForm();
		},
		
		// --- category wms
		addWmsClick: function() {
			this.utils.show("addWmsForm", "block");
			this.utils.show("addWms", "none");
			this.setupSeaUseCodesMultiselect(this.addWmsSeaUseCodesSelect, this.addWmsSeaUseCodesSelectedMessage, "");
		},
		
		cancelWmsClick: function() {
			this.cleanWmsAddForm();
		},
		
		validateWmsClick: function() {
			this.cleanWmsNameAndLabelForms();
			var wmsUrl = this.utils.getInputValue("wmsUrlInput").trim();
			if (validate.isUrl(wmsUrl)) {
				this.validateWms(wmsUrl);
			}
			else {
				this.showMessage("Wms url is not valid.");
			}
		},
		
		// --- category wfs
		addWfsClick: function() {
			this.utils.show("addWfsForm", "block");
			this.utils.show("addWfs", "none");
			this.setupSeaUseCodesMultiselect(this.addWfsSeaUseCodesSelect, this.addWfsSeaUseCodesSelectedMessage, "");
		},
		
		cancelWfsClick: function() {
			this.cleanWfsAddForm();
		},
		
		validateWfsClick: function() {
			this.cleanWfsNameAndLabelForms();
			var wfsUrl = this.utils.getInputValue("wfsUrlInput").trim();
			if (validate.isUrl(wfsUrl)) {
				this.validateWfs(wfsUrl);
			}
			else {
				this.showMessage("Wfs url is not valid.");
			}
		},
		
		// --- category download
		addDownloadClick: function() {
			this.utils.show("addDownloadForm", "block");
			this.utils.show("addDownload", "none");
			this.setupSeaUseCodesMultiselect(this.addDownloadSeaUseCodesSelect, this.addDownloadSeaUseCodesSelectedMessage, "");
		},
		
		cancelDownloadClick: function() {
			this.cleanDownloadAddForm();
		},
		
		validateDownloadClick: function() {
			this.cleanDownloadNameAndLabelForms();
			var downloadUrl = this.utils.getInputValue("downloadUrlInput").trim();
			/*if (validate.isUrl(downloadUrl)) {
				this.validateDownload(downloadUrl);
			}
			else {
				this.showMessage("Downloadable resource url is not valid.");
			}*/
			this.validateDownload(downloadUrl);
		},
		
		// --- category arcgis
		addArcgisClick: function() {
			this.utils.show("addArcgisForm", "block");
			this.utils.show("addArcgis", "none");
			this.setupSeaUseCodesMultiselect(this.addArcgisSeaUseCodesSelect, this.addArcgisSeaUseCodesSelectedMessage, "");
		},
		
		cancelArcgisClick: function() {
			this.cleanArcgisAddForm();
		},
		
		validateArcgisClick: function() {
			this.cleanArcgisNameAndLabelForms();
			var arcgisUrl = this.utils.getInputValue("arcgisUrlInput").trim();
			if (validate.isUrl(arcgisUrl)) {
				this.checkArcgisLayerUrl(arcgisUrl);
			}
			else {
				this.showMessage("Url is not valid.");
			}
		},
		checkArcgisLayerUrl: function(url) {
			var last = url.slice(-1);
			if (last == "/") {
				url = url.substring(0, url.length - 1);
				this.utils.setInputValue("arcgisUrlInput", url);
			}
			var elems = url.split("/");
			if ((elems.slice(-2)[0].toLowerCase() == "mapserver") && (Number.isInteger(Number(elems.slice(-2)[1])))) {
				this.validateArcgis(url);				
			}
			else {
				this.showMessage("Url is not valid. Url should end with 'MapServer/{number}'");
			}
		},
		/* --- MANAGE CATEGORY BUTTONS END --- */
		
		/* --- MANAGE VALIDATION CLEAN START--- */
		cleanMspOutputForm: function() {
			this.cleanValidationForm();
			this.cleanUploadForm();
			this.cleanDeleteForm();
			this.utils.show("mspOutputForm", "none");
			this.utils.changeText("validationCloseButton", "Close");
		},
		
		cleanValidationForm: function() {
			/*if (document.getElementById("mspFileInput")) {
				document.getElementById("mspFileInput").value = "";
			}*/
			this.utils.show("checkZipGroup", "none");
			this.utils.setTextValue("checkZipMessage", "");
			this.utils.show("checkExtGroup", "none");
			this.utils.setTextValue("checkExtMessage", "");
			this.utils.show("uploadGroup", "none");
			this.utils.setTextValue("shpUploadMessage", "");
			this.utils.show("wfsUrlGroup", "none");
			this.utils.setTextValue("wfsUrlMessage", ""); 
			this.utils.show("validationForm", "none");
			this.utils.show("errorReportSection", "none");
			domConstruct.empty(this.errorsSection);
			this.utils.show("uploadMessage", "none");
			this.utils.show("uploadValidDataButton", "none");
		},
		cleanUploadForm: function() {
			this.utils.setTextValue("backupDataMessage", "");
			this.utils.show("uploadDataGroup", "none");
			this.utils.setTextValue("uploadDataMessage", "");
			this.utils.show("uploadForm", "none");
			this.utils.show("uploadReportSection", "none");
			domConstruct.empty(this.uploadSection);
		},
		cleanDeleteForm: function() {
			this.utils.setTextValue("deleteDataMessage", "");
			this.utils.show("deleteDataForm", "none");
			this.utils.show("deleteReportSection", "none");
			domConstruct.empty(this.deleteSection);
		},
		/* --- MANAGE VALIDATION CLEAN END--- */
		
		/* --- MANAGE USER CLEAN START--- */
		cleanAddUserForm: function() {
			document.getElementById("updateUserCountryInput").disabled = false;
			this.utils.clearInput("addUserNameInput");
			this.utils.clearInput("addUserEmailInput");
			this.utils.clearInput("addUserPasswordInput");
			this.utils.clearInput("addUserPasswordRepeatInput");
			this.utils.clearInput("addUserPhoneInput");
			this.utils.clearInput("addUserOrganizationInput");
			this.utils.clearInput("addUserPositionInput");
			this.utils.clearInput("addUserCountryInput");
			this.utils.show("addUserForm", "none");
		},
		
		cleanUpdateUserForm: function() {
			document.getElementById("updateUserCountryInput").disabled = false;
			this.utils.clearInput("updateUserNameInput");
			this.utils.clearInput("updateUserEmailInput");
			this.utils.clearInput("updateUserPhoneInput");
			this.utils.clearInput("updateUserOrganizationInput");
			this.utils.clearInput("updateUserPositionInput");
			this.utils.clearInput("updateUserCountryInput");
			this.utils.show("updateUserForm", "none");
		},
		
		cleanChangeUserPasswordForm: function() {
			this.utils.clearInput("changeUserPasswordInput");
			this.utils.clearInput("changeUserPasswordRepeatInput");
			this.utils.show("changeUserPasswordForm", "none");
		},
		
		cleanAddCategoryUserForm: function() {			
			this.utils.show("addCategoryUserForm", "none");
			this.utils.show("addCategoryUser", "inline-block");
		},
		
		cleanCategoryUsersDisplayForm() {
			domConstruct.empty(this.categoryUserListForm);
		},
		
		cleanCategoryUserSelector: function() {
			if (this.categoryUserSelector != null) {
				this.categoryUserSelector.destroy();
				this.categoryUserSelector = null;
			}
		},
		/* --- MANAGE USER CLEAN END--- */
						
		/* --- MANAGE CATEGORY CLEAN START--- */
		// --- root category
		cleanRootCategoryAddForm: function() {
			this.cleanMetadataFormatSelector();
			this.utils.clearInput("addRootCategoryLabelInput");
			this.utils.clearInput("addRootCategoryDescriptionArea");
			this.utils.clearInput("addRootCategoryMetadataUrlInput");
			this.utils.show("addRootCategoryForm", "none");
		},
		
		// --- summary form
		cleanSummaryForm: function() {
			domConstruct.empty(this.summaryReport);
			this.utils.show("summaryForm", "none");
		},
		
		// --- validate services form
		cleanValidateServicesForm: function() {
			this.utils.show("validateServicesForm", "none");
			if (this.servicesValidationDone) {
				domConstruct.empty(this.validationReport);				
				this.wmsCount = 0;
				this.wmsValidCount = 0;
				this.wmsNotValidCount = 0;
				this.wfsCount = 0;
				this.wfsValidCount = 0;
				this.wfsNotValidCount = 0;
				this.agsCount = 0;
				this.agsValidCount = 0;
				this.agsNotValidCount = 0;
				this.dnlCount = 0;
				this.dnlValidCount = 0;
				this.dnlNotValidCount = 0;
				this.totalServicesCount = 0;
				this.totalValidatedServicesCount = 0;
				this.validationPackage = [];
				this.currentValidateServiceNr = 0;
			}
		},
		
		// --- category info		
		cleanCategoryLabel: function() {
			this.utils.show("categoryLabel", "inline-block");
			this.utils.show("categoryLabelInput", "none");
			this.utils.show("categoryLabelDescription", "none");
			this.utils.show("editCategoryLabel", "inline-block");
			this.utils.show("cancelCategoryLabel", "none");
			this.utils.show("saveCategoryLabel", "none");
		},
		
		cleanDescription: function() {
			this.utils.show("descriptionLabel", "inline-block");
			this.utils.show("descriptionArea", "none");
			this.utils.show("descriptionDescription", "none");
			this.utils.show("editDescription", "inline-block");
			this.utils.show("cancelDescription", "none");
			this.utils.show("saveDescription", "none");
		},
		
		cleanTags: function() {
			this.utils.show("tagsLabel", "inline-block");
			this.utils.show("tagsSelect", "none");
			this.utils.show("tagsSelectMessage", "none");
			this.utils.show("descriptionTags", "none");
			this.utils.show("editTags", "inline-block");
			this.utils.show("cancelTags", "none");
			this.utils.show("saveTags", "none");
		},
		
		/*cleanHelcomCatalogueId: function() {
			this.utils.show("helcomCatalogueId", "inline-block");
			this.utils.show("helcomCatalogueIdInput", "none");
			this.utils.show("helcomCatalogueIdDescription", "none");
			this.utils.show("editHelcomCatalogueId", "inline-block");
			this.utils.show("cancelHelcomCatalogueId", "none");
			this.utils.show("saveHelcomCatalogueId", "none");
		},*/
		
		cleanCategoryMetadataLink: function() {
			this.utils.show("categoryMetadataLink", "inline-block");
			this.utils.show("categoryMetadataLinkInput", "none");
			this.utils.show("categoryMetadataLinkDescription", "none");
			this.utils.show("editCategoryMetadataLink", "inline-block");
			this.utils.show("cancelCategoryMetadataLink", "none");
			this.utils.show("saveCategoryMetadataLink", "none");
		},
		
		// --- category metadata
		cleanMetadataDisplayForm: function() {
			domConstruct.empty(this.metadataDisplayForm);
		},
		
		cleanMetadataAddForm: function() {
			this.cleanMetadataFormatSelector();
			this.utils.clearInput("metadataUrlInput");
			this.utils.show("addMetadataForm", "none");
			this.utils.show("addMetadata", "inline-block");
		},
		
		// --- category Categories
		cleanCategoryDisplayForm: function() {
			domConstruct.empty(this.categoryDisplayForm);
		},
		
		cleanCategoryAddForm: function() {
			this.cleanMetadataFormatSelector();
			this.utils.clearInput("addCategoryLabelInput");
			this.utils.clearInput("addCategoryDescriptionArea");
			this.utils.clearInput("addCategoryMetadataUrlInput");
			this.utils.show("addCategoryForm", "none");
			this.utils.show("addCategory", "inline-block");
		},
		
		// --- category wms
		cleanWmsDisplayForm: function() {
			domConstruct.empty(this.wmsDisplayForm);
		},
		
		cleanWmsAddForm: function() {
			this.cleanWmsNameAndLabelForms();
			this.utils.clearInput("wmsUrlInput");
			this.utils.show("addWmsForm", "none");
			this.utils.show("addWms", "inline-block");
			this.utils.show("saveWms", "none");
		},
		
		cleanWmsInfoDisplayForm: function() {
			domConstruct.empty(this.wmsDisplayInfoForm);
		},
		
		// --- category wfs
		cleanWfsDisplayForm: function() {
			domConstruct.empty(this.wfsDisplayForm);
		},
		
		cleanWfsAddForm: function() {
			this.cleanWfsNameAndLabelForms();
			this.utils.clearInput("wfsUrlInput");
			this.utils.show("addWfsForm", "none");
			this.utils.show("addWfs", "inline-block");
			this.utils.show("saveWfs", "none");
		},
		
		cleanWfsInfoDisplayForm: function() {
			domConstruct.empty(this.wfsDisplayInfoForm);
		},
		
		// --- category download
		cleanDownloadDisplayForm: function() {
			domConstruct.empty(this.downloadDisplayForm);
		},
		
		cleanDownloadAddForm: function() {
			this.cleanDownloadNameAndLabelForms();
			this.utils.clearInput("downloadUrlInput");
			this.utils.show("addDownloadForm", "none");
			this.utils.show("addDownload", "inline-block");
			this.utils.show("saveDownload", "none");
		},
		
		// --- category arcgis
		cleanArcgisDisplayForm: function() {
			domConstruct.empty(this.arcgisDisplayForm);
		},
		
		cleanArcgisAddForm: function() {
			this.cleanArcgisNameAndLabelForms();
			this.utils.clearInput("arcgisUrlInput");
			this.utils.show("addArcgisForm", "none");
			this.utils.show("addArcgis", "inline-block");
			this.utils.show("saveArcgis", "none");
		},
		
		/* --- MANAGE CATEGORY CLEAN END--- */
		
		
		
		/* --- MANAGE CATEGORY UTILS START--- */
		
		// --- category metadata
		displayMetadata: function(metadata) {
			array.forEach(metadata, lang.hitch(this, function(record) {
				var container = domConstruct.create("div", {"class": "formSubSectionGroup"}, this.metadataDisplayForm, "last");
				var content = domConstruct.create("div", {"style": "display: inline-block; width: 90%"}, container, "last");
				var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 10%"}, container, "last");
				
				var provider = domConstruct.create("div", null, content, "last");
				var providerLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Metadata source: " }, provider, "last");
				var providerValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": record.source }, provider, "last");
				
				var format = domConstruct.create("div", null, content, "last");
				var formatLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Metadata format: " }, format, "last");
				var formatValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": record.format }, format, "last");
				
				var url = domConstruct.create("div", null, content, "last");
				var urlLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "URL: " }, url, "last");
				var urlValue = domConstruct.create("a", { "class": "textLabel", "href": record.url, "target": "_blank", "innerHTML": record.url }, url, "last");
				
				if (this.editMode) {
					var button = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Delete"}, buttonContainer, "last");
					on(button, "click", lang.hitch(this, function() {
						
					    if (confirm("Please confirm removing metadata") == true) {
					    	var index = this.currentCategory.metaData.findIndex(x => x.id == record.id);
							if (index > -1) {
								this.currentCategory.metaData.splice(index, 1);
								this.deleteMetadata();
							}
					    }
					}));
				}
			}));
		},
		
		deleteMetadata: function() {
			var url = "sc/categories/update";
			request.post(url, this.utils.createPostRequestParams(this.currentCategory)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.showMessage("Failed to delete metadata.");
					}
					else if (response.type == "success") {
						this.showMessage("Metadata deleted.");
						this.cleanMetadataDisplayForm();
						if ((this.currentCategory.metaData) && (this.currentCategory.metaData.length > 0)) {
							this.displayMetadata(this.currentCategory.metaData);
						}
						else {
							var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No metadata assigned"}, this.metadataDisplayForm, "last");
						}
					}
				}),
				lang.hitch(this, function(error) {
					this.formsObj.showMessage("Something went wrong (on categories/update). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		setupMetadataFormatSelector: function(node) {
			var metadataFormats = [
				{label: "HTML", value: "HTML"},
				{label: "XML", value: "XML"},
				{label: "Plain text", value: "PLAIN"}
			];
			this.metadataFormatSelector = new Select({
				options: metadataFormats
			});
			this.metadataFormatSelector.placeAt(node);
			this.metadataFormatSelector.startup();
		},
		
		setupSeaUseCodesMultiselect: function(selectNode, messageNode, message) {
			if (this.seaUseCodesMultiSelector != null) {
				this.seaUseCodesMultiSelector.destroy();
				this.seaUseCodesMultiSelector = null;
			}
			messageNode.innerHTML = "Selected: " + message;
			var sel = win.doc.createElement("select");
			array.forEach(this.seaUseCodes, lang.hitch(this, function(code) {
				var c = win.doc.createElement("option");
				c.innerHTML = code.label;
        		c.value = code.value;
        		sel.appendChild(c);
			}));
    		this.seaUseCodesMultiSelector = new MultiSelect({
				style: "height: 200px; border: 1px solid #800000; border-radius: 4px;",
				onChange: lang.hitch(this, function() {
					let vals = this.seaUseCodesMultiSelector.get("value").join("; ");
					messageNode.innerHTML = "Selected: " + vals;
					console.log();
				})
			}, sel);
			this.seaUseCodesMultiSelector.placeAt(selectNode);
			this.seaUseCodesMultiSelector.set("value", message.split("; "));    
		},
		
		cleanMetadataFormatSelector: function() {
			if (this.metadataFormatSelector != null) {
				this.metadataFormatSelector.destroy();
				this.metadataFormatSelector = null;
			}
		},
		
		// --- category categories
		//displayCategories: function(categories) {
		displayCategories: function() {
			if (this.currentCategoryCategories.length > 0) {
				array.forEach(this.currentCategoryCategories, lang.hitch(this, function(category) {
					var container = domConstruct.create("div", {"class": "formSubSectionGroup"}, this.categoryDisplayForm, "last");
					var content = domConstruct.create("div", {"style": "display: inline-block; width: 90%"}, container, "last");
					var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 10%"}, container, "last");
					
					var label = domConstruct.create("div", null, content, "last");
					var labelLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Label: " }, label, "last");
					var labelValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": category.label }, label, "last");
					
					var description = domConstruct.create("div", null, content, "last");
					var descriptionLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Description: " }, description, "last");
					var descriptionValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": category.description }, description, "last");
					
					if (this.editMode) {
						var editButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Edit"}, buttonContainer, "last");
						on(editButton, "click", lang.hitch(this, function() {
							this.setupManageEditForm(category);
						}));
						
						var deleteButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Delete"}, buttonContainer, "last");
						on(deleteButton, "click", lang.hitch(this, function() {
							
						    if (confirm("Please confirm removing category " + category.label + " with all content") == true) {
						    	this.deleteCategory(category.id);
						    }
						}));
					}
				}));
			}
			else {
				var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No sub-categories in this category"}, this.categoryDisplayForm, "last");
			}
		},
		
		deleteCategory: function(id) {
			var url = "sc/categories/delete/" + id;
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("Failed to delete category.");
					}
					else if (response.type == "success") {
						this.showMessage("Category deleted.");
						var index = this.currentCategoryCategories.findIndex(x => x.id == id);
						if (index > -1) {
							this.currentCategoryCategories.splice(index, 1);
							this.cleanCategoryDisplayForm();
							this.displayCategories();
						}
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on categories/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		// --- category wms
		validateWms: function(wmsUrl) {
			var url = "sc/wms/verify";
			var data = {
				"url": wmsUrl
			};
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					this.utils.show("saveWms", "inline");
					if (response.type == "error") {
						this.wmsValidationPassed = false;
						this.showMessage("WMS did not pass validation.");
						this.utils.show("wmsLayerNameInputGroup", "block");
					}
					else if (response.type == "success") {
						this.wmsValidationPassed = true;
						this.showMessage("WMS is valid.");
						this.utils.show("wmsLayerNameSelectGroup", "block");
						
						//this.utils.setInputValue("wmsLabelInput", response.item.organization);
						
						var layerNames = [];
						array.forEach(response.item.names, lang.hitch(this, function(name){
							layerNames.push({label: name, value: name});
						}));
						this.setupWmsNameSelector(layerNames);
						
					}
					//this.utils.show("wmsLabelForm", "block");
					//this.action = null;
				}),
				lang.hitch(this, function(error){
					this.action = null;
					this.showMessage("Something went wrong (on wms/verify). Please contact administrator.");
				})
			);
		},
		
		setupWmsNameSelector: function(names) {
			this.wmsNameSelector = new Select({
				options: names
			});
			this.wmsNameSelector.placeAt(this.wmsNameSelect);
			this.wmsNameSelector.startup();
		},
		
		cleanWmsNameAndLabelForms: function() {
			if (this.wmsNameSelector != null) {
				this.wmsNameSelector.destroy();
				this.wmsNameSelector = null;
			}
			this.utils.show("wmsLayerNameSelectGroup", "none");
			this.utils.clearInput("wmsNameInput");
			this.utils.show("wmsLayerNameInputGroup", "none");
			this.utils.clearInput("wmsLabelInput");
			this.utils.clearInput("wmsDescriptionArea");
			this.wmsValidationPassed = false;
		},
				
		displayWmses: function() {
			if (this.currentCategoryWmses.length > 0) {
				
				array.forEach(this.currentCategoryWmses, lang.hitch(this, function(wms) {
					
					var container = domConstruct.create("div", {"class": "formSubSectionGroup"}, this.wmsDisplayForm, "last");
					var content = domConstruct.create("div", {"style": "display: inline-block; width: 90%"}, container, "last");
					var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 10%"}, container, "last");
					
					var label = domConstruct.create("div", null, content, "last");
					var labelLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Label: " }, label, "last");
					var labelValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": wms.label }, label, "last");
					
					var name = domConstruct.create("div", null, content, "last");
					var nameLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "WMS layer name: " }, name, "last");
					var nameValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": wms.wms.name }, name, "last");
					
					var url = domConstruct.create("div", null, content, "last");
					var urlLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "WMS URL: " }, url, "last");
					var urlValue = domConstruct.create("a", { "class": "textLabel", "href": wms.wms.url, "target": "_blank", "innerHTML": wms.wms.url }, url, "last");
					
					var validationMessage = domConstruct.create("div", {"style": "text-align:right;"}, content, "last");
									
					if (this.editMode) {
						var validateButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Validate"}, buttonContainer, "last");
						on(validateButton, "click", lang.hitch(this, function() {
							this.validateExistingWms(wms.wms, validationMessage);
						}));
						var editButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "View or edit"}, buttonContainer, "last");
						on(editButton, "click", lang.hitch(this, function() {
							this.setupManageEditForm(wms);
						}));
						
						var deleteButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Delete"}, buttonContainer, "last");
						on(deleteButton, "click", lang.hitch(this, function() {
							if (confirm("Please confirm removing WMS: " + wms.label) == true) {
						    	this.deleteWms(wms.id);
						    }
						}));
					}
				}));
			}
			else {
				var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No WMSes in this category"}, this.wmsDisplayForm, "last");
			}
		},
		
		deleteWms: function(id) {
			var url = "sc/categories/delete/" + id;
			//this.getTreePath(this.store.get(this.currentObjId).parent);
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("Failed to delete WMS.");
					}
					else if (response.type == "success") {
						this.showMessage("WMS deleted.");
						var index = this.currentCategoryWmses.findIndex(x => x.id == id);
						if (index > -1) {
							this.currentCategoryWmses.splice(index, 1);
							this.cleanWmsDisplayForm();
							this.displayWmses(this.currentCategoryWmses);
						}
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on categories/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		validateExistingWms: function(wms, div) {
			var url = "sc/wms/verify";
			var data = {
				"url": wms.url
			};
			request.post(url, this.utils.createPostWithTimeoutRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						div.style.color = "red";
						div.innerHTML = "WMS did not pass validation. Possible reasons: URL is not valid or XML structure of the WMS is not valid.";
					}
					else if (response.type == "success") {
						if (response.item.names.includes(wms.name)) {
							div.style.color = "green";
							div.innerHTML = "WMS is valid.";
						}
						else {
							div.style.color = "red";
							div.innerHTML = "WMS did not pass validation. " + wms.name + " is not available in the service.";
						}
						
					}
				}),
				lang.hitch(this, function(error){
					if (error.message == "Timeout exceeded") {
						div.style.color = "red";
						div.innerHTML = "WMS did not pass validation. Service didn't respond after 1 minute.";
					}
					else {
						div.style.color = "red";
						div.innerHTML = "Validation did not work. Please report to data@helcom.fi.";
					}
				})
			);
		},
		
		// --- category wfs
		validateWfs: function(wfsUrl) {
			var url = "sc/wfs/verify";
			var data = {
				"url": wfsUrl
			};
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					this.utils.show("saveWfs", "inline");
					if (response.type == "error") {
						this.wfsValidationPassed = false;
						this.showMessage("WFS did not pass validation.");
						this.utils.show("wfsLayerNameInputGroup", "block");
					}
					else if (response.type == "success") {
						this.wfsValidationPassed = true;
						this.showMessage("WFS is valid.");
						this.utils.show("wfsLayerNameSelectGroup", "block");
						
						//this.utils.setInputValue("wmsLabelInput", response.item.organization);
						
						var layerNames = [];
						array.forEach(response.item.names, lang.hitch(this, function(name){
							layerNames.push({label: name, value: name});
						}));
						this.setupWfsNameSelector(layerNames);
						
					}
					//this.utils.show("wmsLabelForm", "block");
					//this.action = null;
				}),
				lang.hitch(this, function(error){
					this.action = null;
					this.showMessage("Something went wrong (on wfs/verify). Please contact administrator.");
				})
			);
		},
		
		setupWfsNameSelector: function(names) {
			this.wfsNameSelector = new Select({
				options: names
			});
			this.wfsNameSelector.placeAt(this.wfsNameSelect);
			this.wfsNameSelector.startup();
		},
		
		cleanWfsNameAndLabelForms: function() {
			if (this.wfsNameSelector != null) {
				this.wfsNameSelector.destroy();
				this.wfsNameSelector = null;
			}
			this.utils.show("wfsLayerNameSelectGroup", "none");
			this.utils.clearInput("wfsNameInput");
			this.utils.show("wfsLayerNameInputGroup", "none");
			this.utils.clearInput("wfsLabelInput");
			this.utils.clearInput("wfsDescriptionArea");
			this.wfsValidationPassed = false;
		},
				
		displayWfses: function() {
			if (this.currentCategoryWfses.length > 0) {
				
				array.forEach(this.currentCategoryWfses, lang.hitch(this, function(wfs) {
					
					var container = domConstruct.create("div", {"class": "formSubSectionGroup"}, this.wfsDisplayForm, "last");
					var content = domConstruct.create("div", {"style": "display: inline-block; width: 90%"}, container, "last");
					var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 10%"}, container, "last");
					
					var label = domConstruct.create("div", null, content, "last");
					var labelLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Label: " }, label, "last");
					var labelValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": wfs.label }, label, "last");
					
					var name = domConstruct.create("div", null, content, "last");
					var nameLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "WFS feature type name: " }, name, "last");
					var nameValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": wfs.wfs.name }, name, "last");
					
					var url = domConstruct.create("div", null, content, "last");
					var urlLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "WFS URL: " }, url, "last");
					var urlValue = domConstruct.create("a", { "class": "textLabel", "href": wfs.wfs.url, "target": "_blank", "innerHTML": wfs.wfs.url }, url, "last");
					
					var validationMessage = domConstruct.create("div", {"style": "text-align:right;"}, content, "last");
					
					if (this.editMode) {
						var validateButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Validate"}, buttonContainer, "last");
						on(validateButton, "click", lang.hitch(this, function() {
							this.validateExistingWfs(wfs.wfs, validationMessage);
						}));
						
						var editButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "View or edit"}, buttonContainer, "last");
						on(editButton, "click", lang.hitch(this, function() {
							this.setupManageEditForm(wfs);
						}));
						
						var deleteButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Delete"}, buttonContainer, "last");
						on(deleteButton, "click", lang.hitch(this, function() {
							if (confirm("Please confirm removing WFS: " + wfs.label) == true) {
						    	this.deleteWfs(wfs.id);
						    }
						}));
					}
				}));
			}
			else {
				var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No WFSes in this category"}, this.wfsDisplayForm, "last");
			}
		},
		
		deleteWfs: function(id) {
			var url = "sc/categories/delete/" + id;
			//this.getTreePath(this.store.get(this.currentObjId).parent);
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("Failed to delete WFS.");
					}
					else if (response.type == "success") {
						this.showMessage("WFS deleted.");
						var index = this.currentCategoryWfses.findIndex(x => x.id == id);
						if (index > -1) {
							this.currentCategoryWfses.splice(index, 1);
							this.cleanWfsDisplayForm();
							this.displayWfses(this.currentCategoryWfses);
						}
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on categories/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		validateExistingWfs: function(wfs, div) {
			var url = "sc/wfs/verify";
			var data = {
				"url": wfs.url
			};
			request.post(url, this.utils.createPostWithTimeoutRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						div.style.color = "red";
						div.innerHTML = "WFS did not pass validation. Possible reasons: URL is not valid or XML structure of the WFS is not valid.";
					}
					else if (response.type == "success") {
						if (response.item.names.includes(wfs.name)) {
							div.style.color = "green";
							div.innerHTML = "WFS is valid.";
						}
						else {
							div.style.color = "red";
							div.innerHTML = "WFS did not pass validation. " + wfs.name + " is not available in the service.";
						}
						
					}
				}),
				lang.hitch(this, function(error){
					if (error.message == "Timeout exceeded") {
						div.style.color = "red";
						div.innerHTML = "WFS did not pass validation. Service didn't respond after 1 minute.";
					}
					else {
						div.style.color = "red";
						div.innerHTML = "Validation did not work. Please report to data@helcom.fi.";
					}
				})
			);
		},
		
		// --- category download
		validateDownload: function(downloadUrl) {
			var url = "sc/dls/verify";
			var data = {
				"url": downloadUrl
			};
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.downloadValidationPassed = false;
						this.showMessage("URL is not valid.");
					}
					else if (response.type == "success") {
						this.downloadValidationPassed = true;
						this.showMessage("URL is valid.");
						this.utils.show("saveDownload", "inline");
					}
				}),
				lang.hitch(this, function(error){
					this.action = null;
					this.showMessage("Something went wrong (on dls/verify). Please contact administrator.");
				})
			);
		},
				
		cleanDownloadNameAndLabelForms: function() {
			this.utils.clearInput("downloadLabelInput");
			this.utils.clearInput("downloadDescriptionArea");
			this.downloadValidationPassed = false;
		},
				
		displayDownloads: function() {
			if (this.currentCategoryDownloads.length > 0) {
				
				array.forEach(this.currentCategoryDownloads, lang.hitch(this, function(download) {
					
					var container = domConstruct.create("div", {"class": "formSubSectionGroup"}, this.downloadDisplayForm, "last");
					var content = domConstruct.create("div", {"style": "display: inline-block; width: 90%"}, container, "last");
					var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 10%"}, container, "last");
					
					var label = domConstruct.create("div", null, content, "last");
					var labelLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Label: " }, label, "last");
					var labelValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": download.label }, label, "last");
					
					var url = domConstruct.create("div", null, content, "last");
					var urlLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "URL: " }, url, "last");
					var urlValue = domConstruct.create("a", { "class": "textLabel", "href": download.download.url, "target": "_blank", "innerHTML": download.download.url }, url, "last");
					
					var validationMessage = domConstruct.create("div", {"style": "text-align:right;"}, content, "last");
					
					if (this.editMode) {
						var validateButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Validate"}, buttonContainer, "last");
						on(validateButton, "click", lang.hitch(this, function() {
							this.validateExistingDownload(download.download, validationMessage);
						}));
						
						var editButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "View or Edit"}, buttonContainer, "last");
						on(editButton, "click", lang.hitch(this, function() {
							this.setupManageEditForm(download);
						}));
						
						var deleteButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Delete"}, buttonContainer, "last");
						on(deleteButton, "click", lang.hitch(this, function() {
							if (confirm("Please confirm removing resource: " + download.label) == true) {
						    	this.deleteDownload(download.id);
						    }
						}));
					}
				}));
			}
			else {
				var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No Downloadable resources in this category"}, this.downloadDisplayForm, "last");
			}
		},
		
		deleteDownload: function(id) {
			var url = "sc/categories/delete/" + id;
			//this.getTreePath(this.store.get(this.currentObjId).parent);
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("Failed to delete Downloadable resource.");
					}
					else if (response.type == "success") {
						this.showMessage("Downloadable resource deleted.");
						var index = this.currentCategoryDownloads.findIndex(x => x.id == id);
						if (index > -1) {
							this.currentCategoryDownloads.splice(index, 1);
							this.cleanDownloadDisplayForm();
							this.displayDownloads(this.currentCategoryDownloads);
						}
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on categories/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		validateExistingDownload: function(download, div) {
			var url = "sc/dls/verify";
			var data = {
				"url": download.url
			};
			request.post(url, this.utils.createPostWithTimeoutRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						div.style.color = "red";
						div.innerHTML = "Download resource did not pass validation. Possible reason: URL is not valid.";
					}
					else if (response.type == "success") {
						div.style.color = "green";
						div.innerHTML = "Download resource is valid.";
					}
				}),
				lang.hitch(this, function(error){
					if (error.message == "Timeout exceeded") {
						div.style.color = "red";
						div.innerHTML = "Download resource did not pass validation. Service didn't respond after 1 minute.";
					}
					else {
						div.style.color = "red";
						div.innerHTML = "Validation did not work. Please report to data@helcom.fi.";
					}
				})
			);
		},
		
		// --- category arcgis
		validateArcgis: function(arcgisUrl) {
			var url = "sc/ags/verify";
			var data = {
				"url": arcgisUrl
			};
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.arcgisValidationPassed = false;
						this.showMessage("URL did not pass validation.");
					}
					else if (response.type == "success") {
						this.arcgisValidationPassed = true;
						this.showMessage("URL is valid.");
						this.utils.show("saveArcgis", "inline");
					}
				}),
				lang.hitch(this, function(error){
					this.action = null;
					this.showMessage("Something went wrong (on ags/verify). Please contact administrator.");
				})
			);
		},
				
		cleanArcgisNameAndLabelForms: function() {
			this.utils.clearInput("arcgisLabelInput");
			this.utils.clearInput("arcgisDescriptionArea");
			this.arcgisValidationPassed = false;
		},
		
		displayArcgises: function() {
			if (this.currentCategoryArcgises.length > 0) {
				
				array.forEach(this.currentCategoryArcgises, lang.hitch(this, function(arcgis) {
					
					var container = domConstruct.create("div", {"class": "formSubSectionGroup"}, this.arcgisDisplayForm, "last");
					var content = domConstruct.create("div", {"style": "display: inline-block; width: 90%"}, container, "last");
					var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 10%"}, container, "last");
					
					var label = domConstruct.create("div", null, content, "last");
					var labelLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Label: " }, label, "last");
					var labelValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": arcgis.label }, label, "last");
					
					var url = domConstruct.create("div", null, content, "last");
					var urlLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "URL: " }, url, "last");
					var urlValue = domConstruct.create("a", { "class": "textLabel", "href": arcgis.arcgis.url, "target": "_blank", "innerHTML": arcgis.arcgis.url }, url, "last");
					
					var validationMessage = domConstruct.create("div", {"style": "text-align:right;"}, content, "last");
						
					if (this.editMode) {
						var validateButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Validate"}, buttonContainer, "last");
						on(validateButton, "click", lang.hitch(this, function() {
							this.validateExistingArcgis(arcgis.arcgis, validationMessage);
						}));
						var editButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "View or Edit"}, buttonContainer, "last");
						on(editButton, "click", lang.hitch(this, function() {
							this.setupManageEditForm(arcgis);
						}));
						
						var deleteButton = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Delete"}, buttonContainer, "last");
						on(deleteButton, "click", lang.hitch(this, function() {
							if (confirm("Please confirm removing resource: " + arcgis.label) == true) {
						    	this.deleteArcgis(arcgis.id);
						    }
						}));
					}
				}));
			}
			else {
				var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No ArcGIS services in this category"}, this.arcgisDisplayForm, "last");
			}
		},
		
		deleteArcgis: function(id) {
			var url = "sc/categories/delete/" + id;
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("Failed to delete ArcGIS service.");
					}
					else if (response.type == "success") {
						this.showMessage("ArcGIS service deleted.");
						var index = this.currentCategoryArcgises.findIndex(x => x.id == id);
						if (index > -1) {
							this.currentCategoryArcgises.splice(index, 1);
							this.cleanArcgisDisplayForm();
							this.displayArcgises(this.currentCategoryArcgises);
						}
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on categories/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		validateExistingArcgis: function(arcgis, div) {
			var url = "sc/ags/verify";
			var data = {
				"url": arcgis.url
			};
			request.post(url, this.utils.createPostWithTimeoutRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						div.style.color = "red";
						div.innerHTML = "ArcGIS resource did not pass validation. Possible reason: URL is not valid.";
					}
					else if (response.type == "success") {
						div.style.color = "green";
						div.innerHTML = "ArcGIS resource is valid.";
					}
				}),
				lang.hitch(this, function(error){
					if (error.message == "Timeout exceeded") {
						div.style.color = "red";
						div.innerHTML = "ArcGIS resource did not pass validation. Service didn't respond after 1 minute.";
					}
					else {
						div.style.color = "red";
						div.innerHTML = "Validation did not work. Please report to data@helcom.fi.";
					}
				})
			);
		},
		
		deleteObject: function(id) {
			var url = "sc/categories/delete/" + id;
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("Failed to delete.");
					}
					else if (response.type == "success") {
						this.showMessage("Deleted.");
						this.cleanAdminForm();
						this.currentObjId = null;
						this.currentCategory = null;
						this.currentCategoryWmses = [];
						this.currentCategoryCategories = [];
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on categories/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		/* --- MANAGE CATEGORY UTILS END --- */
		
		
		
		/*addWmsLinkClick: function() {
			if (!this.addingWmsWithCategory) {
				this.utils.show("addCategoryWmsForm", "block");
				this.addingWmsWithCategory = true;
			}
			else {
				this.hideAddWmsForm();
			}
		},
		
		addWfsLinkClick: function() {
			if (!this.addingWfsWithCategory) {
				this.utils.show("addCategoryWfsForm", "block");
				this.addingWfsWithCategory = true;
			}
			else {
				this.utils.show("addCategoryWfsForm", "none");
				this.addingWfsWithCategory = false;
			}
		},
		
		addMetadataLinkClick: function() {
			if (!this.addingMetadataWithCategory) {
				this.utils.show("addCategoryMetadataForm", "block");
				this.addingMetadataWithCategory = true;
			}
			else {
				this.utils.show("addCategoryMetadataForm", "none");
				this.addingMetadataWithCategory = false;
			}
		},*/
		
		setupCategoryUsersForm: function(layer, headerText, users) {
			this.utils.changeText("adminFormsHeader", headerText);
			this.getCategoryUsers(layer.id, users);
			this.utils.show("categoryUsersForm", "block");
		},
		
		getCategoryUsers: function(categoryId, users) {
			var categoryUsers = [];
			var providerNames = [];
			array.forEach(users, lang.hitch(this, function(user) {
				providerNames.push({"label": user.name, "value": user.id});
				array.forEach(user.rights, lang.hitch(this, function(right) {
					if (right.categoryId == categoryId) {
						categoryUsers.push(user);
					}
				}));
			}));
			this.displayCategoryUsers(categoryId, categoryUsers);
			this.setupCategoryUserSelector(providerNames);
		},
		
		displayCategoryUsers: function(categoryId, users) {
			if (users.length > 0) {
				array.forEach(users, lang.hitch(this, function(user) {
					var container = domConstruct.create("div", {"class": "formSubSectionGroup"}, this.categoryUserListForm, "last");
					var content = domConstruct.create("div", {"style": "display: inline-block; width: 90%"}, container, "last");
					var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 10%"}, container, "last");
					
					var name = domConstruct.create("div", null, content, "last");
					var nameLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Name: " }, name, "last");
					var nameValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": user.name }, name, "last");
					
					var email = domConstruct.create("div", null, content, "last");
					var emailLabel = domConstruct.create("span", { "class": "textInputLabel", "innerHTML": "Email: " }, email, "last");
					var emailValue = domConstruct.create("span", { "class": "textLabel", "innerHTML": user.email }, email, "last");
					
					var button = domConstruct.create("div", {"class": "formEditDeleteLink", "innerHTML": "Delete"}, buttonContainer, "last");
					on(button, "click", lang.hitch(this, function() {
					    if (confirm("Please confirm removing data provider " + user.name + " from this category") == true) {
					    	var index = user.rights.findIndex(x => x.categoryId == categoryId);
							if (index > -1) {
								user.rights.splice(index, 1);
								var i = users.findIndex(x => x.id == user.id);
								if (i > -1) {
									users.splice(i, 1);
								}
							}
					    	this.updateUserFunction(user, categoryId, users);
					    }
					}));
				}));
			}
			else {
				var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No data providers assigned to this category"}, this.categoryUserListForm, "last");
			} 
			
		},
		
		updateUserFunction: function(user, categoryId, users) {
			var url = "sc/users/update";
			request.post(url, this.utils.createPostRequestParams(user)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.showMessage("Failed to update user.");
					}
					else if (response.type == "success") {
						this.cleanCategoryUsersDisplayForm();
						this.showMessage("User updated.");
						//this.displayCategoryUsers(categoryId, users);
					}
				}),
				lang.hitch(this, function(error) {
					this.formsObj.showMessage("Something went wrong (on users/update). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		getCurrentCategory: function() {
			var url = "sc/categories/get/"+this.currentObjId;
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						// TODO: popup box message
					}
					else if (response.type == "success") {
						this.currentCategory = response.item;
					}
				}),
				lang.hitch(this, function(error) {
					alert("Something went wrong (on categories/get/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		setupAndDisplayCategories: function(layers) {
			this.currentCategoryCategories = [];
			array.forEach(layers, lang.hitch(this, function(layer) {
				if (layer.layers) {
					this.currentCategoryCategories.push(layer);
				}
			}));
			this.displayCategories();
		},
		
		setupAndDisplayWmses: function(layers) {
			this.currentCategoryWmses = [];
			array.forEach(layers, lang.hitch(this, function(layer) {
				if (layer.wms != null) {
					this.currentCategoryWmses.push(layer);
				}
			}));
			this.displayWmses();
		},
		
		setupAndDisplayWfses: function(layers) {
			this.currentCategoryWfses = [];
			array.forEach(layers, lang.hitch(this, function(layer) {
				if (layer.wfs != null) {
					this.currentCategoryWfses.push(layer);
				}
			}));
			this.displayWfses();
		},
		
		setupAndDisplayDownloads: function(layers) {
			this.currentCategoryDownloads = [];
			array.forEach(layers, lang.hitch(this, function(layer) {
				if (layer.download != null) {
					this.currentCategoryDownloads.push(layer);
				}
			}));
			this.displayDownloads();
		},
		
		setupAndDisplayArcgises: function(layers) {
			this.currentCategoryArcgises = [];
			array.forEach(layers, lang.hitch(this, function(layer) {
				if (layer.arcgis != null) {
					this.currentCategoryArcgises.push(layer);
				}
			}));
			this.displayArcgises();
		},
		
		setupManageEditForm: function(layer) {
			this.cleanAdminForm();
			this.currentObjId = layer.id;
			this.getCurrentCategory();
			
			this.editMode = layer.editMode; 
			if (this.editMode) {
				this.utils.show("editCategoryLabel", "inline-block");
				this.utils.show("editDescription", "inline-block");
				//this.utils.show("editHelcomCatalogueId", "inline-block");
				this.utils.show("editCategoryMetadataLink", "inline-block");
				this.utils.show("addMetadata", "block");
				this.utils.show("addCategory", "block");
				this.utils.show("addWms", "block");
				this.utils.show("addWfs", "block");
				this.utils.show("addDownload", "block");
				this.utils.show("addArcgis", "block");
				this.utils.show("deleteObject", "block");
				//this.utils.show("wmsUpdateInfoButton", "block");
			}
			else {
				this.utils.show("editCategoryLabel", "none");
				this.utils.show("editDescription", "none");
				//this.utils.show("editHelcomCatalogueId", "none");
				this.utils.show("editCategoryMetadataLink", "none");
				this.utils.show("addMetadata", "none");
				this.utils.show("addCategory", "none");
				this.utils.show("addWms", "none");
				this.utils.show("addWfs", "none");
				this.utils.show("addDownload", "none");
				this.utils.show("addArcgis", "none");
				this.utils.show("deleteObject", "none");
				//this.utils.show("wmsUpdateInfoButton", "none");
			}
			
			this.utils.changeText("adminFormsHeader", layer.header);
			
			this.utils.setTextValue("categoryLabel", layer.name);
			
			if ((layer.description) && (layer.description.length > 0)) {
				this.utils.setTextValue("descriptionLabel", layer.description);
			}
			else {
				this.utils.setTextValue("descriptionLabel", "Not assigned");
			}
			
			if ((layer.tags) && (layer.tags.length > 0)) {
				let t = layer.tags.replaceAll(";", "; ");
				this.utils.setTextValue("tagsLabel", t);
			}
			else {
				this.utils.setTextValue("tagsLabel", "Not assigned");
			}
			
			/*if ((layer.helcomId) && (layer.helcomId.length > 0)) {
				this.utils.setTextValue("helcomCatalogueId", layer.helcomId);
			}
			else {
				this.utils.setTextValue("helcomCatalogueId", "Not assigned");
			}*/
			
			if (layer.type == "CATEGORY") {
				this.utils.show("categoryMetadataSection", "block");
				this.utils.show("tagsSection", "none");
				this.utils.show("categoryCategoriesForm", "block");
				this.utils.show("categoryWmsForm", "block");
				this.utils.show("categoryWfsForm", "block");
				this.utils.show("categoryDownloadForm", "block");
				this.utils.show("categoryArcgisForm", "block");
				this.utils.show("downloadArcgisUrlSection", "none");
				this.utils.show("categoryMetadataForm", "none");
				this.utils.show("categoryWmsInfoForm", "none");
				this.utils.show("categoryWfsInfoForm", "none");
				this.utils.setTextValue("formInfoHeader", "Category information and its content");
				this.utils.setTextValue("deleteObject", "Delete this category with all content");
				
				if ((layer.metadata) && (layer.metadata.length > 0)) {
					this.utils.setTextValue("categoryMetadataLink", layer.metadata[0].url);
				}
				else {
					this.utils.setTextValue("categoryMetadataLink", "Not assigned");
				}
				
				this.setupAndDisplayCategories(layer.layers);
				this.setupAndDisplayWmses(layer.layers);
				this.setupAndDisplayWfses(layer.layers);
				this.setupAndDisplayDownloads(layer.layers);
				this.setupAndDisplayArcgises(layer.layers);
				
			}
			else if (layer.type == "WMS") {
				this.utils.show("categoryMetadataSection", "none");
				this.utils.show("tagsSection", "block");
				this.utils.show("downloadArcgisUrlSection", "none");
				this.utils.show("categoryCategoriesForm", "none");
				this.utils.show("categoryWmsForm", "none");
				this.utils.show("categoryWfsForm", "none");
				this.utils.show("categoryDownloadForm", "none");
				this.utils.show("categoryArcgisForm", "none");
				this.utils.show("categoryWfsInfoForm", "none");
				this.utils.show("categoryMetadataForm", "block");
				this.utils.show("categoryWmsInfoForm", "block");
				this.utils.setTextValue("formInfoHeader", "WMS layer");
				this.utils.setTextValue("deleteObject", "Delete this WMS");
				
				if ((layer.metadata) && (layer.metadata.length > 0)) {
					this.displayMetadata(layer.metadata);
				}
				else {
					var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No metadata assigned"}, this.metadataDisplayForm, "last");
				}
				
				this.getWmsInfo(layer.wms);
			}
			else if (layer.type == "WFS") {
				this.utils.show("categoryMetadataSection", "none");
				this.utils.show("tagsSection", "block");
				this.utils.show("downloadArcgisUrlSection", "none");
				this.utils.show("categoryCategoriesForm", "none");
				this.utils.show("categoryWmsForm", "none");
				this.utils.show("categoryWfsForm", "none");
				this.utils.show("categoryDownloadForm", "none");
				this.utils.show("categoryArcgisForm", "none");
				this.utils.show("categoryWmsInfoForm", "none");
				this.utils.show("categoryMetadataForm", "block");
				this.utils.show("categoryWfsInfoForm", "block");
				this.utils.setTextValue("formInfoHeader", "WFS feature type");
				this.utils.setTextValue("deleteObject", "Delete this WFS");
				
				if ((layer.metadata) && (layer.metadata.length > 0)) {
					this.displayMetadata(layer.metadata);
				}
				else {
					var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No metadata assigned"}, this.metadataDisplayForm, "last");
				}
				
				//this.getWfsInfo(layer.wfs.url, layer.wfs.name);
				this.getWfsInfo(layer.wfs);
			}
			else if (layer.type == "DOWNLOAD") {
				this.utils.show("categoryMetadataSection", "none");
				this.utils.show("tagsSection", "block");
				this.utils.show("categoryCategoriesForm", "none");
				this.utils.show("categoryWmsForm", "none");
				this.utils.show("categoryWfsForm", "none");
				this.utils.show("categoryDownloadForm", "none");
				this.utils.show("categoryArcgisForm", "none");
				this.utils.show("categoryWmsInfoForm", "none");
				this.utils.show("categoryWfsInfoForm", "none");
				this.utils.show("downloadArcgisUrlSection", "block");
				this.utils.show("categoryMetadataForm", "block");
				this.utils.setTextValue("formInfoHeader", "Downloadable resource");
				this.utils.setTextValue("deleteObject", "Delete this resource");
				
				this.utils.setTextValue("downloadArcgisUrl", layer.download.url);
				
				if ((layer.metadata) && (layer.metadata.length > 0)) {
					this.displayMetadata(layer.metadata);
				}
				else {
					var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No metadata assigned"}, this.metadataDisplayForm, "last");
				}
			}
			else if (layer.type == "ARCGIS") {
				this.utils.show("categoryMetadataSection", "none");
				this.utils.show("tagsSection", "block");
				this.utils.show("categoryCategoriesForm", "none");
				this.utils.show("categoryWmsForm", "none");
				this.utils.show("categoryWfsForm", "none");
				this.utils.show("categoryDownloadForm", "none");
				this.utils.show("categoryArcgisForm", "none");
				this.utils.show("categoryWmsInfoForm", "none");
				this.utils.show("categoryWfsInfoForm", "none");
				this.utils.show("downloadArcgisUrlSection", "block");
				this.utils.show("categoryMetadataForm", "block");
				this.utils.setTextValue("formInfoHeader", "ArcGIS REST MapServer layer");
				this.utils.setTextValue("deleteObject", "Delete this resource");
				
				this.utils.setTextValue("downloadArcgisUrl", layer.arcgis.url);
				
				if ((layer.metadata) && (layer.metadata.length > 0)) {
					this.displayMetadata(layer.metadata);
				}
				else {
					var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No metadata assigned"}, this.metadataDisplayForm, "last");
				}
			}
			
			this.utils.show("categoryForm", "block");
		},
		
		/*setupManageCategoryForm: function(layer, categories, wmses, headerText) {
			this.editMode = layer.editMode; 
			if (this.editMode) {
				this.utils.show("editCategoryLabel", "inline-block");
				this.utils.show("editHelcomCatalogueId", "inline-block");
				this.utils.show("editCategoryMetadataLink", "inline-block");
				this.utils.show("addMetadata", "block");
				this.utils.show("addCategory", "block");
				this.utils.show("addWms", "block");
			}
			else {
				this.utils.show("editCategoryLabel", "none");
				this.utils.show("editHelcomCatalogueId", "none");
				this.utils.show("editCategoryMetadataLink", "none");
				this.utils.show("addMetadata", "none");
				this.utils.show("addCategory", "none");
				this.utils.show("addWms", "none");
			}
			
			//this.formView = view;
			this.utils.changeText("adminFormsHeader", headerText);
			
			this.utils.setTextValue("categoryLabel", layer.name);
			
			if ((layer.helcomId) && (layer.helcomId.length > 0)) {
				this.utils.setTextValue("helcomCatalogueId", layer.helcomId);
			}
			else {
				this.utils.setTextValue("helcomCatalogueId", "Not assigned");
			}
			
			if (layer.type == "CATEGORY") {
				this.utils.show("categoryMetadataSection", "block");
				if ((layer.metadata) && (layer.metadata.length > 0)) {
					this.utils.setTextValue("categoryMetadataLink", layer.metadata[0].url);
				}
				else {
					this.utils.setTextValue("categoryMetadataLink", "Not assigned");
				}
				
				this.utils.show("categoryCategoriesForm", "block");
				this.utils.show("categoryWmsForm", "block");
				this.utils.show("categoryMetadataForm", "none");
				if ((categories) && (categories.length > 0)) {
					this.displayCategories(categories);
				}
				else {
					var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No sub-categories"}, this.categoryDisplayForm, "last");
				}
				if ((wmses) && (wmses.length > 0)) {
					this.displayWmses(wmses);
				}
				else {
					var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No WMSes in this category"}, this.wmsDisplayForm, "last");
				}
			}
			else {
				this.utils.show("categoryMetadataSection", "none");
				
				this.utils.show("categoryCategoriesForm", "none");
				this.utils.show("categoryWmsForm", "none");
				this.utils.show("categoryMetadataForm", "block");
				if ((layer.metadata) && (layer.metadata.length > 0)) {
					this.displayMetadata(layer.metadata);
				}
				else {
					var con = domConstruct.create("div", {"style": { "margin-bottom": "5px", "margin-top": "5px", "margin-left": "20px"}, "innerHTML": "No metadata assigned"}, this.metadataDisplayForm, "last");
				}
			}
			
			if (layer.type == "WMS") {
				this.utils.show("categoryWmsInfoForm", "block");
				this.getWmsInfo(layer.wms.url, layer.wms.name);
			}
			else {
				this.utils.show("categoryWmsInfoForm", "none");
			}
			this.utils.show("categoryForm", "block");
		},*/
		
		/*setupDeleteCategoryForm: function(headerText) {
			this.formView = "DELETE_CATEGORY";
			this.utils.changeText("adminFormsHeader", headerText);
			this.utils.show("deleteCategoryForm", "block");
		},
		
		setupWmsInfoForm: function(headerText, url, name) {
			this.formView = "WMS_INFO";
			this.utils.changeText("adminFormsHeader", headerText);
			this.utils.show("wmsInfoForm", "block");
			this.getWmsInfo(url, name);
		},
		
		setupMetadataForm: function(headerText, metadata) {
			this.formView = "METADATA";
			this.utils.changeText("adminFormsHeader", headerText);
			this.utils.show("metadataForm", "block");
			this.showMetadata(metadata);
		},*/
		
		/*formCleanUp: function() {
			this.utils.changeText("adminFormsHeader", "");
			this.utils.changeText("adminFormMessage", "");
	    	this.utils.show("adminFormMessage", "none");
	    	if (this.formView === "MANAGE_CATEGORY") {
	    		this.hideCategoryForm();
			} else if (this.formView === "DELETE_CATEGORY") {
				this.utils.show("deleteCategoryForm", "none");
			} else if (this.formView === "WMS_INFO") {
				domConstruct.empty(this.wmsInfoContainer);
				this.utils.show("wmsInfoForm", "none");
			}
	    	this.formView = null;
	    	this.action = null;
		},*/
		
		/*getCategoryInputValue: function() {
			return this.utils.getInputValue("categoryInput");
		},
		
		setCategoryInputValue: function(value) {
			this.utils.setInputValue("categoryInput", value);
		},
		
		getHelcomIdInputValue: function() {
			return this.utils.getInputValue("helcomCatalogueIdInput");
		},
		
		setHelcomIdInputValue: function(value) {
			this.utils.setInputValue("helcomCatalogueIdInput", value);
		},
		
		getWmsUrlInputValue: function() {
			return this.utils.getInputValue("wmsUrlInput");
		},
		
		getWmsNameInputValue: function() {
			return this.utils.getInputValue("wmsNameInput");
		},
		
		getWmsLabelInputValue: function() {
			return this.utils.getInputValue("wmsLabelInput");
		},
		
		getMetadataUrlInputValue: function() {
			return this.utils.getInputValue("metadataUrlInput");
		},*/
		
		/*getWfsUrlInputValue: function() {
			return this.utils.getInputValue("adminFormAddWfsUrlInput");
		},
		
		getWfsNameInputValue: function() {
			return this.utils.getInputValue("adminFormAddWfsNameInput");
		},*/
		
		/* Hide category main function */
		/*hideCategoryForm: function() {
			this.hideAddCategoryForm();
			this.hideWmsSection();
			this.hideMetadataSection();
			
			this.utils.show("categoryForm", "none");
		},*/
		
		/* Category section functions*/
		/*setupAddCategoryForm: function(leaf, emptyCategory, label, helcomId) {
			this.setCategoryInputValue(label);
			if (!leaf) {
				this.utils.show("helcomCatalogueIdLabelForm", "none");
				this.utils.show("addDataForCategoryForm", "none");
				this.utils.show("addDataCategoryButton", "none");
			}
			else {
				this.setHelcomIdInputValue(helcomId);
				this.utils.show("helcomCatalogueIdLabelForm", "block");
				this.utils.show("addDataForCategoryForm", "block");
				this.utils.show("addDataCategoryButton", "none");
			}
			if (emptyCategory) {
				this.utils.show("addDataCategoryButton", "inline-block");
			}
			this.utils.show("saveCategoryButton", "none");
			this.utils.show("updateCategoryButton", "inline-block");
			//this.utils.show("addDataCategoryButton", "none");
		},
		
		hideAddCategoryForm: function() {
			this.utils.clearInput("categoryInput");
			this.utils.clearInput("helcomCatalogueIdInput");
			this.utils.show("helcomCatalogueIdLabelForm", "block");
			this.utils.show("saveCategoryButton", "inline-block");
			this.utils.show("updateCategoryButton", "none");
			this.utils.show("addDataCategoryButton", "none");
			this.utils.show("addDataForCategoryForm", "none");
		},*/
		
		/* WMS section functions */
		/*setupWmsDisplayForm: function(wms) {
			this.utils.changeText("wmsFormMessage", "WMS added to this layer:");
			this.utils.changeText("wmsDisplayUrl", wms.url);
			this.utils.changeText("wmsDisplayName", wms.name);
			this.utils.show("addWmsButton", "none");
			this.utils.show("wmsDisplayForm", "block");
			//this.showMetadata(metadata);
		},
		
		hideWmsSection: function() {
			this.wmsUpdate = false;
			this.utils.changeText("wmsFormMessage", "No WMS added to this layer");
			this.hideAddWmsForm();
			this.hideDisplayWmsForm();
		},
		
		hideAddWmsForm: function() {
			this.utils.clearInput("wmsUrlInput");
			this.hideWmsNameAndLabelSelector();
			this.utils.show("addWmsForm", "none");
			if (!this.wmsUpdate) {					
				this.utils.show("addWmsButton", "block");
			}
			else {
				this.utils.show("updateWmsButton", "block");
				this.utils.show("wmsDisplayForm", "block");
			}
		},*/
		
		/*hideWmsNameAndLabelSelector: function() {
			if (this.wmsNameSelector != null) {
				this.wmsNameSelector.destroy();
				this.wmsNameSelector = null;
			}
			this.utils.show("wmsNameSelectForm", "none");
			this.utils.clearInput("wmsNameInput");
			this.utils.show("wmsNameForm", "none");
			this.utils.clearInput("wmsLabelInput");
			this.utils.show("wmsLabelForm", "none");
			this.wmsValidationPassed = false;
		},
		
		hideDisplayWmsForm: function() {
			this.utils.changeText("wmsDisplayUrl", "");
			this.utils.changeText("wmsDisplayName", "");
			this.utils.show("wmsDisplayForm", "none");
		},*/
		
		/* Metadata section functions */
		/*setupMetadataDisplayForm: function(metadata) {
			this.utils.changeText("metadataFormMessage", "Metadata added to this layer:");
			this.utils.show("metadataDisplayForm", "block");
			this.showMetadata(metadata);
		},
		
		
		
		hideMetadataSection: function() {
			this.utils.changeText("metadataFormMessage", "No metadata added to this layer (Add WMS, WFS first. Metadata will be added automatically if any present in WMS and WFS.)");
			//this.hideAddWmsForm();
			this.hideDisplayMetadataForm();
		},
		
		hideAddMetadataForm: function() {
			this.utils.clearInput("metadataUrlInput");
			this.hideMetadataFormatSelector();
			this.utils.show("addMetadataForm", "none");
			this.utils.show("addMetadataButton", "block");
		},
		
		hideMetadataFormatSelector: function() {
			if (this.metadataFormatSelector != null) {
				this.metadataFormatSelector.destroy();
				this.metadataFormatSelector = null;
			}
		},
		
		hideDisplayMetadataForm: function() {
			domConstruct.empty(this.metadataDisplayForm);
			this.utils.show("metadataDisplayForm", "none");
		},*/
		
		/*hideMetadataForm: function() {
			domConstruct.empty(this.metadataContainer);
			this.utils.show("metadataForm", "none");
			this.hideMetadataFormatSelector();
		},*/
		
		
	
		showMessage: function(text) {
			var u = this.utils;
			u.changeText("adminFormMessage", text);
	    	u.show("adminFormMessage", "block");
	    	setTimeout(function() { 
	    		u.changeText("adminFormMessage", "");
	    		u.show("adminFormMessage", "none");
	    	}, 10000);
		},
		hideMessage: function() {
			this.utils.changeText("adminFormMessage", "");
			this.utils.show("adminFormMessage", "none");
		},
		
		/*validateWmsLinkClick: function() {
			this.hideWmsNameAndLabelSelector();
			var wmsUrl = this.getWmsUrlInputValue();
			if (validate.isUrl(wmsUrl)) {
				this.action = "VALIDATE_WMS";
				var url = "sc/wms/verify";
				var data = {
					"url": wmsUrl
				};
				request.post(url, this.utils.createPostRequestParams(data)).then(
					lang.hitch(this, function(response){
						console.log(response);
						this.hideWmsNameAndLabelSelector();
						if (response.type == "error") {
							this.wmsValidationPassed = false;
							this.showMessage("WMS did not pass validation.");
							this.utils.show("wmsNameForm", "block");
						}
						else if (response.type == "success") {
							this.wmsValidationPassed = true;
							this.showMessage("WMS is valid.");
							this.utils.show("wmsNameSelectForm", "block");
							
							//this.utils.setInputValue("wmsLabelInput", response.item.organization);
							var layerNames = [];
							array.forEach(response.item.names, lang.hitch(this, function(name){
								layerNames.push({label: name, value: name});
							}));
							this.wmsNameSelector = new Select({
								options: layerNames
							});
							this.wmsNameSelector.placeAt(this.wmsNameSelect);
							this.wmsNameSelector.startup();
						}
						this.utils.show("wmsLabelForm", "block");
						this.action = null;
					}),
					lang.hitch(this, function(error){
						this.action = null;
						this.showMessage("Something went wrong (on wms/verify). Please contact administrator.");
					})
				);
			}
			else {
				this.showMessage("Url is not valid.");
			}
		},*/
		
		// -- wms info form
		/*updateWmsInfo: function(wms) {
			var url = "sc/wms/update-info/"+wms.id;
			request.post(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.showMessage("Failed to update WMS info.");
						// TODO: popup box message
					}
					else if (response.type == "success") {
						this.showMessage("WMS info updated.");
						this.cleanWmsInfoDisplayForm();
						this.getWmsInfo(wms);
					}
				}),
				lang.hitch(this, function(error) {
					alert("Something went wrong (on wms/update-info/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},*/
		
		/*getWmsInfo: function(wms) {
			console.log("wms", wms);
			var url = "sc/wms/info";
			var data = {
				"url": wms.url,
				"name": wms.name
			};
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("WMS did not pass validation. Can't get WMS info.");
					}
					else if (response.type == "success") {
						var updateInfoLink = domConstruct.create("div", {"class": "formLink", "innerHTML": "Update info"}, this.wmsDisplayInfoForm, "last");
						on(updateInfoLink, "click", lang.hitch(this, function() {
							this.updateWmsInfo(wms);
						}));
						this.buildWmsInfoElement("WMS URL", wms.url);
						this.buildWmsInfoElement("Layer name", wms.name);
						this.buildWmsInfoElement("Layer title", response.item.title);
						this.buildWmsInfoElement("Layer title (translated)", response.item.titleEn);
						this.buildWmsInfoElement("Layer description", response.item.description);
						this.buildWmsInfoElement("Layer description (translated)", response.item.descriptionEn);
						this.buildWmsInfoElement("WMS version", response.item.version);
						this.buildWmsInfoElement("Supported languages", response.item.languages.join(", "));
						this.buildWmsInfoElement("Organization", response.item.organisation);
						this.buildWmsInfoElement("Access constraints", response.item.accessConstraints);
						this.buildWmsInfoElement("Access constraints (translated)", response.item.accessConstraintsEn);
						this.buildWmsInfoElement("Fees", response.item.fees);
						this.buildWmsInfoElement("Fees (translated)", response.item.feesEn);
						this.buildWmsInfoElement("Keywords", response.item.keywords.join(", "));
						this.buildWmsInfoElement("Keywords (translated)", response.item.keywordsEn.join(", "));
						this.buildWmsMetadataElement("Metadata", response.item.metadata);
						this.buildWmsInfoElement("GetFeatureInfo support", response.item.queryable);
						this.buildWmsInfoElement("GetFeatureInfo response formats", response.item.formats.join(", "));
						this.buildWmsInfoElement("Supported CRSes", response.item.crs.join(", "));
						this.buildWmsInfoElement("Bounding box", "East: " + response.item.boundEast + ", North: " + response.item.boundNorth + ", West: " + response.item.boundWest + ", South: " + response.item.boundSouth);
						this.buildWmsInfoElement("Min display scale", response.item.scaleMin == "NaN" ? "" : response.item.scaleMin);
						this.buildWmsInfoElement("Max display scale", response.item.scaleMax == "NaN" ? "" : response.item.scaleMax);
						this.buildWmsStyleElement("Styles", response.item.styles);
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on wms/info). Please contact administrator.");
				})
			);
		},*/
		getWmsInfo: function(wms) {
			/*var updateInfoLink = domConstruct.create("div", {"id": "wmsUpdateInfoButton", "class": "formLink", "innerHTML": "Update info"}, this.wmsDisplayInfoForm, "last");
			on(updateInfoLink, "click", lang.hitch(this, function() {
				this.updateWmsInfo(wms);
			}));*/
			this.buildWmsInfoElement("WMS url", wms.url);
			this.buildWmsInfoElement("Layer name", wms.name);
			this.buildWmsInfoElement("Layer title", wms.info.title);
			this.buildWmsInfoElement("Layer title (translated)", wms.info.titleEn);
			this.buildWmsInfoElement("Layer description", wms.info.description);
			this.buildWmsInfoElement("Layer description (translated)", wms.info.descriptionEn);
			this.buildWmsInfoElement("WMS version", wms.info.version);
			this.buildWmsInfoElement("Supported languages", wms.info.languages.join(", "));
			this.buildWmsInfoElement("Organization", wms.info.organisation);
			this.buildWmsInfoElement("Access constraints", wms.info.accessConstraints);
			this.buildWmsInfoElement("Access constraints (translated)", wms.info.accessConstraintsEn);
			this.buildWmsInfoElement("Fees", wms.info.fees);
			this.buildWmsInfoElement("Fees (translated)", wms.info.feesEn);
			this.buildWmsInfoElement("Keywords", wms.info.keywords.join(", "));
			this.buildWmsInfoElement("Keywords (translated)", wms.info.keywordsEn == null ? "" : wms.info.keywordsEn.join(", "));
			//this.buildWmsMetadataElement("Metadata", wms.info.metadata);
			this.buildWmsInfoElement("GetFeatureInfo support", wms.info.queryable);
			this.buildWmsInfoElement("GetFeatureInfo response formats", wms.info.formats.join(", "));
			this.buildWmsInfoElement("Supported CRSes", wms.info.crs.join(", "));
			this.buildWmsInfoElement("Bounding box", "East: " + wms.info.boundEast + ", North: " + wms.info.boundNorth + ", West: " + wms.info.boundWest + ", South: " + wms.info.boundSouth);
			this.buildWmsInfoElement("Min display scale", wms.info.scaleMin == "NaN" ? "" : wms.info.scaleMin);
			this.buildWmsInfoElement("Max display scale", wms.info.scaleMax == "NaN" ? "" : wms.info.scaleMax);
			this.buildWmsStyleElement("Styles", wms.styles);
		},
		
		buildWmsInfoElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "serviceInfoElementContainer"}, this.wmsDisplayInfoForm, "last");
			var infoLabel = domConstruct.create("div", { "class": "serviceInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "serviceInfoElementValue", "innerHTML": value }, infoContainer, "last");
		},
		
		buildWmsMetadataElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "serviceInfoElementContainer"}, this.wmsDisplayInfoForm, "last");
			var infoLabel = domConstruct.create("div", { "class": "serviceInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "serviceInfoElementValue"}, infoContainer, "last");
			
			array.forEach(value, lang.hitch(this, function(record){
				var metadataContainer = domConstruct.create("div", {"style": { "margin-bottom": "5px" }}, infoValue, "last");
				var metadataLabel = domConstruct.create("div", { "style": { "font-size": "14px", "font-weight": "bold" }, "innerHTML": record.format }, metadataContainer, "last");
				var metadataURL = domConstruct.create("div", { "innerHTML": record.url }, metadataContainer, "last");
			}));
		},
		
		buildWmsStyleElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "serviceInfoElementContainer"}, this.wmsDisplayInfoForm, "last");
			var infoLabel = domConstruct.create("div", { "class": "serviceInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "serviceInfoElementValue"}, infoContainer, "last");
			
			array.forEach(value, lang.hitch(this, function(record){
				var styleContainer = domConstruct.create("div", {"style": { "margin-bottom": "5px" }}, infoValue, "last");
				var styleName = domConstruct.create("div", { "style": { "font-size": "14px", "font-weight": "bold" }, "innerHTML": "Name: " + record.name }, styleContainer, "last");
				var styleURL = domConstruct.create("div", { "innerHTML": record.urls[0] }, styleContainer, "last");
				var styleImage = domConstruct.create("img", { "src": record.urls[0] }, styleContainer, "last");
			}));
		},
		
		// -- wfs info form
		/*getWfsInfo: function(wfsUrl, wfsName) {
			var url = "sc/wfs/info";
			var data = {
				"url": wfsUrl,
				"name": wfsName
			};
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.showMessage("WFS did not pass validation. Can't get WFS info.");
					}
					else if (response.type == "success") {
						this.buildWfsInfoElement("WFS url", wfsUrl);
						this.buildWfsInfoElement("Feature type name", wfsName);
						this.buildWfsInfoElement("Feature type title", response.item.title);
						this.buildWfsInfoElement("WFS version", response.item.version);
						this.buildWfsInfoElement("Supported languages", response.item.languages.join(", "));
						this.buildWfsInfoElement("Organization", response.item.organisation);
						this.buildWfsInfoElement("Access constraints", response.item.accessConstraints);
						this.buildWfsInfoElement("Fees", response.item.fees);
						this.buildWfsInfoElement("Keywords", response.item.keywords.join(", "));
						this.buildWfsMetadataElement("Metadata", response.item.metadata);
						this.buildWfsInfoElement("Response formats", response.item.formats.join(", "));
						this.buildWfsInfoElement("Supported CRSes", response.item.crs.join(", "));
						this.buildWfsInfoElement("Bounding box", "East: " + response.item.upperLong + ", North: " + response.item.upperLat + ", West: " + response.item.lowerLong + ", South: " + response.item.lowerLat);
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on wms/info). Please contact administrator.");
				})
			);
		},*/
		
		getWfsInfo: function(wfs) {
			console.log(wfs);
			this.buildWfsInfoElement("WFS url", wfs.url);
			this.buildWfsInfoElement("Feature type name", wfs.name);
			this.buildWfsInfoElement("Feature type title", wfs.info.title);
			this.buildWfsInfoElement("Feature type title (translated)", wfs.info.titleEn);
			this.buildWfsInfoElement("WFS version", wfs.info.version);
			this.buildWfsInfoElement("Supported languages", wfs.info.languages.join(", "));
			this.buildWfsInfoElement("Organization", wfs.info.organisation);
			this.buildWfsInfoElement("Access constraints", wfs.info.accessConstraints);
			this.buildWfsInfoElement("Access constraints (translated)", wfs.info.accessConstraintsEn);
			this.buildWfsInfoElement("Fees", wfs.info.fees);
			this.buildWfsInfoElement("Fees (translated)", wfs.info.feesEn);
			this.buildWfsInfoElement("Keywords", wfs.info.keywords.join(", "));
			this.buildWfsInfoElement("Keywords (translated)", wfs.info.keywordsEn.join(", "));
			//this.buildWfsMetadataElement("Metadata", wfs.info.metadata);
			this.buildWfsInfoElement("Response formats", wfs.info.formats.join(", "));
			this.buildWfsInfoElement("Supported CRSes", wfs.info.crs.join(", "));
			this.buildWfsInfoElement("Bounding box", "East: " + wfs.info.upperLong + ", North: " + wfs.info.upperLat + ", West: " + wfs.info.lowerLong + ", South: " + wfs.info.lowerLat);
		},
		
		buildWfsInfoElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "serviceInfoElementContainer"}, this.wfsDisplayInfoForm, "last");
			var infoLabel = domConstruct.create("div", { "class": "serviceInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "serviceInfoElementValue", "innerHTML": value }, infoContainer, "last");
		},
		
		buildWfsMetadataElement: function(label, value) {
			var infoContainer = domConstruct.create("div", {"class": "serviceInfoElementContainer"}, this.wfsDisplayInfoForm, "last");
			var infoLabel = domConstruct.create("div", { "class": "serviceInfoElementLabel", "innerHTML": label+":" }, infoContainer, "last");
			var infoValue = domConstruct.create("div", { "class": "serviceInfoElementValue"}, infoContainer, "last");
			
			array.forEach(value, lang.hitch(this, function(record){
				var metadataContainer = domConstruct.create("div", {"style": { "margin-bottom": "5px" }}, infoValue, "last");
				var metadataLabel = domConstruct.create("div", { "style": { "font-size": "14px", "font-weight": "bold" }, "innerHTML": record.format }, metadataContainer, "last");
				var metadataURL = domConstruct.create("div", { "innerHTML": record.url }, metadataContainer, "last");
			}));
		},
		
		getSummary: function() {
			var url = "sc/categories/summary";
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.showMessage("Failed to get services summary.");
					}
					else if (response.type == "success") {
						array.forEach(response.item, lang.hitch(this, function(item) {
							this.initLabel = item.label;
							this.summaryLabel = null;
							this.countryLabelFound = false;
							this.getSummaryRecord(item);
						}));
					}
				}),
				lang.hitch(this, function(error) {
					alert("Something went wrong (on categories/summary). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		getSummaryRecord: function(item) {
			if (!this.countryLabels.includes(item.label)) {
				this.countryLabelFound = false;
				if (this.summaryLabel == null) {
					this.summaryLabel = this.initLabel;
					if (item.label != this.initLabel) {
						this.summaryLabel = this.summaryLabel + " -> " + item.label;
					}
				}
				else {
					this.summaryLabel = this.summaryLabel + " -> " + item.label;
				}				
				if (item.children != null) {
					array.forEach(item.children, lang.hitch(this, function(item) {
						this.getSummaryRecord(item);
					}));
				}
			}
			else  {
				if (!this.countryLabelFound) {
					this.countryLabelFound = true;
					domConstruct.create("div", { "innerHTML": this.summaryLabel, "class": "formSectionLabel" }, this.summaryReport, "last");
					this.summaryLabel = null;
				}
				var container = domConstruct.create("div", { "class": "inputLabelGroup"}, this.summaryReport, "last");
				var sum = item.counts.wmses + item.counts.wfses + item.counts.arcgises + item.counts.downloadables;
				domConstruct.create("span", { "innerHTML": item.label + " (" + sum + ")", "class": "textInputLabel"}, container, "last");
				domConstruct.create("span", { "innerHTML": "WMS: " + item.counts.wmses + ", WFS: " + item.counts.wfses + ", ARCGIS MAPSERVER: " + item.counts.arcgises + ", DOWNLOADABLE: " + item.counts.downloadables, "class": "textLabel"}, container, "last");
			}
		},
		
		downloadSummaryClick: function() {
			window.location.replace("sc/categories/summary-download");
		},
		
		prepareServicesForValidation: function(country) {
			let contriesNotToValidate = [];
			if (country != null) {
				for (const c in this.countryCodesLabels) {
					if (c != country) {
						contriesNotToValidate.push(this.countryCodesLabels[c]);	
					}
				}	
			}
			this.servicesValidationDone = false;
			array.forEach(this.tree, lang.hitch(this, function(item) {
				this.packRecord(item, contriesNotToValidate);
			}));
			console.log(this.validationPackage);
			this.validateRecord(this.validationPackage[this.currentValidateServiceNr]);
		},
		
		packRecord: function(record, countriesNotToValidate) {
			if (record.type == "CATEGORY") {
				if (!countriesNotToValidate.includes(record.label)) {
					array.forEach(record.layers, lang.hitch(this, function(layer) {
						this.packRecord(layer, countriesNotToValidate);
					}));	
				}
			}
			else if (record.type == "WMS") {
				this.wmsCount += 1;
				this.totalServicesCount += 1;
				this.validationPackage.push(record);
			}
			else if (record.type == "WFS") {
				this.wfsCount += 1;
				this.totalServicesCount += 1;
				this.validationPackage.push(record);
			}
			else if (record.type == "ARCGIS") {
				this.agsCount += 1;
				this.totalServicesCount += 1;
				this.validationPackage.push(record);
			}
			else if (record.type == "DOWNLOAD") {
				this.dnlCount += 1;
				this.totalServicesCount += 1;
				this.validationPackage.push(record);
			}
		},
		
		validateRecord: function(record) {
			var validationMessageDiv = null;
			if (record.type == "WMS") {
				domConstruct.create("div", { "innerHTML": record.header, "style": "font-weight: bold; margin-bottom: 5px; margin-left: 20px;" }, this.validationReport, "last");
				var container = domConstruct.create("div", { "class": "serviceInfoElementContainer"}, this.validationReport, "last");
				domConstruct.create("div", { "innerHTML": "WMS", "class": "serviceInfoElementLabel"}, container, "last");
				var info = domConstruct.create("div", { "class": "serviceInfoElementValue"}, container, "last");
				domConstruct.create("div", { "innerHTML": "URL: " + record.wms.url}, info, "last");
				domConstruct.create("div", { "innerHTML": "Layer: " + record.wms.name}, info, "last");
				validationMessageDiv = domConstruct.create("div", { "innerHTML": "Validating...", "style": "color: blue;"}, info, "last");
				this.validateWmsForReport(validationMessageDiv, record.wms.url, record.wms.name);
			}
			else if (record.type == "WFS") {				
				domConstruct.create("div", { "innerHTML": record.header, "style": "font-weight: bold; margin-bottom: 5px; margin-left: 20px;" }, this.validationReport, "last");
				var container = domConstruct.create("div", { "class": "serviceInfoElementContainer"}, this.validationReport, "last");
				domConstruct.create("div", { "innerHTML": "WFS", "class": "serviceInfoElementLabel"}, container, "last");
				var info = domConstruct.create("div", { "class": "serviceInfoElementValue"}, container, "last");
				domConstruct.create("div", { "innerHTML": "URL: " + record.wfs.url}, info, "last");
				domConstruct.create("div", { "innerHTML": "Feature type: " + record.wfs.name}, info, "last");
				validationMessageDiv = domConstruct.create("div", { "innerHTML": "Validating...", "style": "color: blue;"}, info, "last");
				this.validateWfsForReport(validationMessageDiv, record.wfs.url, record.wfs.name);
			}
			else if (record.type == "ARCGIS") {
				domConstruct.create("div", { "innerHTML": record.header, "style": "font-weight: bold; margin-bottom: 5px; margin-left: 20px;" }, this.validationReport, "last");
				var container = domConstruct.create("div", { "class": "serviceInfoElementContainer"}, this.validationReport, "last");
				domConstruct.create("div", { "innerHTML": "ARCGIS MAPSERVER", "class": "serviceInfoElementLabel"}, container, "last");
				var info = domConstruct.create("div", { "class": "serviceInfoElementValue"}, container, "last");
				domConstruct.create("div", { "innerHTML": "URL: " + record.arcgis.url}, info, "last");
				validationMessageDiv = domConstruct.create("div", { "innerHTML": "Validating...", "style": "color: blue;"}, info, "last");
				this.validateAgsForReport(validationMessageDiv, record.arcgis.url);
			}
			else if (record.type == "DOWNLOAD") {
				domConstruct.create("div", { "innerHTML": record.header, "style": "font-weight: bold; margin-bottom: 5px; margin-left: 20px;" }, this.validationReport, "last");
				var container = domConstruct.create("div", { "class": "serviceInfoElementContainer"}, this.validationReport, "last");
				domConstruct.create("div", { "innerHTML": "DOWNLOADABLE", "class": "serviceInfoElementLabel"}, container, "last");
				var info = domConstruct.create("div", { "class": "serviceInfoElementValue"}, container, "last");
				domConstruct.create("div", { "innerHTML": "URL: " + record.download.url}, info, "last");
				validationMessageDiv = domConstruct.create("div", { "innerHTML": "Validating...", "style": "color: blue;"}, info, "last");
				this.validateDnlForReport(validationMessageDiv, record.download.url);
			}
		},
		
		validateWmsForReport: function(div, wmsUrl, wmsLayer) {
			var url = "sc/wms/verify";
			var data = {
				"url": wmsUrl
			};
			request.post(url, this.utils.createPostWithTimeoutRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.wmsNotValidCount += 1;
						div.style.color = "red";
						div.innerHTML = "WMS did not pass validation.";
					}
					else if (response.type == "success") {
						if (response.item.names.includes(wmsLayer)) {
							this.wmsValidCount += 1;
							div.style.color = "green";
							div.innerHTML = "WMS is valid.";							
						}
						else {
							this.wmsNotValidCount += 1;
							div.style.color = "red";
							div.innerHTML = "WMS did not pass validation. " + wmsLayer + " is not available in the service." ;
						}
						
					}
					this.totalValidatedServicesCount += 1;
					if ((this.totalServicesCount > 0) && (this.totalValidatedServicesCount == this.totalServicesCount)) {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is finished. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
						this.servicesValidationDone = true;
					}
					else {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is in progress. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
					}
					
					if (this.wmsCount == this.wmsValidCount + this.wmsNotValidCount) {
						this.utils.setTextValue("wmsCountMessage", "Total WMS: " + this.wmsCount + " (valid: " + this.wmsValidCount + ", not valid: " + this.wmsNotValidCount + ").");
					}
					else {
						this.utils.setTextValue("wmsCountMessage", "Total WMS: " + this.wmsCount + " (valid: " + this.wmsValidCount + ", not valid: " + this.wmsNotValidCount + "). <span style='color: blue;'> Validating...</span>");
					}
					
					if (this.totalValidatedServicesCount < this.totalServicesCount) {
						this.currentValidateServiceNr += 1;
						console.log(this.currentValidateServiceNr, this.validationPackage[this.currentValidateServiceNr]);
						this.validateRecord(this.validationPackage[this.currentValidateServiceNr]);
					}
				}),
				lang.hitch(this, function(error){
					this.wmsNotValidCount += 1;
					div.style.color = "red";
					if (error.message == "Timeout exceeded") {
						div.innerHTML = "WMS did not pass validation. Service didn't respond after 1 minute.";
					}
					else {
						div.innerHTML = "Validation did not work. Please contact administrator.";
					}
					
					this.totalValidatedServicesCount += 1;
					if ((this.totalServicesCount > 0) && (this.totalValidatedServicesCount == this.totalServicesCount)) {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is finished. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
						this.servicesValidationDone = true;
					}
					else {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is in progress. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
					}
					
					if (this.wmsCount == this.wmsValidCount + this.wmsNotValidCount) {
						this.utils.setTextValue("wmsCountMessage", "Total WMS: " + this.wmsCount + " (valid: " + this.wmsValidCount + ", not valid: " + this.wmsNotValidCount + ").");
					}
					else {
						this.utils.setTextValue("wmsCountMessage", "Total WMS: " + this.wmsCount + " (valid: " + this.wmsValidCount + ", not valid: " + this.wmsNotValidCount + "). <span style='color: blue;'> Validating...</span>");
					}
					
					if (this.totalValidatedServicesCount < this.totalServicesCount) {
						this.currentValidateServiceNr += 1;
						this.validateRecord(this.validationPackage[this.currentValidateServiceNr]);
					}
				})
			);
		},
		
		validateWfsForReport: function(div, wfsUrl, wfsLayer) {
			var url = "sc/wfs/verify";
			var data = {
				"url": wfsUrl
			};
			request.post(url, this.utils.createPostWithTimeoutRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.wfsNotValidCount += 1;
						div.style.color = "red";
						div.innerHTML = "WFS did not pass validation.";
					}
					else if (response.type == "success") {
						if (response.item.names.includes(wfsLayer)) {
							this.wfsValidCount += 1;
							div.style.color = "green";
							div.innerHTML = "WFS is valid.";							
						}
						else {
							this.wfsNotValidCount += 1;
							div.style.color = "red";
							div.innerHTML = "WFS did not pass validation. " + wfsLayer + " is not available in the service." ;
						}
						
					}
					this.totalValidatedServicesCount += 1;
					if ((this.totalServicesCount > 0) && (this.totalValidatedServicesCount == this.totalServicesCount)) {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is finished. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
						this.servicesValidationDone = true;
					}
					else {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is in progress. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
					}
					
					if (this.wfsCount == this.wfsValidCount + this.wfsNotValidCount) {
						this.utils.setTextValue("wfsCountMessage", "Total WFS: " + this.wfsCount + " (valid: " + this.wfsValidCount + ", not valid: " + this.wfsNotValidCount + ").");
					}
					else {
						this.utils.setTextValue("wfsCountMessage", "Total WFS: " + this.wfsCount + " (valid: " + this.wfsValidCount + ", not valid: " + this.wfsNotValidCount + "). <span style='color: blue;'> Validating...</span>");
					}
					
					if (this.totalValidatedServicesCount < this.totalServicesCount) {
						this.currentValidateServiceNr += 1;
						this.validateRecord(this.validationPackage[this.currentValidateServiceNr]);
					}
				}),
				lang.hitch(this, function(error){
					this.wfsNotValidCount += 1;
					div.style.color = "red";
					if (error.message == "Timeout exceeded") {
						div.innerHTML = "WFS did not pass validation. Service didn't respond after 1 minute.";
					}
					else {
						div.innerHTML = "Validation did not work. Please contact administrator.";
					}
					
					this.totalValidatedServicesCount += 1;
					if ((this.totalServicesCount > 0) && (this.totalValidatedServicesCount == this.totalServicesCount)) {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is finished. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
						this.servicesValidationDone = true;
					}
					else {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is in progress. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
					}
					
					if (this.wfsCount == this.wfsValidCount + this.wfsNotValidCount) {
						this.utils.setTextValue("wfsCountMessage", "Total WFS: " + this.wfsCount + " (valid: " + this.wfsValidCount + ", not valid: " + this.wfsNotValidCount + ").");
					}
					else {
						this.utils.setTextValue("wfsCountMessage", "Total WFS: " + this.wfsCount + " (valid: " + this.wfsValidCount + ", not valid: " + this.wfsNotValidCount + "). <span style='color: blue;'> Validating...</span>");
					}
					
					if (this.totalValidatedServicesCount < this.totalServicesCount) {
						this.currentValidateServiceNr += 1;
						this.validateRecord(this.validationPackage[this.currentValidateServiceNr]);
					}
				})
			);
		},
		
		validateAgsForReport: function(div, agsUrl) {
			var url = "sc/ags/verify";
			var data = {
				"url": agsUrl
			};
			request.post(url, this.utils.createPostWithTimeoutRequestParams(data)).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.agsNotValidCount += 1;
						div.style.color = "red";
						div.innerHTML = "URL did not pass validation.";
					}
					else if (response.type == "success") {
						this.agsValidCount += 1;
						div.style.color = "green";
						div.innerHTML = "URL is valid.";	
					}
					this.totalValidatedServicesCount += 1;
					if ((this.totalServicesCount > 0) && (this.totalValidatedServicesCount == this.totalServicesCount)) {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is finished. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
						this.servicesValidationDone = true;
					}
					else {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is in progress. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
					}
					
					if (this.agsCount == this.agsValidCount + this.agsNotValidCount) {
						this.utils.setTextValue("agsCountMessage", "Total ARCGIS MAPSERVICES: " + this.agsCount + " (valid: " + this.agsValidCount + ", not valid: " + this.agsNotValidCount + ").");
					}
					else {
						this.utils.setTextValue("agsCountMessage", "Total ARCGIS MAPSERVICES: " + this.agsCount + " (valid: " + this.agsValidCount + ", not valid: " + this.agsNotValidCount + "). <span style='color: blue;'> Validating...</span>");
					}
					
					if (this.totalValidatedServicesCount < this.totalServicesCount) {
						this.currentValidateServiceNr += 1;
						this.validateRecord(this.validationPackage[this.currentValidateServiceNr]);
					}
				}),
				lang.hitch(this, function(error){
					this.agsNotValidCount += 1;
					div.style.color = "red";
					if (error.message == "Timeout exceeded") {
						div.innerHTML = "URL did not pass validation. Service didn't respond after 1 minute.";
					}
					else {
						div.innerHTML = "Validation did not work. Please contact administrator.";
					}
					
					this.totalValidatedServicesCount += 1;
					if ((this.totalServicesCount > 0) && (this.totalValidatedServicesCount == this.totalServicesCount)) {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is finished. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
						this.servicesValidationDone = true;
					}
					else {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is in progress. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
					}
					
					if (this.agsCount == this.agsValidCount + this.agsNotValidCount) {
						this.utils.setTextValue("agsCountMessage", "Total ARCGIS MAPSERVICES: " + this.agsCount + " (valid: " + this.agsValidCount + ", not valid: " + this.agsNotValidCount + ").");
					}
					else {
						this.utils.setTextValue("agsCountMessage", "Total ARCGIS MAPSERVICES: " + this.agsCount + " (valid: " + this.agsValidCount + ", not valid: " + this.agsNotValidCount + "). <span style='color: blue;'> Validating...</span>");
					}
					
					if (this.totalValidatedServicesCount < this.totalServicesCount) {
						this.currentValidateServiceNr += 1;
						this.validateRecord(this.validationPackage[this.currentValidateServiceNr]);
					}
				})
			);
		},
		
		validateDnlForReport: function(div, downloadUrl) {
			var url = "sc/dls/verify";
			var data = {
				"url": downloadUrl
			};
			request.post(url, this.utils.createPostWithTimeoutRequestParams(data)).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.dnlNotValidCount += 1;
						div.style.color = "red";
						div.innerHTML = "URL did not pass validation.";
					}
					else if (response.type == "success") {
						this.dnlValidCount += 1;
						div.style.color = "green";
						div.innerHTML = "URL is valid.";	
					}
					this.totalValidatedServicesCount += 1;
					if ((this.totalServicesCount > 0) && (this.totalValidatedServicesCount == this.totalServicesCount)) {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is finished. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
						this.servicesValidationDone = true;
					}
					else {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is in progress. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
					}
					
					if (this.dnlCount == this.dnlValidCount + this.dnlNotValidCount) {
						this.utils.setTextValue("dnlCountMessage", "Total DOWNLOADABLE RESOURCES: " + this.dnlCount + " (valid: " + this.dnlValidCount + ", not valid: " + this.dnlNotValidCount + ").");
					}
					else {
						this.utils.setTextValue("dnlCountMessage", "Total DOWNLOADABLE RESOURCES: " + this.dnlCount + " (valid: " + this.dnlValidCount + ", not valid: " + this.dnlNotValidCount + "). <span style='color: blue;'> Validating...</span>");
					}
					
					if (this.totalValidatedServicesCount < this.totalServicesCount) {
						this.currentValidateServiceNr += 1;
						this.validateRecord(this.validationPackage[this.currentValidateServiceNr]);
					}
				}),
				lang.hitch(this, function(error){
					this.dnlNotValidCount += 1;
					div.style.color = "red";
					if (error.message == "Timeout exceeded") {
						div.innerHTML = "URL did not pass validation. Service didn't respond after 1 minute.";
					}
					else {
						div.innerHTML = "Validation did not work. Please contact administrator.";
					}
					
					this.totalValidatedServicesCount += 1;
					if ((this.totalServicesCount > 0) && (this.totalValidatedServicesCount == this.totalServicesCount)) {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is finished. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
						this.servicesValidationDone = true;
					}
					else {
						this.utils.setTextValue("servicesValidationMessage", "Services validation is in progress. " + this.totalValidatedServicesCount + " out of " + this.totalServicesCount +" have been validated.");
					}
					
					if (this.dnlCount == this.dnlValidCount + this.dnlNotValidCount) {
						this.utils.setTextValue("dnlCountMessage", "Total DOWNLOADABLE RESOURCES: " + this.dnlCount + " (valid: " + this.dnlValidCount + ", not valid: " + this.dnlNotValidCount + ").");
					}
					else {
						this.utils.setTextValue("dnlCountMessage", "Total DOWNLOADABLE RESOURCES: " + this.dnlCount + " (valid: " + this.dnlValidCount + ", not valid: " + this.dnlNotValidCount + "). <span style='color: blue;'> Validating...</span>");
					}
					
					if (this.totalValidatedServicesCount < this.totalServicesCount) {
						this.currentValidateServiceNr += 1;
						this.validateRecord(this.validationPackage[this.currentValidateServiceNr]);
					}
				})
			);
		}
	});
});

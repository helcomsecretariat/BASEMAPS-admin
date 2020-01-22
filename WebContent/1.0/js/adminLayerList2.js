define([
	"dojo/_base/declare",
	"dojo",
	//"dojo/aspect",
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
	"dojo/store/Memory",
	"dijit/tree/ObjectStoreModel", 
	"dijit/Tree",
	//"dijit/tree/dndSource",
	"dijit/form/FilteringSelect",
	"dijit/form/CheckBox", 
	"dijit/Tooltip",
	"basemaps/js/utils",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/text!../templates/adminLayerList.html"
], function(
	declare,
	dojo,
	//aspect,
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
	Memory, 
	ObjectStoreModel, 
	Tree,
	//dndSource,
	FilteringSelect,
	checkBox, 
	Tooltip,
	utils,
	_WidgetBase, 
	_TemplatedMixin, 
	template
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "adminLayerList",
		map: null,
		utils: null,
		configLayers: null,
		tree: null,
		treeModel :null,
		store: null,
		data: null,
		dataFiltering: [{ id: "layerlist", leaf: false}],
		formsObj: null,
		userRole: null,
		userRights: null,
		rootLayerId: "layerlist",
		//currentObjId: null,
		currentWms: null,
		currentWmsId: null,
		currentHeader: "",
		treePath: [],
		uwms: [],
		uwfs: [],
		fwms: [],
		fwfs: [],
		constructor: function(params) {
			this.formsObj = params.forms;
			this.userRole = params.role;
			this.userRights = params.rights;
			this.utils = new utils();
			this.data = [{ id: this.rootLayerId, leaf: false}];
		},
    
		topCategoryButtonClick: function() {
			this.formsObj.currentObjId = null;
			this.formsObj.cleanAdminForm();
			this.utils.show("addRootCategoryForm", "block");
			this.formsObj.setupMetadataFormatSelector(this.formsObj.addRootCategoryMetadataFormatSelect);
		},
		
		summaryButtonClick: function() {
			this.formsObj.currentObjId = null;
			this.formsObj.cleanAdminForm();
			this.utils.show("summaryForm", "block");
			this.formsObj.getSummary();
		},
		
		validateServicesButtonClick: function() {
			this.formsObj.currentObjId = null;
			this.formsObj.cleanAdminForm();
			this.utils.show("validateServicesForm", "block");
			this.formsObj.validateAllServices();
		},
		
		refreshButtonClick: function() {
			this.refreshLayerList(this.formsObj.currentObjId);
			//this.getWmsIds();
			//this.getWfsIds();
		},
		
		/*getWmsIds: function() {
			var url = "sc/wms/all-ids";
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log(response);
						// TODO: popup box message
					}
					else if (response.type == "success") {
						array.forEach(response.item, lang.hitch(this, function(id) {
							this.updateWmsInfo(id);
						}));
					}
				}),
				lang.hitch(this, function(error){
					alert("Something went wrong (on wms/all-ids). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		getWfsIds: function() {
			var url = "sc/wfs/all-ids";
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log(response);
						// TODO: popup box message
					}
					else if (response.type == "success") {
						array.forEach(response.item, lang.hitch(this, function(id) {
							this.updateWfsInfo(id);
						}));
					}
				}),
				lang.hitch(this, function(error){
					alert("Something went wrong (on wfs/all-ids). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		updateWmsInfo: function(id) {
			var url = "sc/wms/update-info/"+id;
			request.post(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log("WMS Failed", id, response);
						this.fwms.push(id);
						console.log("WMS Failed array", this.fwms);
						// TODO: popup box message
					}
					else if (response.type == "success") {
						console.log("WMS Updated", id, response);
						this.uwms.push(id);
						console.log("WMS Updated array", this.uwms);
					}
				}),
				lang.hitch(this, function(error) {
					alert("Something went wrong (on wms/update-info/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		updateWfsInfo: function(id) {
			var url = "sc/wfs/update-info/"+id;
			request.post(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log("WFS Failed", id, response);
						this.fwfs.push(id);
						console.log("WFS Failed array", this.fwfs);
						// TODO: popup box message
					}
					else if (response.type == "success") {
						console.log("WFS Updated", id, response);
						this.uwfs.push(id);
						console.log("WFS Updated array", this.uwfs);
					}
				}),
				lang.hitch(this, function(error) {
					alert("Something went wrong (on wfs/update-info/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},*/
	
		postCreate: function() {
			
			this.getLayersData();
			
			/* --- MANAGE CATEGORY SAVE BUTTONS START --- */
			
			// --- save root category
			on(this.formsObj.saveRootCategory, "click", lang.hitch(this, function() {
				var catLabel = this.utils.getInputValue("addRootCategoryLabelInput").trim();
				var catHelcomId = this.utils.getInputValue("addRootCategoryHelcomIdInput").trim();
				var catMetadataUrl = this.utils.getInputValue("addRootCategoryMetadataUrlInput").trim();
				if (validate.isText(catLabel)) {
					var newCategory = {
						"label": catLabel,
						"helcomMetadata": catHelcomId,
						"metaData": []
					};
					if (catMetadataUrl.length > 0 ) {
						newCategory.metaData.push({
							"format": this.formsObj.metadataFormatSelector.get("value"),
							"url": catMetadataUrl,
							"source": "PROVIDED"
						});
					}
					this.saveCategory(newCategory, "ADD_ROOTCATEGORY");
				}
				else {
					this.formsObj.showMessage("Category label is not valid.");
				}
			}));
			
			// --- save category info
			on(this.formsObj.saveCategoryLabel, "click", lang.hitch(this, function() {
				this.formsObj.currentCategory.label = this.utils.getInputValue("categoryLabelInput").trim();
				this.updateCurrentCategory(null);
				
				this.utils.setTextValue("categoryLabel", this.utils.getInputValue("categoryLabelInput").trim());
				this.formsObj.cleanCategoryLabel();
			}));
			
			on(this.formsObj.saveHelcomCatalogueId, "click", lang.hitch(this, function() {
				this.formsObj.currentCategory.helcomMetadata = this.utils.getInputValue("helcomCatalogueIdInput").trim();
				this.updateCurrentCategory(null);
				
				if (this.utils.getInputValue("helcomCatalogueIdInput").trim().length === 0) {
					this.utils.setTextValue("helcomCatalogueId", "Not assigned");
				}
				else {
					this.utils.setTextValue("helcomCatalogueId", this.utils.getInputValue("helcomCatalogueIdInput").trim());
				}
				this.formsObj.cleanHelcomCatalogueId();
			}));
			
			on(this.formsObj.saveCategoryMetadataLink, "click", lang.hitch(this, function() {
				var metadataUrl = this.utils.getInputValue("categoryMetadataLinkInput").trim();
				//if (validate.isUrl(metadataUrl)) {
				var newMetadata = {
					"parent": this.formsObj.currentObjId,
					"source": "PROVIDED",
					"format": "UNKNOWN",
					"url": metadataUrl
				};
				this.formsObj.currentCategory.metaData[0] = newMetadata;
				this.updateCurrentCategory();
				
				if (this.utils.getInputValue("categoryMetadataLinkInput").trim().length === 0) {
					this.utils.setTextValue("categoryMetadataLink", "Not assigned");
				}
				else {
					this.utils.setTextValue("categoryMetadataLink", this.utils.getInputValue("categoryMetadataLinkInput").trim());
				}
				
				this.formsObj.cleanCategoryMetadataLink();
				//}
				//else {
				//	this.formsObj.showMessage("Metadata url is not valid.");
				//}
			}));
			
			// --- save metadata
			on(this.formsObj.saveMetadata, "click", lang.hitch(this, function() {
				var metadataUrl = this.utils.getInputValue("metadataUrlInput").trim();
				console.log(metadataUrl);
				//if (validate.isUrl(metadataUrl)) {
				var newMetadata = {
					"parent": this.formsObj.currentObjId,
					"source": "PROVIDED",
					"format": this.formsObj.metadataFormatSelector.get("value"),
					"url": metadataUrl
				};
				this.formsObj.currentCategory.metaData.push(newMetadata);
				this.updateCurrentCategory("NEW_METADATA");
				//this.refreshLayerList(this.formsObj.currentObjId);
				
				this.formsObj.cleanMetadataAddForm();
				//}
				//else {
				//	this.formsObj.showMessage("Metadata url is not valid.");
				//}
			}));
			
			// --- save category
			on(this.formsObj.saveCategory, "click", lang.hitch(this, function() {
				var catLabel = this.utils.getInputValue("addCategoryLabelInput").trim();
				var catHelcomId = this.utils.getInputValue("addCategoryHelcomIdInput").trim();
				var catMetadataUrl = this.utils.getInputValue("addCategoryMetadataUrlInput").trim();
				if (validate.isText(catLabel)) {
					var newCategory = {
						"parent": this.formsObj.currentObjId,
						"label": catLabel,
						"helcomMetadata": catHelcomId,
						"metaData": []
					};
					if (catMetadataUrl.length > 0 ) {
						newCategory.metaData.push({
							"format": this.formsObj.metadataFormatSelector.get("value"),
							"url": catMetadataUrl,
							"source": "PROVIDED"
						});
					}
					this.saveCategory(newCategory, "ADD_SUBCATEGORY");
				}
				else {
					this.formsObj.showMessage("Category label is not valid.");
				}
			}));
			
			// --- save wms
			on(this.formsObj.saveWms, "click", lang.hitch(this, function() {
				var wmsUrl = this.utils.getInputValue("wmsUrlInput").trim();
				var wmsName = null;
				if (this.formsObj.wmsValidationPassed) {
					wmsName = this.formsObj.wmsNameSelector.get("value");
				}
				else {
					wmsName = this.utils.getInputValue("wmsNameInput").trim();
				}
				var wmsLabel = this.utils.getInputValue("wmsLabelInput").trim();
				var wmsHemcomId = this.utils.getInputValue("wmsHelcomIdInput").trim();
				if ((validate.isText(wmsName)) && (validate.isText(wmsLabel))) {
					var newWms = {
						"parent": this.formsObj.currentObjId,
						"label": wmsLabel,
						"helcomId": wmsHemcomId,
						"wmsUrl": wmsUrl,
						"wmsName": wmsName
					};
					this.saveCategoryForService(newWms, "NEW_WMS");
				}
				else {
					this.formsObj.showMessage("Wms layer name or label is not valid.");
				}
			}));
			
			// --- save wfs
			on(this.formsObj.saveWfs, "click", lang.hitch(this, function() {
				var wfsUrl = this.utils.getInputValue("wfsUrlInput").trim();
				var wfsName = null;
				if (this.formsObj.wfsValidationPassed) {
					wfsName = this.formsObj.wfsNameSelector.get("value");
				}
				else {
					wfsName = this.utils.getInputValue("wfsNameInput").trim();
				}
				var wfsLabel = this.utils.getInputValue("wfsLabelInput").trim();
				var wfsHemcomId = this.utils.getInputValue("wfsHelcomIdInput").trim();
				if ((validate.isText(wfsName)) && (validate.isText(wfsLabel))) {
					var newWfs = {
						"parent": this.formsObj.currentObjId,
						"label": wfsLabel,
						"helcomId": wfsHemcomId,
						"wfsUrl": wfsUrl,
						"wfsName": wfsName
					};
					this.saveCategoryForService(newWfs, "NEW_WFS");
				}
				else {
					this.formsObj.showMessage("Wfs feature type name or label is not valid.");
				}
			}));
			
			// --- save download
			on(this.formsObj.saveDownload, "click", lang.hitch(this, function() {
				if (this.formsObj.downloadValidationPassed) {
					var downloadUrl = this.utils.getInputValue("downloadUrlInput").trim();
					var downloadLabel = this.utils.getInputValue("downloadLabelInput").trim();
					var downloadHemcomId = this.utils.getInputValue("downloadHelcomIdInput").trim();
					if (validate.isText(downloadLabel)) {
						var newDownload = {
							"parent": this.formsObj.currentObjId,
							"label": downloadLabel,
							"helcomId": downloadHemcomId,
							"downloadUrl": downloadUrl
						};
						this.saveCategoryForService(newDownload, "NEW_DOWNLOAD");
					}
					else {
						this.formsObj.showMessage("Label is not valid.");
					}
				}
				else {
					this.formsObj.showMessage("URL is not valid.");
				}
			}));
			
			// --- save ArcGIS
			on(this.formsObj.saveArcgis, "click", lang.hitch(this, function() {
				if (this.formsObj.arcgisValidationPassed) {
					var arcgisUrl = this.utils.getInputValue("arcgisUrlInput").trim();
					var arcgisLabel = this.utils.getInputValue("arcgisLabelInput").trim();
					var arcgisHemcomId = this.utils.getInputValue("arcgisHelcomIdInput").trim();
					if (validate.isText(arcgisLabel)) {
						var newArcgis = {
							"parent": this.formsObj.currentObjId,
							"label": arcgisLabel,
							"helcomId": arcgisHemcomId,
							"arcgisUrl": arcgisUrl
						};
						this.saveCategoryForService(newArcgis, "NEW_ARCGIS");
					}
					else {
						this.formsObj.showMessage("Label is not valid.");
					}
				}
				else {
					this.formsObj.showMessage("URL is not valid.");
				}
			}));
			/* --- MANAGE CATEGORY SAVE BUTTONS END --- */
		},
    
		getTreePath: function(id) {
			while (this.store.get(id).parent) {
				this.treePath.unshift(id);
				id = this.store.get(id).parent;
			}
			this.treePath.unshift(this.rootLayerId);
		},
		
		refreshLayerList: function(highlightId = null) {
			delete this.store;
			this.treeModel.destroy();
			this.tree.destroy();
			domConstruct.empty(this.adminLayerListTree);
			this.data = [{ id: this.rootLayerId, leaf: false}];
			this.getLayersData(highlightId);
		},
    		
		updateCurrentCategory: function(mode) {
			var url = "sc/categories/update";
			request.post(url, this.utils.createPostRequestParams(this.formsObj.currentCategory)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to update layer.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("Category updated.");
						if(mode === "NEW_METADATA") {
							this.formsObj.cleanMetadataDisplayForm();
							this.formsObj.displayMetadata(this.formsObj.currentCategory.metaData);
						}
					}
					this.refreshLayerList(this.formsObj.currentObjId);
				}),
				lang.hitch(this, function(error) {
					this.formsObj.showMessage("Something went wrong (on categories/update). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		saveCategory: function(data, mode) {
			var url = "sc/categories/add";
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to add category.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("Category added.");
						
						if (mode == "ADD_SUBCATEGORY") {
							this.refreshLayerList(this.formsObj.currentObjId);
							/*console.log(this.formsObj.currentObjId);
							var categoryForDisplay = {
								"id": response.item,
								"label": data.label,
								"helcomId": data.helcomMetadata
							};
							this.formsObj.currentCategoryCategories.unshift(categoryForDisplay);
							
							this.formsObj.cleanCategoryAddForm();
							this.formsObj.cleanCategoryDisplayForm();
							//this.formsObj.displayCategories(this.formsObj.currentCategoryCategories);
							this.formsObj.displayCategories();*/
						}
						else if (mode == "ADD_ROOTCATEGORY") {
							this.refreshLayerList();
							this.formsObj.cleanRootCategoryAddForm();
						}
					}
				}),
				lang.hitch(this, function(error) {
					this.formsObj.action = null;
					this.formsObj.showMessage("Something went wrong (on categories/add). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		saveCategoryForService: function(values, mode) {
			var url = "sc/categories/add";
			var data = {
				"parent": values.parent,
				"label": values.label,
				"helcomMetadata": values.helcomId
			};
			
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to add service.");
					}
					else if (response.type == "success") {
						if (mode === "NEW_WMS") {
							var newWms = {
								"parent": response.item,
								"name": values.wmsName,
								"url": values.wmsUrl,
								"label": values.label
							};
							this.saveWms(newWms);
						}
						else if (mode === "NEW_WFS") {
							var newWfs = {
								"parent": response.item,
								"name": values.wfsName,
								"url": values.wfsUrl,
								"label": values.label
							};
							this.saveWfs(newWfs);
						}
						else if (mode === "NEW_DOWNLOAD") {
							var newDownload = {
								"parent": response.item,
								"url": values.downloadUrl,
								"label": values.label
							};
							this.saveDownload(newDownload);
						}
						else if (mode === "NEW_ARCGIS") {
							var newArcgis = {
								"parent": response.item,
								"url": values.arcgisUrl,
								"label": values.label
							};
							this.saveArcgis(newArcgis);
						}
					}
				}),
				lang.hitch(this, function(error) {
					this.formsObj.action = null;
					this.formsObj.showMessage("Something went wrong (on categories/add). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		saveWms: function(data) {
			var url = "sc/wms/add";
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log(response);
						this.formsObj.showMessage("Failed to add WMS.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("WMS added.");
						this.refreshLayerList(this.formsObj.currentObjId);
					}
				}),
				lang.hitch(this, function(error) {
					this.refreshLayerList();
					this.formsObj.showMessage("Something went wrong (on wms/add). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		saveWfs: function(data) {
			var url = "sc/wfs/add";
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log(response);
						this.formsObj.showMessage("Failed to add WFS.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("WFS added.");
						this.refreshLayerList(this.formsObj.currentObjId);
					}
				}),
				lang.hitch(this, function(error) {
					this.refreshLayerList();
					this.formsObj.showMessage("Something went wrong (on wfs/add). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		saveDownload: function(data) {
			var url = "sc/dls/add";
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to add Downloadable resource.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("Downloadable resource added.");
						this.refreshLayerList(this.formsObj.currentObjId);
					}
				}),
				lang.hitch(this, function(error) {
					this.refreshLayerList();
					this.formsObj.showMessage("Something went wrong (on dls/add). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		saveArcgis: function(data) {
			var url = "sc/ags/add";
			console.log("saveArcgis", data);
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						//console.log(response);
						this.formsObj.showMessage("Failed to add ArcGIS service.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("ArcGIS service added.");
						this.refreshLayerList(this.formsObj.currentObjId);
					}
				}),
				lang.hitch(this, function(error) {
					this.refreshLayerList();
					this.formsObj.showMessage("Something went wrong (on dls/add). Please contact administrator.");
					console.log(error);
				})
			);
		},
				
		changeCategoryPosition: function(pos) {
			console.log(pos);
			var url = "sc/categories/position/"+this.formsObj.currentObjId+"/"+pos;
			this.getTreePath(this.store.get(this.formsObj.currentObjId).parent);
			request.post(url, this.utils.createPostRequestParams({})).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to change layer's position.");
					}
					else if (response.type == "success") {
						this.refreshLayerList();
					}
				}),
				lang.hitch(this, function(error){
					this.formsObj.showMessage("Something went wrong (on categories/position/{id}/{pos}). Please contact administrator.");
					console.log(error);
				})
			);
		},
	
		cleanUp: function() {
			this.formsObj.cleanAdminForm();
			this.userRole = null;
			this.userRights = null;
			this.formsObj.currentObjId = null;
			this.currentWms = null;
			this.currentWmsId = null;
			this.currentHeader = "";
			this.treePath = [];
			this.tree.collapseAll();
			
			delete this.store;
			this.treeModel.destroy();
			this.tree.destroy();
			domConstruct.empty(this.adminLayerListTree);
			this.data = [{ id: this.rootLayerId, leaf: false}];
		},
		
		setUser: function(role, rights) {
			this.userRole = role;
			this.userRights = rights;
			if (role == "ADMIN") {
				this.utils.show("topCategoryButton", "inline-block");
				this.utils.show("summaryButton", "inline-block");
				this.utils.show("validateServicesButton", "inline-block");
			}
			else {
				this.utils.show("topCategoryButton", "none");
				this.utils.show("summaryButton", "none");
				this.utils.show("validateServicesButton", "none");
			}
		},
		
		destroy: function() {
			
		},
    
		getLayersData: function(highlightId) {
			var url = "sc/categories/tree";
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						console.log(response);
						// TODO: popup box message
					}
					else if (response.type == "success") {
						if (this.userRole == "ADMIN") {
							this.utils.show("topCategoryButton", "inline-block");
							this.utils.show("summaryButton", "inline-block");
							this.utils.show("validateServicesButton", "inline-block");
						}
						else {
							this.utils.show("topCategoryButton", "none");
							this.utils.show("summaryButton", "none");
							this.utils.show("validateServicesButton", "none");
						}
						this.formsObj.tree = response.item;
						this.createTree(response.item);
						if (highlightId != null) {
							this.getTreePath(highlightId)
							
							var item = this.data.find(x => x.id === highlightId);
							this.formsObj.setupManageEditForm(item);
						}
						if (this.treePath.length > 0) {
							this.tree.set('paths', [this.treePath]).then(lang.hitch(this, function(path) {
								if(!this.tree.selectedNode.isExpanded){
									this.tree._expandNode(this.tree.selectedNode);
								}
								this.treePath = [];
							}));
						}
					}
				}),
				lang.hitch(this, function(error){
					alert("Something went wrong (on categories/tree). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		getLabelsFromRoot: function(id) {
			var storeElem = this.store.query({id: id})[0];
			var part = storeElem.name + " -> ";
			this.currentHeader = part.concat(this.currentHeader);
			if (storeElem.parent != this.rootLayerId) {
				this.getLabelsFromRoot(storeElem.parent);
			}
		},

		/*addLayerToDataArray: function(layer, parentLayerId, last, editMode, movableForProvider) {
			
			var lyr = {
				id: layer.id.toString(),
				parent: parentLayerId,
				name: layer.label,
				helcomId: layer.helcomMetadata,
				position: layer.position,
				lastPos: last,
				type: null,
				editMode: editMode,
				movableForProvider: movableForProvider,
				wms: null,
				wfs: null,
				metadata: layer.metadata,
				children: layer.layers
			};
			var movableChildren = movableForProvider;
			if (!editMode) {
				if (this.userRights.includes(layer.id)) {
					lyr.editMode = true;
					movableChildren = true;
				}
			}
			
			if ((layer.wmses) && (layer.wmses[0])) {
				lyr.wms = layer.wmses[0];
				lyr.type = "WMS";
			}
			if ((layer.wfses) && (layer.wfses[0])) {
				lyr.wfs = layer.wfses[0];
				lyr.type = "WFS";
			}
			if (layer.layers) {
				lyr.type = "CATEGORY";
			}
						
			this.data.push(lyr);
			//if (!lyr.leaf) {
			if (lyr.type == "CATEGORY") {
				this.dataFiltering.push(lyr);
				array.forEach(layer.layers, lang.hitch(this, function(l){
					if (l.position === layer.layers.length) {
						this.addLayerToDataArray(l, layer.id.toString(), true, lyr.editMode, movableChildren);
					}
					else {
						this.addLayerToDataArray(l, layer.id.toString(), false, lyr.editMode, movableChildren);
					}
				}));
			}
		},*/

		createDataRecord: function(record) {
			this.data.push(record);
			if (record.type == "CATEGORY") {
				//this.dataFiltering.push(lyr);
				array.forEach(record.layers, lang.hitch(this, function(layer) {
					this.createDataRecord(layer);
				}));
			}
		},
		
		createDataArray: function(input) {
			/*var editMode = false;
			if (this.userRole == "ADMIN") {
				editMode = true;
			}*/
			
			array.forEach(input, lang.hitch(this, function(record){
				this.createDataRecord(record);
				
				/*if (record.position === input.length) {
					this.addLayerToDataArray(record, this.rootLayerId, true, editMode, false);
				}
				else {
					this.addLayerToDataArray(record, this.rootLayerId, false, editMode, false);
				}*/
			}));
		},
		
		improveTreeRecord: function(layer, parentLayerId, last, editMode, movableForProvider, header) {
			layer.id = layer.id.toString();
			layer.parent = parentLayerId;
			layer.name = layer.label;
			layer.helcomId = layer.helcomMetadata;
			layer.lastPos = last;
			layer.type = null;
			layer.editMode = editMode;
			layer.movableForProvider = movableForProvider;
			layer.wms = null;
			layer.wfs = null;
			layer.download = null;
			layer.arcgis = null;
			layer.metadata = layer.metadata;
			layer.header = null;
			
			var movableChildren = movableForProvider;
			if (!editMode) {
				if (this.userRights.includes(layer.id)) {
					layer.editMode = true;
					movableChildren = true;
				}
			}
			
			if (header == null) {
				layer.header = layer.label;
			}
			else {
				layer.header = header + " -> " + layer.label;
			}
			
			if ((layer.wmses) && (layer.wmses[0])) {
				layer.wms = layer.wmses[0];
				layer.type = "WMS";
			}
			
			if ((layer.wfses) && (layer.wfses[0])) {
				layer.wfs = layer.wfses[0];
				layer.type = "WFS";
			}
			
			if ((layer.others) && (layer.others[0])) {
				if (layer.others[0].type == "DOWNLOAD") {
					layer.download = layer.others[0];
					layer.type = "DOWNLOAD";
				}
				else if (layer.others[0].type == "ARCGIS") {
					layer.arcgis = layer.others[0];
					layer.type = "ARCGIS";
				}
			}
			
			if (layer.layers) {
				layer.type = "CATEGORY";
			}
						
			if (layer.type == "CATEGORY") {
				layer.layers.sort(this.comparePosition);
				array.forEach(layer.layers, lang.hitch(this, function(l){
					if (l.position === layer.layers.length) {
						this.improveTreeRecord(l, layer.id.toString(), true, layer.editMode, movableChildren, layer.header);
					}
					else {
						this.improveTreeRecord(l, layer.id.toString(), false, layer.editMode, movableChildren, layer.header);
					}
				}));
			}
		},
		
		improveTreeInput: function(input) {
			var editMode = false;
			if (this.userRole == "ADMIN") {
				editMode = true;
			}
			
			input.sort(this.comparePosition);
			array.forEach(input, lang.hitch(this, function(record){
				if (record.position === input.length) {
					this.improveTreeRecord(record, this.rootLayerId, true, editMode, false, null);
				}
				else {
					this.improveTreeRecord(record, this.rootLayerId, false, editMode, false, null);
				}
			}));
		},
		
		comparePosition: function(a,b) {
			if (a.position < b.position)
				return -1;
			if (a.position > b.position)
				return 1;
			return 0;
		},
		
		createTree: function(input) {
			var that = this;
			this.improveTreeInput(input);
			this.createDataArray(input);
			
			this.store = new Memory({
				data: this.data,
				getChildren: function(object) {
					return this.query({parent: object.id});
				}
			});
			
			/*aspect.around(this.store, "put", lang.hitch(this, function(originalPut){
		        return function(obj, options){
		            if(options && options.parent){
		                obj.parent = options.parent.id;
		            }
		            return originalPut.call(this.store, obj, options);
		        }
		    }));*/
			
			this.treeModel = new ObjectStoreModel({
				store: this.store,
				query: {id: this.rootLayerId}
			});

			this.tree = new Tree({
				model: this.treeModel,
				//dndController: dndSource,
				showRoot: false,
				getIconClass:function(item, opened) {
				
				},
				getNodeFromItem: function (id) {
					return this._itemNodesMap[ id ][0];
				},

				_createTreeNode: function(args) {
					var tnode = new dijit._TreeNode(args);
					tnode.labelNode.innerHTML = args.label;
          
					var toolsContainer = domConstruct.create("div", { "class": "treeNodeToolsContainer" }, tnode.contentNode, "last");
          
					if (!tnode.item.lastPos) {
						if ((that.userRole == "ADMIN") || ((that.userRole == "PROVIDER") && (tnode.item.movableForProvider))) {
							var downButton = domConstruct.create("div", { "class": "downButton" }, toolsContainer, "last");
							new Tooltip({
								connectId: [downButton],
								showDelay: 10,
								position: ["below"],
								label: "Move down"
							});

							on(downButton, "click", function() {
								//that.formsObj.formCleanUp();
								that.formsObj.currentObjId = tnode.item.id;
								that.changeCategoryPosition(tnode.item.position+1);
							});
						}
					}
          
					if (tnode.item.position > 1) {
						if ((that.userRole == "ADMIN") || ((that.userRole == "PROVIDER") && (tnode.item.movableForProvider))) {
							var upButton = domConstruct.create("div", { "class": "upButton" }, toolsContainer, "last");
							new Tooltip({
								connectId: [upButton],
								showDelay: 10,
								position: ["below"],
								label: "Move up"
							});

							on(upButton, "click", function() {
								//that.formsObj.formCleanUp();
								that.formsObj.currentObjId = tnode.item.id;
								that.changeCategoryPosition(tnode.item.position-1);
							});
						}
					}
					
					if (tnode.item.type == "CATEGORY") {
						if (that.userRole == "ADMIN") {
							var userButton = domConstruct.create("div", { "class": "userButton" }, toolsContainer, "last");
							new Tooltip({
								connectId: [userButton],
								showDelay: 10,
								position: ["below"],
								label: "Add user"
							});

							on(userButton, "click", function() {
								that.formsObj.cleanAdminForm();
								
								that.formsObj.currentObjId = tnode.item.id;
								that.currentHeader = tnode.item.name + " -> Manage users";
								
								if (tnode.item.parent != that.rootLayerId) {
									that.getLabelsFromRoot(tnode.item.parent);
								}
								that.getProviders(tnode.item);
								that.formsObj.getCurrentCategory();
							});
						}
					}
						
					if (tnode.item.type == "WMS") {
						domConstruct.destroy(tnode.expandoNode);
						domStyle.set(tnode.labelNode, {"color": "green", "width": "80%"});
					}
					else if (tnode.item.type == "WFS") {
						domConstruct.destroy(tnode.expandoNode);
						domStyle.set(tnode.labelNode, {"color": "blue", "width": "80%"});
					}
					else if (tnode.item.type == "DOWNLOAD") {
						domConstruct.destroy(tnode.expandoNode);
						domStyle.set(tnode.labelNode, {"color": "orange", "width": "80%"});
					}
					else if (tnode.item.type == "ARCGIS") {
						domConstruct.destroy(tnode.expandoNode);
						domStyle.set(tnode.labelNode, {"color": "purple", "width": "80%"});
					}
					else if (tnode.item.type == "CATEGORY") {
						var rowNodePadding = domStyle.get(tnode.rowNode, "padding-left");
						var labelNodeWidth = 300 - rowNodePadding;
						domStyle.set(tnode.labelNode, {"width": labelNodeWidth+"px"});
					}
					
					if (tnode.item.editMode) {
						var editCategoryButton = domConstruct.create("div", { "class": "editButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [editCategoryButton],
							showDelay: 10,
							position: ["below"],
							label: "View or edit"
						});

						on(editCategoryButton, "click", function() {
							
							that.formsObj.setupManageEditForm(tnode.item);
							
							/*if (tnode.item.type == "CATEGORY") {
								that.currentHeader = tnode.item.name + " -> Manage category";
								that.setupDisplayCategories(tnode.item.children);
								that.setupDisplayWmses(tnode.item.children);
							}
							else if (tnode.item.type == "WMS") {
								that.currentHeader = tnode.item.name + " -> Manage WMS";
								console.log("WMS", tnode.item);
							}
							else if (tnode.item.type == "WFS") {
								that.currentHeader = tnode.item.name + " -> Manage WFS";
							}
							
							if (tnode.item.parent != that.rootLayerId) {
								that.getLabelsFromRoot(tnode.item.parent);
							}
													
							//console.log(tnode.item.children);
							that.formsObj.setupManageCategoryForm(tnode.item, that.formsObj.currentCategoryCategories, that.formsObj.currentCategoryWmses, that.currentHeader);*/
							
						});
					}
					else {
						var viewCategoryButton = domConstruct.create("div", { "class": "viewButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [viewCategoryButton],
							showDelay: 10,
							position: ["below"],
							label: "View"
						});

						on(viewCategoryButton, "click", function() {
							that.formsObj.setupManageEditForm(tnode.item);
							/*that.formsObj.cleanAdminForm();
							
							that.formsObj.currentObjId = tnode.item.id;
							if (tnode.item.type == "CATEGORY") {
								that.currentHeader = tnode.item.name;
								that.setupDisplayCategories(tnode.item.children);
								that.setupDisplayWmses(tnode.item.children);
							}
							else if (tnode.item.type == "WMS") {
								that.currentHeader = tnode.item.name + " -> Manage WMS";
								console.log("WMS", tnode.item);
							}
							else if (tnode.item.type == "WFS") {
								that.currentHeader = tnode.item.name + " -> Manage WFS";
							}
							
							if (tnode.item.parent != that.rootLayerId) {
								that.getLabelsFromRoot(tnode.item.parent);
							}
													
							//console.log(tnode.item.children);
							that.formsObj.setupManageCategoryForm(tnode.item, that.formsObj.currentCategoryCategories, that.formsObj.currentCategoryWmses, that.currentHeader);
							that.formsObj.getCurrentCategory();*/
						});
					}
										
					on(tnode.rowNode, mouse.enter, function(){
						domStyle.set(toolsContainer, {"display": "block"});
					});
					on(tnode.rowNode, mouse.leave, function(){
						domStyle.set(toolsContainer, {"display": "none"});
					});
										
					return tnode;
				}
			});
			this.tree.placeAt(this.adminLayerListTree);
			this.tree.startup();
		},
		
		setupDisplayWmses: function(layers) {
			//console.log(layers);
			this.formsObj.currentCategoryWmses = [];
			array.forEach(layers, lang.hitch(this, function(layer) {
				if ((layer.wmses) && (layer.wmses[0])) {
					var wms = {
						serviceCatId: layer.id,
						label: layer.label,
						name: layer.wmses[0].name,
						url: layer.wmses[0].url
					};
					this.formsObj.currentCategoryWmses.push(wms);
				}
			}));
		},
		
		setupDisplayCategories: function(layers) {
			this.formsObj.currentCategoryCategories = [];
			array.forEach(layers, lang.hitch(this, function(layer) {
				if (layer.layers) {
					var category = {
						id: layer.id,
						label: layer.label,
						helcomId: layer.helcomMetadata
					};
					this.formsObj.currentCategoryCategories.push(category);
				}
			}));
		},
		
		getProviders: function(layer) {
			var url = "sc/users/list/PROVIDER";
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to retrieve category users.");
					}
					else if (response.type == "success") {
						this.formsObj.setupCategoryUsersForm(layer, this.currentHeader, response.item);
					}
				}),
				lang.hitch(this, function(error) {
					alert("Something went wrong (on users/list/{role}). Please contact administrator.");
					console.log(error);
				})
			);
		}
	});
});
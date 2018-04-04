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
		legendInfo: {},
		metadataIDS: {},
		identify: {},
		visitedNodesIds: {},
		formsObj: null,
		rootLayerId: "layerlist",
		currentObjId: null,
		currentWms: null,
		currentWmsId: null,
		currentHeader: "",
		treePath: [],
		constructor: function(params) {
			this.formsObj = params.forms;
			this.utils = new utils();
			this.data = [{ id: this.rootLayerId, leaf: false}];
		},
    
		topCategoryButtonClick: function() {
			this.currentObjId = null;
			this.formsObj.manageCategoryCloseButtonClick();
			//this.formsObj.formCleanUp();
			//this.formsObj.setupAddCategoryForm("Add root layer");
		},
		
		refreshButtonClick: function() {
			this.refreshLayerList(this.currentObjId);
		},
	
		postCreate: function() {
			this.getLayersData();
			
			/* --- MANAGE CATEGORY SAVE BUTTONS START --- */
			
			// --- save category info
			on(this.formsObj.saveCategoryLabel, "click", lang.hitch(this, function() {
				this.formsObj.currentCategory.label = this.utils.getInputValue("categoryLabelInput").trim();
				this.updateCurrentCategory(null);
				this.refreshLayerList(this.currentObjId);
				
				this.utils.setTextValue("categoryLabel", this.utils.getInputValue("categoryLabelInput").trim());
				this.formsObj.cleanCategoryLabel();
			}));
			
			on(this.formsObj.saveHelcomCatalogueId, "click", lang.hitch(this, function() {
				this.formsObj.currentCategory.helcomMetadata = this.utils.getInputValue("helcomCatalogueIdInput").trim();
				this.updateCurrentCategory(null);
				this.refreshLayerList(this.currentObjId);
				
				if (this.utils.getInputValue("helcomCatalogueIdInput").trim().length === 0) {
					this.utils.setTextValue("helcomCatalogueId", "Not assigned");
				}
				else {
					this.utils.setTextValue("helcomCatalogueId", this.utils.getInputValue("helcomCatalogueIdInput").trim());
				}
				this.formsObj.cleanHelcomCatalogueId();
			}));
			
			// --- save metadata
			on(this.formsObj.saveMetadata, "click", lang.hitch(this, function() {
				var metadataUrl = this.utils.getInputValue("metadataUrlInput").trim();
				if (validate.isUrl(metadataUrl)) {
					var newMetadata = {
						"parent": this.currentObjId,
						"source": "PROVIDED",
						"format": this.formsObj.metadataFormatSelector.get("value"),
						"url": metadataUrl
					};
					this.formsObj.currentCategory.metaData.push(newMetadata);
					this.updateCurrentCategory("NEW_METADATA");
					this.refreshLayerList(this.currentObjId);
					
					this.formsObj.cleanMetadataAddForm();
				}
				else {
					this.formsObj.showMessage("Metadata url is not valid.");
				}
			}));
			
			// --- save category
			on(this.formsObj.saveCategory, "click", lang.hitch(this, function() {
				var catLabel = this.utils.getInputValue("addCategoryLabelInput").trim();
				var catHelcomId = this.utils.getInputValue("addCategoryHelcomIdInput").trim();
				var catMetadataUrl = this.utils.getInputValue("addCategoryMetadataUrlInput").trim();
				if (validate.isText(catLabel)) {
					var newCategory = {
						"parent": this.currentObjId,
						"label": catLabel,
						"helcomMetadata": catHelcomId,
						"metaData": []
					};
					if ((catMetadataUrl.length > 0 ) && (validate.isUrl(catMetadataUrl))) {
						newCategory.metaData.push({
							"format": this.formsObj.metadataFormatSelector.get("value"),
							"url": catMetadataUrl,
							"source": "PROVIDED"
						});
					}
					this.saveCategory(newCategory);
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
						"parent": this.currentObjId,
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
						this.formsObj.currentCategory = response.item;
					}
				}),
				lang.hitch(this, function(error) {
					alert("Something went wrong (on categories/get/{id}). Please contact administrator.");
					console.log(error);
				})
			);
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
					this.refreshLayerList(this.currentObjId);
				}),
				lang.hitch(this, function(error) {
					this.formsObj.showMessage("Something went wrong (on categories/update). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		saveCategory: function(data) {
			var url = "sc/categories/add";
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to add category.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("Category added.");
						this.refreshLayerList(this.currentObjId);
						
						var categoryForDisplay = {
							"id": response.item,
							"label": data.label,
							"helcomId": data.helcomMetadata
						};
						this.formsObj.currentCategoryCategories.unshift(categoryForDisplay);
						
						this.formsObj.cleanCategoryAddForm();
						this.formsObj.cleanCategoryDisplayForm();
						this.formsObj.displayCategories(this.formsObj.currentCategoryCategories);
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
			console.log("saveCategoryForService", values);
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
			//console.log("saveWms", data);
			var url = "sc/wms/add";
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response) {
					this.refreshLayerList(this.currentObjId);
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to add WMS.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("WMS added.");
						
						var wmsForDisplay = {
							"serviceCatId": data.parent,
							"name": data.name,
							"url": data.url,
							"label": data.label
						};
						this.formsObj.currentCategoryWmses.unshift(wmsForDisplay);
						
						this.formsObj.cleanWmsAddForm();
						this.formsObj.cleanWmsDisplayForm();
						this.formsObj.displayWmses(this.formsObj.currentCategoryWmses);
					}
				}),
				lang.hitch(this, function(error) {
					this.refreshLayerList();
					this.formsObj.showMessage("Something went wrong (on wms/add). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		/*saveCategory: function(values) {
			console.log("saveCategory", values);
			var url = "sc/categories/add";
			var data = {
				"label": values.label,
				"helcomMetadata": values.helcomId
			};
			if (this.currentObjId != null) {
				data.parent = this.currentObjId;
				this.getTreePath(this.currentObjId);
			}
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to add layer.");
						this.formsObj.action = null;
					}
					else if (response.type == "success") {
						console.log("saveCategory success", this.formsObj.action);
						this.currentObjId = response.item.toString();
						if (this.formsObj.action = "ADD_CATEGORY") {
							console.log("if ADD CAT");
							this.formsObj.showMessage("Layer added.");
							this.utils.show("saveCategoryButton", "none");
							this.utils.show("updateCategoryButton", "inline-block");
							this.utils.show("addDataCategoryButton", "inline-block");
							this.refreshLayerList(this.currentObjId);
							this.formsObj.action = null;
						}
						else if (this.formsObj.action == "ADD_WMS_NEW") {
							console.log("if ADD WMS");
							var wmsValues = values;
							wmsValues.parent = this.currentObjId;
							console.log("wmsValues", wmsValues);
							this.saveWms(wmsValues);
						}
					}
					
				}),
				lang.hitch(this, function(error){
					this.formsObj.action = null;
					this.formsObj.showMessage("Something went wrong (on categories/add). Please contact administrator.");
					console.log(error);
				})
			);
		},*/
		
		/*getCategory: function() {
			var url = "sc/categories/get/"+this.currentObjId;
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.formsObj.action = null;
						// TODO: popup box message
					}
					else if (response.type == "success") {
						
						var data = response.item;
						if (this.formsObj.action == "UPDATE_CATEGORY") {
							data.label = this.formsObj.getCategoryInputValue();
							data.helcomMetadata = this.formsObj.getHelcomIdInputValue();
							this.updateCategory(data);
						}
						else if ((this.formsObj.action == "ADD_WMS") || (this.formsObj.action == "UPDATE_WMS") || (this.formsObj.action == "METADATA_ADDED")){
							if (data.metaData.length > 0) {
								this.formsObj.hideDisplayMetadataForm();
								this.utils.changeText("metadataFormMessage", "Metadata added to this layer:");
								this.utils.show("metadataDisplayForm", "block");
								this.formsObj.showMetadata(data.metaData);
								console.log("Get Cat", data.metaData);
								this.formsObj.action = null;
							}
						}
						else if (this.formsObj.action == "ADD_METADATA") {
							var newMetadata = {
								"parent": data.id,
								"source": "PROVIDED",
								"format": this.formsObj.metadataFormatSelector.get("value"),
								"url": this.formsObj.getMetadataUrlInputValue()
							};
							data.metaData.push(newMetadata);
							//console.log("ADD_METADATA", response.item, values);
							this.updateCategory(data);
						}
						
					}
				}),
				lang.hitch(this, function(error){
					this.formsObj.action = null;
					alert("Something went wrong (on categories/get/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},*/
		
		/*updateCategory: function(data) {
			var url = "sc/categories/update";
			
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					//this.refreshLayerList();
					this.refreshLayerList(this.currentObjId);
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to update layer.");
						if (this.formsObj.action == "ADD_METADATA") {
							this.formsObj.hideAddMetadataForm();
						}
						this.formsObj.action = null;
					}
					else if (response.type == "success") {
						console.log(response);
						this.formsObj.showMessage("Layer updated.");
						if (this.formsObj.action == "ADD_METADATA") {
							this.formsObj.hideAddMetadataForm();
							this.formsObj.action = "METADATA_ADDED";
							this.getCategory();
						}
						else {
							this.formsObj.action = null;
						}
					}
				}),
				lang.hitch(this, function(error){
					if (this.formsObj.action == "ADD_METADATA") {
						this.formsObj.hideAddMetadataForm();
					}
					this.formsObj.action = null;
					this.formsObj.showMessage("Something went wrong (on categories/update). Please contact administrator.");
					console.log(error);
				})
			);
		},*/
		
		/*saveWms: function(data) {
			console.log("saveWms", data);
			var url = "sc/wms/add";
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					this.refreshLayerList(this.currentObjId);
					if (response.type == "error") {
						this.formsObj.action = null;
						this.formsObj.showMessage("Failed to add WMS.");
						this.formsObj.hideAddWmsForm();
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("WMS added.");
						this.formsObj.wmsUpdate = true;
						this.formsObj.hideAddWmsForm();
						if ((this.formsObj.action == "ADD_WMS") || (this.formsObj.action == "UPDATE_WMS") || (this.formsObj.action == "ADD_WMS_NEW")){
							console.log("ADD_WMS_NEW");
							this.getWms(response.item);
						}
						console.log(response);
					}
				}),
				lang.hitch(this, function(error){
					this.formsObj.action = null;
					this.formsObj.hideAddWmsForm();
					this.refreshLayerList();
					this.formsObj.showMessage("Something went wrong (on wms/add). Please contact administrator.");
					console.log(error);
				})
			);
		},*/
		
		getWms: function(id) {
			var url = "sc/wms/get/"+id;
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.formsObj.action = null;
						// TODO: popup box message
					}
					else if (response.type == "success") {
						if ((this.formsObj.action == "ADD_WMS") || (this.formsObj.action == "UPDATE_WMS") || (this.formsObj.action == "ADD_WMS_NEW")){
							this.currentWms = {
								"id": response.item.id,
								"url": response.item.url,
								"name": response.item.name
							};
							this.utils.changeText("wmsFormMessage", "WMS added to this layer:");
							this.utils.changeText("wmsDisplayUrl", this.currentWms.url);
							this.utils.changeText("wmsDisplayName", this.currentWms.name);
							this.utils.show("wmsDisplayForm", "block");
							
							this.getCategory();
						}
						
						//console.log(response);
					}
				}),
				lang.hitch(this, function(error){
					this.formsObj.action = null;
					alert("Something went wrong (on wms/get/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		deleteWms: function(values) {
			var url = "sc/wms/delete/" + this.currentWms.id;
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.formsObj.action =null;
						this.formsObj.showMessage("Failed to delete wms.");
					}
					else if (response.type == "success") {
						if (this.formsObj.action == "UPDATE_WMS") {
							this.saveWms(values);
						}
					}
				}),
				lang.hitch(this, function(error){
					this.formsObj.action =null;
					this.formsObj.showMessage("Something went wrong (on wms/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		/*updateCategory: function(data) {
			console.log("update category", data);
			var url = "sc/categories/update";
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					this.currentObjId = null;
					this.formsObj.formCleanUp();
					this.refreshLayerList();
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to update layer.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("Layer updated.");
						
					}
				}),
				lang.hitch(this, function(error){
					this.currentObjId = null;
					this.formsObj.formCleanUp();
					this.refreshLayerList();
					this.formsObj.showMessage("Something went wrong (on categories/update). Please contact administrator.");
					console.log(error);
				})
			);
		},*/
		
		getCategoryForMetadataUpdate: function(values) {
			console.log("get category", values);
			var url = "sc/categories/get/"+this.currentObjId;
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						console.log(response);
						// TODO: popup box message
					}
					else if (response.type == "success") {
						console.log(response);
						var data = response.item;
						var newMetadata = {
							"parent": data.id,
							"source": "PROVIDED",
							"format": values.metadataFormat,
							"url": values.metadataUrl
						};
						data.metaData.push(newMetadata);
						
						this.updateCategory(data);
					}
				}),
				lang.hitch(this, function(error){
					alert("Something went wrong (on categories/get/{id}). Please contact administrator.");
					console.log(error);
				})
			);
			console.log(values);
			console.log(this.currentObjId);
		},
		
		deleteCategory: function() {
			var url = "sc/categories/delete/" + this.currentObjId;
			this.getTreePath(this.store.get(this.currentObjId).parent);
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.currentObjId = null;
						this.formsObj.formCleanUp();
						this.formsObj.showMessage("Failed to delete layer.");
					}
					else if (response.type == "success") {
						this.currentObjId = null;
						this.formsObj.formCleanUp();
						this.formsObj.showMessage("Layer deleted.");
						this.refreshLayerList();
					}
				}),
				lang.hitch(this, function(error){
					this.currentObjId = null;
					this.formsObj.formCleanUp();
					this.formsObj.showMessage("Something went wrong (on categories/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		changeCategoryPosition: function(pos) {
			console.log(pos);
			var url = "sc/categories/position/"+this.currentObjId+"/"+pos;
			this.getTreePath(this.store.get(this.currentObjId).parent);
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
		
		wmsUpdateInfo: function() {
			var url = "sc/wms/update-info/"+this.currentWmsId;
			request.post(url, this.utils.createPostRequestParams({})).then(
					lang.hitch(this, function(response){
						if (response.type == "error") {
							this.formsObj.showMessage("Failed to update wms info.");
						}
						else if (response.type == "success") {
							this.currentWmsId == null;
						}
					}),
					lang.hitch(this, function(error){
						this.formsObj.showMessage("Something went wrong (on wms/update-info/{id}). Please contact administrator.");
						console.log(error);
					})
				);
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
						this.createTree(response.item);
						if (highlightId != null) {
							this.getTreePath(highlightId)
							this.currentHeader = " Manage layer";
							this.getLabelsFromRoot(highlightId);
							this.utils.changeText("adminFormsHeader", this.currentHeader);
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

		addLayerToDataArray: function(layer, parentLayerId, /*topGroup,*/ last) {
			//console.log(layer);
			//var isLeaf = (layer.children.length > 0 ? false : true);
			//var isLeaf = (layer.name ? true : false);
			//var isLeaf = !(layer.category);
			//var isEmpty = (layer.layers.length > 0 ? false : true);
			var lyr = {
				id: layer.id.toString(),
				parent: parentLayerId,
				name: layer.label,
				helcomId: layer.helcomMetadata,
				//topGroup: topGroup,
				position: layer.position,
				lastPos: last,
				type: null,
				//emptyCategory: null,
				wms: null,
				wfs: null,
				metadata: layer.metadata,
				children: layer.layers
			};
			
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
			/*else {
				lyr.leaf = true;
			}*/
			/*if (layer.layers) {
				lyr.leaf = false;
				if (layer.layers.length == 0) {
					lyr.emptyCategory = true;
				}
				else {
					lyr.emptyCategory = false;
				}
			}
			else {
				lyr.leaf = true;
				lyr.emptyCategory = false;
			}
			
			if (lyr.leaf) {
				if (layer.wmses[0]) {
					lyr.wms = layer.wmses[0];
				}
				if (layer.wfses[0]) {
					lyr.wfs = layer.wfses[0];
				}
				
			}*/
			//lyr.metadata = layer.metadata;
			
			this.data.push(lyr);
			//if (!lyr.leaf) {
			if (lyr.type == "CATEGORY") {
				this.dataFiltering.push(lyr);
				array.forEach(layer.layers, lang.hitch(this, function(l){
					if (l.position === layer.layers.length) {
						this.addLayerToDataArray(l, layer.id.toString(), /*false,*/ true);
					}
					else {
						this.addLayerToDataArray(l, layer.id.toString(), /*false,*/ false);
					}
				}));
			}
		},

		createDataArray: function(input) {
			array.forEach(input, lang.hitch(this, function(record){
				if (record.position === input.length) {
					this.addLayerToDataArray(record, this.rootLayerId, /*true,*/ true);
				}
				else {
					this.addLayerToDataArray(record, this.rootLayerId, /*true,*/ false);
				}
			}));
		},
		
		createTree: function(input) {
			var that = this;
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
						var downButton = domConstruct.create("div", { "class": "downButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [downButton],
							showDelay: 10,
							position: ["below"],
							label: "Move down"
						});

						on(downButton, "click", function() {
							//that.formsObj.formCleanUp();
							//that.currentObjId = tnode.item.id;
							that.changeCategoryPosition(tnode.item.position+1);
						});
					}
          
					if (tnode.item.position > 1) {
						var upButton = domConstruct.create("div", { "class": "upButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [upButton],
							showDelay: 10,
							position: ["below"],
							label: "Move up"
						});

						on(upButton, "click", function() {
							//that.formsObj.formCleanUp();
							//that.currentObjId = tnode.item.id;
							that.changeCategoryPosition(tnode.item.position-1);
						});
					}
						
					if (tnode.item.type == "WMS") {
						domConstruct.destroy(tnode.expandoNode);
						domStyle.set(tnode.labelNode, {"color": "green"});
					}
					else if (tnode.item.type == "WFS") {
						domConstruct.destroy(tnode.expandoNode);
						domStyle.set(tnode.labelNode, {"color": "blue"});
					}
					else if (tnode.item.type == "CATEGORY") {
						var rowNodePadding = domStyle.get(tnode.rowNode, "padding-left");
						var labelNodeWidth = 300 - rowNodePadding;
						domStyle.set(tnode.labelNode, {"width": labelNodeWidth+"px"});
					}
					//if (tnode.item.leaf) {
					//	domConstruct.destroy(tnode.expandoNode);
						
						/*var metadataButton = domConstruct.create("div", { "class": "manageMetadataButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [metadataButton],
							showDelay: 10,
							position: ["below"],
							label: "Manage layers metadata"
						});

						on(metadataButton, "click", function(){
							console.log(tnode.item);
							that.formsObj.formCleanUp();
							that.currentObjId = tnode.item.id;
							that.currentHeader = tnode.item.name + " -> metadata";
							if (tnode.item.parent != that.rootLayerId) {
								that.getLabelsFromRoot(tnode.item.parent);
							}
							that.formsObj.setupMetadataForm(that.currentHeader, tnode.item.metadata);
						});*/
						
						/*var wfsButton = domConstruct.create("div", { "class": "manageWfsButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [wfsButton],
							showDelay: 10,
							position: ["below"],
							label: "Manage layers WFS"
						});

						on(wfsButton, "click", function(){
							console.log("wfsButton", tnode.item);
							// TODO
						});*/
						
						/*var wmsButton = domConstruct.create("div", { "class": "manageWmsButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [wmsButton],
							showDelay: 10,
							position: ["below"],
							label: "WMS info"
						});

						on(wmsButton, "click", function(){
							//console.log(tnode.item);
							that.formsObj.formCleanUp();
							that.currentObjId = tnode.item.id;
							that.currentWmsId = tnode.item.wms.id;
							that.currentHeader = tnode.item.name + " -> WMS info";
							if (tnode.item.parent != that.rootLayerId) {
								that.getLabelsFromRoot(tnode.item.parent);
							}
							that.formsObj.setupWmsInfoForm(that.currentHeader, tnode.item.wms.url, tnode.item.wms.name);
						});*/
						
						/*var removeCategoryButton = domConstruct.create("div", { "class": "removeCategoryButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [removeCategoryButton],
							showDelay: 10,
							position: ["below"],
							label: "Remove layer"
						});

						on(removeCategoryButton, "click", function(){
							that.formsObj.formCleanUp();
							that.currentObjId = tnode.item.id;
							that.currentHeader = tnode.item.name + " -> Delete layer";
							if (tnode.item.parent != that.rootLayerId) {
								that.getLabelsFromRoot(tnode.item.parent);
							}
							that.formsObj.setupDeleteCategoryForm(that.currentHeader);
						});*/
												
						/*var editLayerButton = domConstruct.create("div", { "class": "editButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [editLayerButton],
							showDelay: 10,
							position: ["below"],
							label: "Edit layer"
						});

						on(editLayerButton, "click", function(){
							console.log("editLayerButton", tnode.item);
							// TODO
						});*/
					//}
					//else {
						
						
						/*var removeCategoryButton = domConstruct.create("div", { "class": "removeCategoryButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [removeCategoryButton],
							showDelay: 10,
							position: ["below"],
							label: "Remove layer"
						});

						on(removeCategoryButton, "click", function(){
							that.formsObj.formCleanUp();
							that.currentObjId = tnode.item.id;
							that.currentHeader = tnode.item.name + " -> Delete layer";
							if (tnode.item.parent != that.rootLayerId) {
								that.getLabelsFromRoot(tnode.item.parent);
							}
							that.formsObj.setupDeleteCategoryForm(that.currentHeader);
						});
						
						var addCategoryButton = domConstruct.create("div", { "class": "addCategoryButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [addCategoryButton],
							showDelay: 10,
							position: ["below"],
							label: "Add layer"
						});

						on(addCategoryButton, "click", function(){
							that.formsObj.formCleanUp();
							that.currentObjId = tnode.item.id;
							that.currentHeader = tnode.item.name + " -> Add layer";
							if (tnode.item.parent != that.rootLayerId) {
								that.getLabelsFromRoot(tnode.item.parent);
							}
							that.formsObj.setupCategoryForm("MANAGE_CATEGORY", null, that.currentHeader);
						});*/
						
						//var rowNodePadding = domStyle.get(tnode.rowNode, "padding-left");
						//var labelNodeWidth = 300 - rowNodePadding;
						//domStyle.set(tnode.labelNode, {"width": labelNodeWidth+"px"});
					//}
					
					var editCategoryButton = domConstruct.create("div", { "class": "editButton" }, toolsContainer, "last");
					new Tooltip({
						connectId: [editCategoryButton],
						showDelay: 10,
						position: ["below"],
						label: "Manage layer"
					});

					on(editCategoryButton, "click", function() {
						
						that.formsObj.manageCategoryCloseButtonClick();
						
						that.currentObjId = tnode.item.id;
						if (tnode.item.type == "CATEGORY") {
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
						that.formsObj.setupManageCategoryForm(tnode.item, that.formsObj.currentCategoryCategories, that.formsObj.currentCategoryWmses, that.currentHeader);
						that.getCurrentCategory();
					});
					
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
		}
	});
});
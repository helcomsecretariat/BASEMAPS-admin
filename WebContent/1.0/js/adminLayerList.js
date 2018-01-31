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
		currentHeader: "",
		treePath: [],
		constructor: function(params) {
			this.formsObj = params.forms;
			this.utils = new utils();
			this.data = [{ id: this.rootLayerId, leaf: false}];
		},
    
		topCategoryButtonClick: function() {
			this.currentObjId = null;
			this.formsObj.formCleanUp();
			this.formsObj.setupAddCategoryForm("Add root layer");
		},
	
		postCreate: function() {
			this.getLayersData();
    	
			on(this.formsObj.addCategorySaveButton, "click", lang.hitch(this, function(){
				this.formsObj.hideMessage();
					
				var values = {"categoryName": this.formsObj.getCategoryInputValue()};
				if (this.formsObj.addingWmsWithCategory) {
					values.wmsUrl = this.formsObj.getWmsUrlInputValue();
					if (this.formsObj.wmsValidationPassed) {
						values.wmsName = this.formsObj.wmsNameSelector.get("value");
					}
					else {
						values.wmsName = this.formsObj.getWmsNameInputValue();
					}
				}
				
				if (validate.isText(values.categoryName)) {
					this.saveCategory(values);
				}
				else {
					this.formsObj.showMessage("Category label is not valid.");
				}
			}));
			
			on(this.formsObj.deleteCategoryYesButton, "click", lang.hitch(this, function(){
				this.deleteCategory();
			}));
			
			on(this.formsObj.deleteCategoryNoButton, "click", lang.hitch(this, function(){
				this.currentObjId = null;
				this.formsObj.formCleanUp();
			}));
			
			on(this.formsObj.deleteCategoryNoButton, "click", lang.hitch(this, function(){
				this.currentObjId = null;
				this.formsObj.formCleanUp();
			}));
		},
    
		getTreePath: function(id) {
			while (this.store.get(id).parent) {
				this.treePath.unshift(id);
				id = this.store.get(id).parent;
			}
			this.treePath.unshift(this.rootLayerId);
			console.log(this.treePath);
		},
		
		refreshLayerList: function() {
			delete this.store;
			this.treeModel.destroy();
			this.tree.destroy();
			domConstruct.empty(this.adminLayerListTree);
			this.data = [{ id: this.rootLayerId, leaf: false}];
			this.getLayersData();
		},
    
		saveCategory: function(values) {
			console.log(values);
			var url = "sc/categories/add";
			var data = {
				"label": values.categoryName
			};
			if (this.currentObjId != null) {
				data.parent = this.currentObjId;
				this.getTreePath(this.currentObjId);
			}
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					this.utils.clearInput("categoryInput");
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to add category.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("Category added.");
						
						if (this.formsObj.addingWmsWithCategory) {
							if ((validate.isUrl(values.wmsUrl)) && (validate.isText(values.wmsName))) {
								this.saveWms({"parent": response.item, "url": values.wmsUrl, "name": values.wmsName});
							}
							else {
								this.formsObj.showMessage("WMS url or name is not valid. WMS is not added.");
							}
							/*if ((values.wfsUrl.length > 0) && (values.wfsName.length > 0)) {
								if ((validate.isUrl(values.wfsUrl)) && (validate.isText(values.wfsName))) {
									console.log("valid name and url wfs");
								}
								else {
									this.formsObj.showMessage("WFS url or name is not valid. WFS is not added.");
								}
							}*/
						}
						else {
							this.refreshLayerList();
						}
						console.log(response);
					}
				}),
				lang.hitch(this, function(error){
					this.utils.clearInput("categoryInput");
					this.formsObj.showMessage("Something went wrong (on adding category). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		saveWms: function(data) {
			console.log(data);
			var url = "sc/wms/add";
			request.post(url, this.utils.createPostRequestParams(data)).then(
				lang.hitch(this, function(response){
					this.formsObj.hideAddWmsForm();
					this.refreshLayerList();
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to add WMS.");
					}
					else if (response.type == "success") {
						this.formsObj.showMessage("WMS added.");
						
					}
				}),
				lang.hitch(this, function(error){
					this.formsObj.hideAddWmsForm();
					this.refreshLayerList();
					this.formsObj.showMessage("Something went wrong (on adding category). Please contact administrator.");
					console.log(error);
				})
			);
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
						this.formsObj.showMessage("Failed to delete category.");
					}
					else if (response.type == "success") {
						this.currentObjId = null;
						this.formsObj.formCleanUp();
						this.formsObj.showMessage("Category deleted.");
						this.refreshLayerList();
					}
				}),
				lang.hitch(this, function(error){
					this.currentObjId = null;
					this.formsObj.formCleanUp();
					this.formsObj.showMessage("Something went wrong (on deleting category). Please contact administrator.");
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
					this.formsObj.showMessage("Something went wrong (on changing category position). Please contact administrator.");
					console.log(error);
				})
			);
		},

		destroy: function() {

		},
    
		getLayersData: function() {
			var url = "sc/categories/tree";
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						console.log(response);
						// TODO: popup box message
					}
					else if (response.type == "success") {
						this.createTree(response.item);
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

		addLayerToDataArray: function(layer, parentLayerId, topGroup, last) {
			//var isLeaf = (layer.children.length > 0 ? false : true);
			//var isLeaf = (layer.name ? true : false);
			var isLeaf = !(layer.category);
			//var isEmpty = (layer.layers.length > 0 ? false : true);
			var lyr = {
				id: layer.id.toString(),
				parent: parentLayerId,
				name: layer.label,
				topGroup: topGroup,
				position: layer.position,
				lastPos: last,
				//leaf: !layer.isGroup,
				leaf: isLeaf,
				//empty: isEmpty,
				wms: null,
				wfs: null,
				metadata: null
			};
			/*if (isLeaf) {
				lyr["wms"] = layer.wms;
				lyr["wfs"] = layer.wfs;
				lyr["metadata"] = layer.metadata;
			}*/
			this.data.push(lyr);
			if (!isLeaf) {
				this.dataFiltering.push(lyr);
				array.forEach(layer.layers, lang.hitch(this, function(l){
					if (l.position === layer.layers.length) {
						this.addLayerToDataArray(l, layer.id.toString(), false, true);
					}
					else {
						this.addLayerToDataArray(l, layer.id.toString(), false, false);
					}
				}));
			}
		},

		createDataArray: function(input) {
			array.forEach(input, lang.hitch(this, function(record){
				if (record.position === input.length) {
					this.addLayerToDataArray(record, this.rootLayerId, true, true);
				}
				else {
					this.addLayerToDataArray(record, this.rootLayerId, true, false);
				}
			}));
		},
		
		createTree: function(input) {
			var that = this;
			this.createDataArray(input);
			
			this.store = new Memory({
				data: this.data,
				getChildren: function(object){
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
				getIconClass:function(item, opened){
				
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
							label: "One level down"
						});

						on(downButton, "click", function(){
							that.formsObj.formCleanUp();
							that.currentObjId = tnode.item.id;
							that.changeCategoryPosition(tnode.item.position+1);
						});
					}
          
					if (tnode.item.position > 1) {
						var upButton = domConstruct.create("div", { "class": "upButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [upButton],
							showDelay: 10,
							position: ["below"],
							label: "One level up"
						});

						on(upButton, "click", function(){
							that.formsObj.formCleanUp();
							that.currentObjId = tnode.item.id;
							that.changeCategoryPosition(tnode.item.position-1);
						});
					}
									
					if (tnode.item.leaf) {
						domConstruct.destroy(tnode.expandoNode);
						
						var wfsButton = domConstruct.create("div", { "class": "manageWfsButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [wfsButton],
							showDelay: 10,
							position: ["below"],
							label: "Manage layers WFS"
						});

						on(wfsButton, "click", function(){
							console.log("wfsButton", tnode.item);
							// TODO
						});
						
						var wmsButton = domConstruct.create("div", { "class": "manageWmsButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [wmsButton],
							showDelay: 10,
							position: ["below"],
							label: "Manage layers WMS"
						});

						on(wmsButton, "click", function(){
							console.log("wmsButton", tnode.item);
							// TODO
						});
						
						var removeLayerButton = domConstruct.create("div", { "class": "removeLayerButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [removeLayerButton],
							showDelay: 10,
							position: ["below"],
							label: "Remove layer"
						});

						on(removeLayerButton, "click", function(){
							console.log("removeLayerButton", tnode.item);
							// TODO
						});
						
						var editLayerButton = domConstruct.create("div", { "class": "editButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [editLayerButton],
							showDelay: 10,
							position: ["below"],
							label: "Edit layer"
						});

						on(editLayerButton, "click", function(){
							console.log("editLayerButton", tnode.item);
							// TODO
						});
					}
					else {
						
						
						var removeCategoryButton = domConstruct.create("div", { "class": "removeCategoryButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [removeCategoryButton],
							showDelay: 10,
							position: ["below"],
							label: "Remove category"
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
							label: "Add category"
						});

						on(addCategoryButton, "click", function(){
							that.formsObj.formCleanUp();
							that.currentObjId = tnode.item.id;
							that.currentHeader = tnode.item.name + " -> Add layer";
							if (tnode.item.parent != that.rootLayerId) {
								that.getLabelsFromRoot(tnode.item.parent);
							}
							that.formsObj.setupAddCategoryForm(that.currentHeader);
						});
						
						var editCategoryButton = domConstruct.create("div", { "class": "editButton" }, toolsContainer, "last");
						new Tooltip({
							connectId: [editCategoryButton],
							showDelay: 10,
							position: ["below"],
							label: "Edit category"
						});

						on(editCategoryButton, "click", function(){
							console.log("editCategoryButton", tnode.item);
							// TODO
						});
						
						var rowNodePadding = domStyle.get(tnode.rowNode, "padding-left");
						var labelNodeWidth = 300 - rowNodePadding;
						domStyle.set(tnode.labelNode, {"width": labelNodeWidth+"px"});
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
		}
	});
});
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
	"dojo/store/Memory",
	"dijit/tree/ObjectStoreModel", 
	"dijit/Tree", 
	"dijit/form/FilteringSelect",
	"dijit/form/CheckBox", 
	"dijit/Tooltip",
	"basemaps/js/utils",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/text!../templates/adminUsersList.html"
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
	Memory, 
	ObjectStoreModel, 
	Tree, 
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
		baseClass: "adminUsersList",
		utils: null,
		formsObj: null,
		newUserRole: null,
		updateUser: null,
		constructor: function(params) {
			this.formsObj = params.forms;
			this.utils = new utils();
		},
    
		/*addUserButtonClick: function() {
			this.formsObj.formCleanUp();
			//this.formsObj.setupForm("TOP_CATEGORY", "Add top category");
		},*/
	
		postCreate: function() {
			this.listUsers("ADMIN");
			this.listUsers("PROVIDER");
			
			on(this.formsObj.saveUser, "click", lang.hitch(this, function() {
				var userName = this.utils.getInputValue("addUserNameInput").trim();
				var userEmail = this.utils.getInputValue("addUserEmailInput").trim();
				var userPassword = this.utils.getInputValue("addUserPasswordInput").trim();
				var userPasswordRepeat = this.utils.getInputValue("addUserPasswordRepeatInput").trim();
				
				var newUser = {
					"role": "",
					"name": "",
					"password": "",
					"email": "",
					"phone": this.utils.getInputValue("addUserPhoneInput").trim(),
					"organization": this.utils.getInputValue("addUserOrganizationInput").trim(),
					"position": this.utils.getInputValue("addUserPositionInput").trim()
				};
				if (validate.isText(userName)) {
					newUser.name = userName;
					if (validate.isEmailAddress(userEmail)) {
						newUser.email = userEmail
						if ((this.newUserRole === "ADMIN") || (this.newUserRole === "PROVIDER")) {
							newUser.role = this.newUserRole;
							if ((validate.isText(userPassword)) && (userPassword === userPasswordRepeat)) {
								newUser.password = userPassword;
								this.saveUser(newUser);
							}
							else {
								this.formsObj.showMessage("Password not matching or not valid.");
							}
						}
						else {
							this.formsObj.showMessage("User role not valid.");
						}
					}
					else {
						this.formsObj.showMessage("Email is not valid.");
					}
				}
				else {
					this.formsObj.showMessage("User name is not valid.");
				}
			}));
			
			on(this.formsObj.updateUser, "click", lang.hitch(this, function() {
				var userName = this.utils.getInputValue("updateUserNameInput").trim();
				var userEmail = this.utils.getInputValue("updateUserEmailInput").trim();
				var userPhone = this.utils.getInputValue("updateUserPhoneInput").trim();
				
				this.updateUser.organization = this.utils.getInputValue("updateUserOrganizationInput").trim();
				this.updateUser.position = this.utils.getInputValue("updateUserPositionInput").trim();

				if (validate.isText(userName)) {
					this.updateUser.name = userName;
					if (validate.isEmailAddress(userEmail)) {
						this.updateUser.email = userEmail
						if (userPhone.length <= 15) {
							this.updateUser.phone = userPhone;
							this.updateUserInfo(this.updateUser);
						}
						else {
							this.formsObj.showMessage("Phone is not valid.");
						}
					}
					else {
						this.formsObj.showMessage("Email is not valid.");
					}
				}
				else {
					this.formsObj.showMessage("User name is not valid.");
				}
			}));
		},
		
		updateUserInfo: function(user) {
			var url = "sc/users/update";
			request.post(url, this.utils.createPostRequestParams(user)).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.showMessage("Failed to update user.");
					}
					else if (response.type == "success") {
						this.formsObj.cleanUpdateUserForm();
						this.cleanUsersList();
						this.formsObj.showMessage("User updated.");
						this.listUsers("ADMIN");
						this.listUsers("PROVIDER");
					}
				}),
				lang.hitch(this, function(error) {
					this.formsObj.showMessage("Something went wrong (on users/update). Please contact administrator.");
					console.log(error);
				})
			);
		},
    
		listUsers: function(role) {
			var url = "sc/users/list/"+role;
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						// TODO: popup box message
					}
					else if (response.type == "success") {
						this.showUsers(role, response.item);
					}
				}),
				lang.hitch(this, function(error) {
					alert("Something went wrong (on users/list/{role}). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		showUsers: function(role, users) {
			domConstruct.create("div", {"class": "userListSectionLabel", "innerHTML": role+":"}, this.adminUsersList, "last");
			var newUser = domConstruct.create("div", {"class": "formLink", "innerHTML": "Add new"}, this.adminUsersList, "last");
			array.forEach(users, lang.hitch(this, function(user) {
				var container = domConstruct.create("div", {"class": "userListSectionGroup"}, this.adminUsersList, "last");
				var content = domConstruct.create("div", {"style": "display: inline-block; width: 70%"}, container, "last");
				var buttonContainer = domConstruct.create("div", {"style": "display: inline-block; width: 30%"}, container, "last");
				
				var name = domConstruct.create("div", null, content, "last");
				//var nameLabel = domConstruct.create("span", { "class": "userListLabel", "innerHTML": "Name: " }, name, "last");
				var nameValue = domConstruct.create("span", { "class": "userListValue", "innerHTML": user.name }, name, "last");
				
				var email = domConstruct.create("div", null, content, "last");
				//var emailLabel = domConstruct.create("span", { "class": "userListLabel", "innerHTML": "Label: " }, email, "last");
				var emailValue = domConstruct.create("span", { "class": "userListValue", "innerHTML": user.email }, email, "last");
				
				var passwordButton = domConstruct.create("div", {"class": "userButtonLink", "innerHTML": "Change password"}, buttonContainer, "last");
				var updateButton = domConstruct.create("div", {"class": "userButtonLink", "innerHTML": "View/Update"}, buttonContainer, "last");
				var deleteButton = domConstruct.create("div", {"class": "userButtonLink", "innerHTML": "Delete"}, buttonContainer, "last");
				
				on(deleteButton, "click", lang.hitch(this, function() {
					if (confirm("Please confirm removing user: " + user.name) == true) {
				    	this.deleteUser(user.id);
				    }
				}));
				
				on(updateButton, "click", lang.hitch(this, function() {
					this.formsObj.cleanAdminForm();
					this.updateUser = user;
					this.utils.setInputValue("updateUserNameInput", user.name);
					this.utils.setInputValue("updateUserEmailInput", user.email);
					this.utils.setInputValue("updateUserPhoneInput", user.phone);
					this.utils.setInputValue("updateUserOrganizationInput", user.organization);
					this.utils.setInputValue("updateUserPositionInput", user.position);
					this.utils.show("updateUserForm", "block");
					console.log(user);
				}));
				
			}));
			on(newUser, "click", lang.hitch(this, function() {
				this.formsObj.cleanAdminForm();
				this.utils.show("addUserForm", "block");
				this.newUserRole = role;
			}));
		},
		
		cleanUsersList: function() {
			domConstruct.empty(this.adminUsersList);
		},
		
		deleteUser: function(id) {
			var url = "sc/users/delete/" + id;
			request.del(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response) {
					if (response.type == "error") {
						this.showMessage("Failed to delete user.");
					}
					else if (response.type == "success") {
						this.cleanUsersList();
						this.formsObj.showMessage("User deleted.");
						this.listUsers("ADMIN");
						this.listUsers("PROVIDER");
					}
				}),
				lang.hitch(this, function(error){
					this.showMessage("Something went wrong (on users/delete/{id}). Please contact administrator.");
					console.log(error);
				})
			);
		},
				
		saveUser: function(user) {
			var url = "sc/users/add";
			request.post(url, this.utils.createPostRequestParams(user)).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						this.formsObj.showMessage("Failed to add user.");
					}
					else if (response.type == "success") {
						this.cleanUsersList();
						this.formsObj.cleanAddUserForm();
						this.formsObj.showMessage("User added.");
						this.listUsers("ADMIN");
						this.listUsers("PROVIDER");
					}
				}),
				lang.hitch(this, function(error){
					this.formsObj.showMessage("Something went wrong (on adding user). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		deleteCategory: function() {
			var url = "sc/categories/delete/" + this.currentObjId;
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

		destroy: function() {

		}
	});
});
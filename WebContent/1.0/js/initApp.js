define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/request",
	"dojo/on", 
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/_base/array", 
	"dojo/_base/window",
	"dijit/layout/BorderContainer",
	"basemaps/js/mapManager",
	"basemaps/js/adminViewManager",
	"basemaps/js/utils",
	"widgets/loginWidget",
	"dojo/text!../templates/header.html",
	"dojo/domReady!"
], function(
	declare, lang, request, on, dom, domConstruct, array, win, 
	BorderContainer, mapManager, adminViewManager, utils, loginWidget, 
	headerHTML
) {
	return declare(null, {
		mM: null,
		utils: null,
		adminViewManagerObj: null,
		adminView: false,
		adminLayerList: null,
		constructor: function() {
			
			var mainWindow = new BorderContainer({}, "mainWindow");
			domConstruct.place(headerHTML, "mainWindow");
			
			if (this.isIE()){
			    alert("We apologize, this browser is not supported.");
			}
			
			this.mM = new mapManager().placeAt(dom.byId("mainWindow"));
			
			this.utils = new utils();
			
			// on Admin link click get logged in user.
			var adminButton = dom.byId("adminLink");
			on(adminButton, "click", lang.hitch(this, function(evt){
				this.getUser();
	        }));
			
			// on Logout link click logout user.
			var logoutButton = dom.byId("logoutLink");
			on(logoutButton, "click", lang.hitch(this, function(evt){
				this.logout();
	        }));
			
			// on Map link click show map view.
			var mapButton = dom.byId("mapLink");
			on(mapButton, "click", lang.hitch(this, function(evt){
				this.switchToMapView();
	        }));
		},
		
		isIE: function() {
			ua = navigator.userAgent;
			/* MSIE used to detect old browsers and Trident used to newer ones*/
			var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
			return is_ie; 
		},
		
		getUser: function() {
			var url = "sc/users/current";
			request.get(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						console.log(response);
					}
					else if (response.type == "success") {
						// if user not logged in, init login window
						if (response.item.id == null) {
							var lgn = new loginWidget().placeAt(win.body());
						}
						// if user logged in, enable map and logout links and open Admin view
						else {
							this.utils.show("mapLink", "block");
							this.utils.changeText("logoutLink", "Logout (" + response.item.name + ")");
							this.utils.show("logoutLink", "block");
							
							var writeCategories = this.getUserWriteCategories(response.item.rights);
							this.switchToAdminView(response.item.role, writeCategories);
						}
					}
				}),
				lang.hitch(this, function(error){
					alert("Something went wrong (on checking user logged in). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		getUserWriteCategories: function(rights) {
			var categories = [];
			array.forEach(rights, lang.hitch(this, function(r){
				if ((r.rights.includes("w")) && (r.categoryId)) {
					categories.push(r.categoryId.toString());
				}
			}));
			return categories;
		},
		
		logout: function() {
			var url = "sc/logout";
			request.post(url, {
				handleAs: "json"
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						console.log(response);
					}
					// if logout succeed, disable map and logout links and open Map view
					else if (response.type == "success") {
						this.utils.show("mapLink", "none");
						this.utils.changeText("logoutLink", "Logout");
						this.utils.show("logoutLink", "none");
						
						if (this.adminView) {
							this.switchToMapView();
						}
						this.adminViewManagerObj.adminLayerList.cleanUp();
					}
				}),
				lang.hitch(this, function(error){
					alert("Something went wrong (on logout). Please contact administrator.");
					console.log(error);
				})
			);
		},
		
		switchToAdminView: function(role, rights) {
			if (!this.adminView) {
				this.mM.show(false);
				if (this.adminViewManagerObj == null) {
					this.adminViewManagerObj = new adminViewManager({"role": role, "rights": rights}).placeAt(dom.byId("mainWindow"));
				}
				else {
					this.adminViewManagerObj.show(true);
					this.adminViewManagerObj.adminLayerList.setUser(role, rights);
					this.adminViewManagerObj.showLayerList();
					this.adminViewManagerObj.adminLayerList.refreshLayerList();
				}
				
				this.utils.show("servicePanel", "none");
				
				if (role === "ADMIN") {
					this.adminViewManagerObj.showViewButtons(true);
				}
				else if (role === "PROVIDER") {
					this.adminViewManagerObj.showViewButtons(false);
				} 
				this.adminView = true;
			}
		}, 
		switchToMapView: function() {
			if (this.adminView) {
				this.adminViewManagerObj.show(false);
				this.mM.show(true);
				this.adminView = false;
			}
		}
	});
});

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/request",
	"dijit/form/CheckBox",
	"dojox/validate/web",
	"basemaps/js/utils",
	//"basemaps/messages/messages",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/text!./templates/loginWidget.html"
], function(declare, lang, dom, domConstruct, on, request, CheckBox, validate, utils, _WidgetBase, _TemplatedMixin, template){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "loginWidget",
		utils: null,
		constructor: function() {
			this.utils = new utils();
			this.utils.show("screenCover", "block");
		},
		validateLoginInput: function() {
			var email = this.emailInput.value;
			var password = this.passwordInput.value;
			if (validate.isEmailAddress(email)) {
				if (validate.isText(password)) {
					this.utils.changeText("loginMessage", "");
					this.loginFunction(email, password);
				}
				else {
					this.utils.changeText("loginMessage", "Enter password..");
				}
			}
			else {
				this.utils.changeText("loginMessage", "Enter valid email address.");
			}
		},
		cancelLogin: function() {
			this.utils.show("screenCover", "none");
			domConstruct.destroy(this.domNode);
		},
		loginFunction: function(email, password) {
			var url = "sc/login";
			request.post(url, {
				data: JSON.stringify({
					"email": email, 
					"password": password
				}),
				handleAs: "json",
				headers: {
					"Content-Type": 'application/json; charset=utf-8',
					"Accept": "application/json"
				}
			}).then(
				lang.hitch(this, function(response){
					if (response.type == "error") {
						if (response.code == "ERROR_VALIDATION") {
							this.utils.changeText("loginMessage", response.text);
						}
					}
					else if (response.type == "success") {
						this.utils.show("mapLink", "block");
						this.utils.changeText("logoutLink", "Logout (" + response.item.name + ")");
						this.utils.show("logoutLink", "block");
						
						// TODO: open Admin view
						
						this.utils.show("screenCover", "none");
						domConstruct.destroy(this.domNode);
					}
				}),
				lang.hitch(this, function(error){
					alert("Something went wrong (on login). Please contact administrator.");
					console.log(error);
				})
			);
		}
		
    /*conditionsAgree: function() {
      if (this.startupCheckbox.checked) {
        document.cookie = "_agreedMADSterms_";
      }
      document.getElementById("startupBox").style.display = "none";
      document.getElementById("screenCover").style.display = "none";
      //document.getElementById("centerContainer").style.display = "block";
  	}*/
	});
});

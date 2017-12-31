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
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/text!./templates/loginWidget.html"
], function(declare, lang, dom, domConstruct, on, request, CheckBox, validate, utils, _WidgetBase, _TemplatedMixin, template){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "loginWidget",
		utils: null,
		constructor: function(params) {
			this.utils = new utils();
			this.utils.show("screenCover", "block");
		},
		validateLoginInput: function() {
			var email = this.emailInput.value;
			var password = this.passwordInput.value;
			if (validate.isEmailAddress(email)) {
				if (validate.isText(password)) {
					this.loginMessage.innerHTML = "";
					console.log("viskas tvarkoj");
					this.loginFunction(email, password);
				}
				else {
					this.loginMessage.innerHTML = "Enter password.";
				}
			}
			else {
				this.loginMessage.innerHTML = "Enter valid email address.";
			}
		},
		cancelLogin: function() {
			this.utils.show("screenCover", "none");
			domConstruct.destroy(this.domNode);
		},
		loginFunction: function(email, password) {
			//dojo request
			//var url = "http://localhost:8080/login.do";
			var url = "login.do";
			
			request.post(url, {
				data: JSON.stringify({
					"email": email, 
					"password": password
				}),
				//handleAs: "json",
				headers: {
					"Content-Type": 'application/json; charset=utf-8',
					"Accept": "application/json"
				}
			}).then(
			function(data){
				console.log("The server returned: ", data);
			},
			function(error){
				console.log("The server returned error: ", error);
			});
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

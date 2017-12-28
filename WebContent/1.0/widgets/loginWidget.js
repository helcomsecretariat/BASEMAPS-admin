define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dijit/form/CheckBox",
	"basemaps/js/utils",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/text!./templates/loginWidget.html"
], function(declare, lang, on, CheckBox, utils, _WidgetBase, _TemplatedMixin, template){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "loginWidget",
		constructor: function(params) {
			var u = new utils();
			u.show("screenCover", "block");
		}//,
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

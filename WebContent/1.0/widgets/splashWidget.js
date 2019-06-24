define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-construct",
	"basemaps/js/utils",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/text!./templates/splashWidget.html"
], function(declare, lang, dom, domConstruct, utils, _WidgetBase, _TemplatedMixin, template){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		baseClass: "splashWidget",
		utils: null,
		constructor: function() {
			this.utils = new utils();
			this.utils.show("screenCover", "block");
		},
		closeWindow: function() {
			this.utils.show("screenCover", "none");
			domConstruct.destroy(this.domNode);
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

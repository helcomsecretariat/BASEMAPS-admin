define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/on",
  "dijit/form/CheckBox",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dojo/text!../templates/startupWindow.html"
], function(declare, lang, on, CheckBox, _WidgetBase, _TemplatedMixin, template){
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    baseClass: "startupWindow",
    constructor: function(params) {

    },
    conditionsAgree: function() {
      if (this.startupCheckbox.checked) {
        document.cookie = "_agreedMADSterms_";
      }
      document.getElementById("startupBox").style.display = "none";
      document.getElementById("screenCover").style.display = "none";
      //document.getElementById("centerContainer").style.display = "block";
  	}
  });
});

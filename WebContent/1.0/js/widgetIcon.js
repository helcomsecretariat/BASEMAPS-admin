define([
  "dojo/_base/declare",
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/dom-style",
  "dojo/query",
  "dojo/on",
  "dojo/_base/lang",
  "dijit/Tooltip"
], function(
  declare, dom, domConstruct, domStyle, query, on, lang, Tooltip
) {
  return declare(null, {
    widgetPanel: null,
    constructor: function(params){
      // construct widget icon
      var widgetsContainer = dom.byId("widgetscontainer");
      var widgetButton = domConstruct.create("div", { "class": "widgetButton" }, widgetsContainer, "last");
      domStyle.set(widgetButton, {"background-image": "url('"+ params.config.icon +"')"});
      // tooltip for icon
      new Tooltip({
        connectId: [widgetButton],
        position: ["below"],
        showDelay: 100,
        label: params.config.name
      });
      // widget panel
      this.widgetPanel = params.widgetPanel;

      // on widget icon click show widget panel
      on(widgetButton, "click", lang.hitch(this, function() {
        // change panel's title
        this.widgetPanel.setTitle(params.config.name);
        domStyle.set(this.widgetPanel.domNode, {
          right: "20px",
          top: "20px",
          width: "304px",
          height: "60%"
        });
        this.widgetPanel.show();

        // get panel's content pane
        var wp = dom.byId("widgetPanel");
        var wpc = query(".dojoxFloatingPaneContent", wp);
        // remove previous widget from the panel
        wpc[0].innerHTML = "";
        // place widget in the panel
        params.widget.placeAt(wpc[0]);
      }));
    }
  });
});

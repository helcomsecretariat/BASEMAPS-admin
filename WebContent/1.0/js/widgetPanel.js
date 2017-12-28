define([
  "dojo/_base/declare",
  "dojox/layout/FloatingPane",
  "dojo/dnd/move"
], function(declare, FloatingPane, move) {
  // widget panel resizable, movable
  return declare(FloatingPane, {
    postCreate: function() {
      this.inherited(arguments);
      this.moveable = new move.constrainedMoveable(
        this.domNode, {
          handle: this.focusNode,
          // panel moving constraints
          constraints: function() {
            var coordsWindow = {
              l: 10,
              t: 10,
              w: window.innerWidth - 20,
              h: window.innerHeight - 100
            };
            return coordsWindow;
          },
          within: true
        }
      );
      // override panel close (don't want to destroy it - just hide)
      this.close = function () {
        this.domNode.style.display = "none";
        this.domNode.style.visibility = "hidden";
      };
    }
  });
});

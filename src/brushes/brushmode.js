
var brushModes = {
  "None": {
    install: function(pc) {
      // Nothing to be done.
    },

    uninstall: function(pc) {
      // Nothing to be done.
    }
  }
}

pc.brushModes = function() {
  return Object.getOwnPropertyNames(brushModes);
};


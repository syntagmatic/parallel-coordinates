
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

pc.brushMode = function(mode) {
  if (arguments.length === 0) {
    return __.brushMode;
  }

  if (pc.brushModes().indexOf(mode) === -1) {
    throw "pc.brushmode: Unsupported brush mode: " + mode;
  }

  // Make sure that we don't trigger unnecessary events by checking if the mode
  // actually changes.
  if (mode !== __.brushMode) {
    // When changing brush modes, the first thing we need to do is clearing any
    // brushes from the current mode, if any.
    if (__.brushMode !== "None") {
      pc.brushReset();
    }

    // Next, we need to 'uninstall' the current brushMode.
    brushModes[__.brushMode].uninstall(pc);
    // Finally, we can install the requested one.
    __.brushMode = mode;
    brushModes[__.brushMode].install();
  }

  return pc;
};


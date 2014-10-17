
var brush = {
  modes: {
    "None": {
      install: function(pc) {}, // Nothing to be done.
      uninstall: function(pc) {} // Nothing to be done.
    }
  },
  mode: "None",
};

// This function can be used for 'live' updates of brushes. That is, during the
// specification of a brush, this method can be called to update the view.
//
// @param newSelection - The new set of data items that is currently contained
//                       by the brushes
function brushUpdated(newSelection) {
  __.brushed = newSelection;
  events.brush.call(pc,__.brushed);
  pc.render();
}

pc.brushModes = function() {
  return Object.getOwnPropertyNames(brush.modes);
};

pc.brushMode = function(mode) {
  if (arguments.length === 0) {
    return brush.mode;
  }

  if (pc.brushModes().indexOf(mode) === -1) {
    throw "pc.brushmode: Unsupported brush mode: " + mode;
  }

  // Make sure that we don't trigger unnecessary events by checking if the mode
  // actually changes.
  if (mode !== brush.mode) {
    // When changing brush modes, the first thing we need to do is clearing any
    // brushes from the current mode, if any.
    if (brush.mode !== "None") {
      pc.brushReset();
    }

    // Next, we need to 'uninstall' the current brushMode.
    brush.modes[brush.mode].uninstall(pc);
    // Finally, we can install the requested one.
    brush.mode = mode;
    brush.modes[brush.mode].install();
  }

  return pc;
};


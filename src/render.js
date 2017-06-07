pc.render = function() {
  // try to autodetect dimensions and create scales
  if (!d3.keys(__.dimensions).length) {
    pc.detectDimensions()
  }
  pc.autoscale();

  pc.render[__.mode]();

  events.render.call(this);
  return this;
};

pc.renderBrushed = function() {
  if (!d3.keys(__.dimensions).length) pc.detectDimensions();

  pc.renderBrushed[__.mode]();

  events.render.call(this);
  return this;
};

function isBrushed() {
  if (__.brushed && __.brushed.length !== __.data.length)
    return true;

  var object = brush.currentMode().brushState();

  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      return true;
    }
  }
  return false;
};

pc.render.default = function() {
  pc.clear('foreground');
  pc.clear('highlight');

  pc.renderBrushed.default();

  __.data.forEach(path_foreground);
};

var foregroundQueue = d3.renderQueue(path_foreground)
  .rate(50)
  .clear(function() {
    pc.clear('foreground');
    pc.clear('highlight');
  });

pc.render.queue = function() {
  pc.renderBrushed.queue();

  foregroundQueue(__.data);
};

pc.renderBrushed.default = function() {
  pc.clear('brushed');

  if (isBrushed()) {
    __.brushed.forEach(path_brushed);
  }
};

var brushedQueue = d3.renderQueue(path_brushed)
  .rate(50)
  .clear(function() {
    pc.clear('brushed');
  });

pc.renderBrushed.queue = function() {
  if (isBrushed()) {
    brushedQueue(__.brushed);
  } else {
    brushedQueue([]); // This is needed to clear the currently brushed items
  }
};

pc.unbrush = function(d) {
  // Helper method to splice element from brushed
  var splice = function(element) {
    var index = __.brushed.indexOf(element);
    if (index > -1) {
      __.brushed.splice(index, 1);
    }
  };

  // If no argument is passed, then unbrush all
  if (typeof d === 'undefined') {
    __.brushed = [];
  }
  // If nothing has been brushed, then there's nothing to unbrush
  else if (!__.brushed) {
    return;
  }

  // If an array is passed, then unbrush each object in array
  if (Array.isArray(d)) {
    for (var i = 0; i < d.length; ++i) {
      splice(d[i]);
    }
  }

  // Otherwise, just remove that one object
  else if (typeof d === 'object') {
    splice(d);
  }

  pc.renderBrushed();
};

pc.brush = function(d) {
  // Helper method to insert element into brushed
  var push = function(element) {
    var index = __.brushed.indexOf(element);
    if (index === -1) {
      __.brushed.push(element);
    }
  };

  // If no argument is passed, then brush all
  if (typeof d === 'undefined') {
    // Create a copy of data
    __.brushed = __.data.slice();
  }

  // If an array is passed, then brush each object in array
  else if (Array.isArray(d)) {
    for (var i = 0; i < d.length; ++i) {
      push(d[i]);
    }
  }

  // Otherwise, just push that one object
  else {
    push(d);
  }

  pc.renderBrushed();
};

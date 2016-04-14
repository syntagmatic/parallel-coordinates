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
    if (!__.brushed) {
      return;
    }
    var index = __.brushed.indexOf(element);
    if (index > -1) {
      __.brushed.splice(index, 1);
    }
  };

  // If no argument is passed, then unbrush all
  if (typeof d === 'undefined') {
    __.brushed = [];
  }
  // If an argument is passed, then elements must be brushed
  else if (!__.brushed) {
    return;
  }

  // If an array is passed, then go through all the objects
  if (Array.isArray(d)) {
    for (var i = 0; i < d.length; ++i) {
      splice(d[i]);
    }
  }

  // Just remove that one object
  else {
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

  // Insert each element in the array
  else if (Array.isArray(d)) {
    for (var i = 0; i < d.length; ++i) {
      push(d[i]);
    }
  }

  // Insert the element
  else {
    push(d);
  }

  pc.renderBrushed();
};

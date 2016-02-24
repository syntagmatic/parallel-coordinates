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

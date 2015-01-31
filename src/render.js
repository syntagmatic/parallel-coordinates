pc.render = function() {
  // try to autodetect dimensions and create scales
  if (!__.dimensions.length) pc.detectDimensions();
  if (!(__.dimensions[0] in yscale)) pc.autoscale();

  pc.render[__.mode]();

  events.render.call(this);
  return this;
};

pc.render['default'] = function() {
  pc.clear('foreground');
  pc.clear('highlight');
  if (__.brushed) {
    __.brushed.forEach(path_foreground);
    __.highlighted.forEach(path_highlight);
  } else {
    __.data.forEach(path_foreground);
    __.highlighted.forEach(path_highlight);
  }
};

var rqueue = d3.renderQueue(path_foreground)
  .rate(50)
  .clear(function() {
    pc.clear('foreground');
    pc.clear('highlight');
  });

pc.render.queue = function() {
  if (__.brushed) {
    rqueue(__.brushed);
    __.highlighted.forEach(path_highlight);
  } else {
    rqueue(__.data);
    __.highlighted.forEach(path_highlight);
  }
};

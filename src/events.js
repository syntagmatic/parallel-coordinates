var events = d3.dispatch.apply(this,["render", "resize", "highlight", "brush"].concat(d3.keys(__))),
    w = function() { return __.width - __.margin.right - __.margin.left; },
    h = function() { return __.height - __.margin.top - __.margin.bottom },
    flags = {
      brushable: false,
      reorderable: false,
      axes: false,
      interactive: false,
      shadows: false,
      debug: false
    },
    xscale = d3.scale.ordinal(),
    yscale = {},
    dragging = {},
    line = d3.svg.line(),
    axis = d3.svg.axis().orient("left").ticks(5),
    g, // groups for axes, brushes
    ctx = {},
    canvas = {};

// side effects for setters
var side_effects = d3.dispatch.apply(this,d3.keys(__))
  .on("composite", function(d) { ctx.foreground.globalCompositeOperation = d.value; })
  .on("alpha", function(d) { ctx.foreground.globalAlpha = d.value; })
  .on("width", function(d) { pc.resize(); })
  .on("height", function(d) { pc.resize(); })
  .on("margin", function(d) { pc.resize(); })
  .on("rate", function(d) { rqueue.rate(d.value); })
  .on("data", function(d) {
    if (flags.shadows) paths(__.data, ctx.shadows);
  })
  .on("dimensions", function(d) {
    xscale.domain(__.dimensions);
    if (flags.interactive) pc.render().updateAxes();
  });

// expose the state of the chart
pc.state = __;
pc.flags = flags;

// create getter/setters
getset(pc, __, events);

// expose events
d3.rebind(pc, events, "on");

// tick formatting
d3.rebind(pc, axis, "ticks", "orient", "tickValues", "tickSubdivide", "tickSize", "tickPadding", "tickFormat");

// getter/setter with event firing
function getset(obj,state,events)  {
  d3.keys(state).forEach(function(key) {
    obj[key] = function(x) {
      if (!arguments.length) return state[key];
      var old = state[key];
      state[key] = x;
      side_effects[key].call(pc,{"value": x, "previous": old});
      events[key].call(pc,{"value": x, "previous": old});
      return obj;
    };
  });
};

function extend(target, source) {
  for (key in source) {
    target[key] = source[key];
  }
  return target;
};

var events = d3.dispatch.apply(this,["render", "resize", "highlight", "brush", "brushend", "brushstart", "axesreorder"].concat(d3.keys(__))),
    w = function() { return __.width - __.margin.right - __.margin.left; },
    h = function() { return __.height - __.margin.top - __.margin.bottom; },
    flags = {
      brushable: false,
      reorderable: false,
      axes: false,
      interactive: false,
      debug: false
    },
    xscale = d3.scale.ordinal(),
    dragging = {},
    line = d3.svg.line(),
    axis = d3.svg.axis().orient("left").ticks(5),
    g, // groups for axes, brushes
    ctx = {},
    canvas = {},
    clusterCentroids = [];

// side effects for setters
var side_effects = d3.dispatch.apply(this,d3.keys(__))
  .on("composite", function(d) {
    ctx.foreground.globalCompositeOperation = d.value;
    ctx.brushed.globalCompositeOperation = d.value;
  })
  .on("alpha", function(d) {
    ctx.foreground.globalAlpha = d.value;
    ctx.brushed.globalAlpha = d.value;
  })
  .on("brushedColor", function (d) {
    ctx.brushed.strokeStyle = d.value;
  })
  .on("width", function(d) { pc.resize(); })
  .on("height", function(d) { pc.resize(); })
  .on("margin", function(d) { pc.resize(); })
  .on("rate", function(d) {
    brushedQueue.rate(d.value);
    foregroundQueue.rate(d.value);
  })
  .on("dimensions", function(d) {
    __.dimensions = pc.applyDimensionDefaults(d3.keys(d.value));
    xscale.domain(pc.getOrderedDimensionKeys());
    pc.sortDimensions();
    if (flags.interactive){pc.render().updateAxes();}
  })
  .on("bundleDimension", function(d) {
      if (!d3.keys(__.dimensions).length) pc.detectDimensions();
      pc.autoscale();
      if (typeof d.value === "number") {
          if (d.value < d3.keys(__.dimensions).length) {
              __.bundleDimension = __.dimensions[d.value];
          } else if (d.value < __.hideAxis.length) {
              __.bundleDimension = __.hideAxis[d.value];
          }
      } else {
          __.bundleDimension = d.value;
      }

      __.clusterCentroids = compute_cluster_centroids(__.bundleDimension);
    if (flags.interactive){pc.render();}
  })
  .on("hideAxis", function(d) {
    pc.dimensions(pc.applyDimensionDefaults());
    pc.dimensions(without(__.dimensions, d.value));
  })
  .on("flipAxes", function(d) {
    if (d.value && d.value.length) {
        d.value.forEach(function(axis) {
            flipAxisAndUpdatePCP(axis);
        });
        pc.updateAxes(0);
    }
  });

// expose the state of the chart
pc.state = __;
pc.flags = flags;

// create getter/setters
getset(pc, __, events);

// expose events
d3.rebind(pc, events, "on");

// getter/setter with event firing
function getset(obj,state,events)  {
  d3.keys(state).forEach(function(key) {
      obj[key] = function(x) {
        if (!arguments.length) {
          return state[key];
        }
        if (key === 'dimensions' && Object.prototype.toString.call(x) === '[object Array]') {
          console.warn("pc.dimensions([]) is deprecated, use pc.dimensions({})");
          x = pc.applyDimensionDefaults(x);
        }
        var old = state[key];
        state[key] = x;
        side_effects[key].call(pc,{"value": x, "previous": old});
        events[key].call(pc,{"value": x, "previous": old});
        return obj;
      };
  });
};

function extend(target, source) {
  for (var key in source) {
    target[key] = source[key];
  }
  return target;
};

function without(arr, items) {
  items.forEach(function (el) {
    delete arr[el];
  });
  return arr;
};

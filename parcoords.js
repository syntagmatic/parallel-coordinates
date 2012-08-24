function parcoords(container) {
  var pc = {};

  var container = document.getElementById(container),
      events = d3.dispatch("render", "resize"),
      width = container.clientWidth,
      height = container.clientHeight,
      padding = [10, 10, 10, 10],
      w = width - padding[1] - padding[3],
      h = height - padding[0] - padding[2],
      xscale = d3.scale.ordinal().rangePoints([0, w], 1),
      yscale = {},
      dragging = {},
      line = d3.svg.line(),
      axis = d3.svg.axis().orient("left").ticks(1+height/50),
      data,
      ctx = {},
      dimensions,
      legend,
      render_speed = 50,
      brush_count = 0,
      excluded_groups = [];

  // canvas data layers
  ["foreground", "highlight", "background"].forEach(function(layer) {
    ctx[layer] = d3.select(container)
      .append("canvas")
        .attr("class", "foreground")
        .style("margin-top", padding[0] + "px")
        .style("margin-left", padding[3] + "px") 
        .attr("width", width)
        .attr("height", height)
        [0][0].getContext("2d");
  });

  // svg tick and brush layers
  var svg = pc.svg = d3.select(container)
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("svg:g")
      .attr("transform", "translate(" + padding[3] + "," + padding[0] + ")");

  pc.dimensions = function(x) {
    if (!x) return dimensions;
    dimensions = x;
    return this;
  };

  pc.data = function(x) {
    if (!x) return data;
    data = x;
    return this;
  };

  pc.height = function(x) {
    if (!x) return height;
    height = x;
    return this;
  };

  pc.width = function(x) {
    if (!x) return width;
    width = x;
    return this;
  };

  pc.padding = function(x) {
    if (!x) return padding;
    padding = x;
    w = width - padding[1] - padding[3];
    h = height - padding[0] - padding[2];
    xscale = d3.scale.ordinal().rangePoints([0, w], 1);
    return this;
  };

  pc.autoscale = function() {
    // xscale
    xscale.domain(dimensions);

    // yscale
    dimensions.forEach(function(k) {
      yscale[k] = d3.scale.linear()
        .domain(d3.extent(data, function(d) { return +d[k]; }))
        .range([h, 0])
    });

    return this;
  };

  pc.render = function() {
    ctx.foreground.clearRect(0,0,w,h);
    data.forEach(pathForeground);
  };

  // expose a few objects
  pc.xscale = xscale;
  pc.yscale = yscale;
  pc.ctx = ctx;


  // Internal Utility Functions

  // Create a single polyline
  function path(d, ctx) {
    ctx.beginPath();
    dimensions.map(function(p,i) {
      if (i == 0) {
        ctx.moveTo(xscale(p),yscale[p](d[p]));
      } else { 
        ctx.lineTo(xscale(p),yscale[p](d[p]));
      }
    });
    ctx.stroke();
  };

  function pathForeground(d) {
    return path(d, ctx.foreground);
  };

  return pc;
};


// Global utility functions

// Get pairs of adjacent dimensions
function adjacent_pairs(arr) {
  var ret = [];
  for (var i = 0; i < arr.length-1; i++) {
    console.log(i);
    ret.push([arr[i],arr[i+1]]);
  };
  return ret;
};

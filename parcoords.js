function parcoords(container) {
  var pc = {};

  var container = document.getElementById(container),
      events = d3.dispatch("render", "resize"),
      width = container.clientWidth,
      height = container.clientHeight,
      padding = [60, 10, 10, 10],
      w = width - padding[1] - padding[3],
      h = height - padding[0] - padding[2],
      xscale = d3.scale.ordinal().rangePoints([0, w], 1),
      yscale = {},
      dragging = {},
      line = d3.svg.line(),
      axis = d3.svg.axis().orient("left").ticks(1+height/50),
      data,
      brushed,
      ctx = {},
      dimensions,
      excluded_groups = [];

  // canvas data layers
  ["background", "foreground", "highlight"].forEach(function(layer) {
    ctx[layer] = d3.select(container)
      .append("canvas")
        .attr("class", "foreground")
        .style("margin-top", padding[0] + "px")
        .style("margin-left", padding[3] + "px") 
        .attr("width", width)
        .attr("height", height)
        [0][0].getContext("2d");
  });

  // default styles
  ctx.foreground.strokeStyle = "rgba(0,100,160,0.5)";
  ctx.foreground.lineWidth = 1.7;
  ctx.background.strokeStyle = "rgba(140,140,140,0.2)";
  ctx.background.fillStyle = "rgba(255,255,255,0.3)";

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
    pc.clear('foreground');
    if (brushed) {
      brushed.forEach(path_foreground);
    } else {
      data.forEach(path_foreground);
    }
    return this;
  };

  pc.clear = function(layer) {
    ctx[layer].clearRect(0,0,w+1,h+1);
  };

  pc.brushable = function() {
    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions)
      .enter().append("svg:g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })

    // Add an axis and title.
    g.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(0,0)")
        .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
      .append("svg:text")
        .attr("text-anchor", "left")
        .attr("y", 0)
        .attr("transform", "rotate(-30) translate(-6,-8)")
        .attr("x", 0)
        .attr("class", "label")
        .text(String)

    // Add and store a brush for each axis.
    g.append("svg:g")
        .attr("class", "brush")
        .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
      .selectAll("rect")
        .style("visibility", null)
        .attr("x", -15)
        .attr("width", 30)

    return this;
  };

  // Get data within brushes
  function brush() {
    brushed = selected();  
    pc.render();
    extent_area();
  };

  // expose a few objects
  pc.xscale = xscale;
  pc.yscale = yscale;
  pc.ctx = ctx;
  pc.brushed = function() { return brushed };


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

  function extent_area() {
    pc.clear('background');

    // no active brushes
    var actives = dimensions.filter(is_brushed);
    if (actives.length == 0) return;

    // create envelope
    var ctx = pc.ctx.background;
    ctx.beginPath();
    dimensions.map(function(p,i) {
      if (i == 0) {
        ctx.moveTo(xscale(p), brush_max(p));
      } else { 
        ctx.lineTo(xscale(p), brush_max(p));
      }
    });
    dimensions.reverse().map(function(p,i) {
      ctx.lineTo(xscale(p), brush_min(p));
    });
    ctx.fill();
    ctx.stroke();
  };

  function is_brushed(p) { 
    return !yscale[p].brush.empty();
  };

  function brush_max(p) {
    return is_brushed(p) ? yscale[p](yscale[p].brush.extent()[1]) : 0;
  };

  function brush_min(p) {
    return is_brushed(p) ? yscale[p](yscale[p].brush.extent()[0]) : h;
  };

  // Data within extents;
  function selected() {
    var actives = dimensions.filter(is_brushed),
        extents = actives.map(function(p) { return yscale[p].brush.extent(); });

    return data
      .filter(function(d) {
        return actives.every(function(p, dimension) {
          return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1];
        });
      });
  };

  function path_foreground(d) {
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

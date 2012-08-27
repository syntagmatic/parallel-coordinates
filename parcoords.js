function parcoords(container) {

  var pc = {};

  var container = d3.select("#" + container),
      events = d3.dispatch("render", "resize"),
      width = container[0][0].clientWidth,
      height = container[0][0].clientHeight,
      padding = [24, 0, 24, 0],
      w = width - padding[1] - padding[3],
      h = height - padding[0] - padding[2],
      xscale = d3.scale.ordinal().rangePoints([0, w], 1),
      yscale = {},
      dragging = {},
      color = "rgba(0,100,160,0.5)",
      line = d3.svg.line(),
      axis = d3.svg.axis().orient("left").ticks(1+height/50),
      data,
      brushed,
      g,                            // groups for axes, brushes
      ctx = {},
      dimensions,
      excluded_groups = [];

  // canvas data layers
  ["background", "foreground", "highlight"].forEach(function(layer) {
    ctx[layer] = container
      .append("canvas")
        .attr("class", "foreground")
        .style("margin-top", padding[0] + "px")
        .style("margin-left", padding[3] + "px") 
        .attr("width", width)
        .attr("height", height)
        [0][0].getContext("2d");
  });

  // default styles
  ctx.foreground.strokeStyle = color;
  ctx.foreground.lineWidth = 1.7;
  ctx.background.strokeStyle = "rgba(140,140,140,0.25)";
  ctx.background.fillStyle = "rgba(255,255,255,0.4)";

  // svg tick and brush layers
  var svg = pc.svg = container
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("svg:g")
      .attr("transform", "translate(" + padding[3] + "," + padding[0] + ")");

  pc.dimensions = function(_) {
    if (!arguments.length) return dimensions;
    dimensions = _;
    return this;
  };

  pc.data = function(_) {
    if (!arguments.length) return data;
    data = _;
    return this;
  };

  pc.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  pc.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  pc.color = function(_) {
    if (!arguments.length) return _;
    color = _;
    return this;
  };

  pc.state = function() {
    return {
      dimensions: dimensions,
      data: data,
      width: width,
      height: height,
      padding: padding,
      color: color
    };
  };

  // BROKEN!
  pc.padding = function(x) {
    if (!x) return padding;
    padding = x;
    w = width - padding[1] - padding[3];
    h = height - padding[0] - padding[2];

    container.selectAll("canvas")
        .style("margin-top", padding[0] + "px")
        .style("margin-left", padding[3] + "px") 
    svg
      .attr("transform", "translate(" + padding[3] + "," + padding[0] + ")");
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

  pc.detectDimensions = function() {
    dimensions = parcoords.quantitative(data);
    return this;
  };

  pc.render = function() {
    // try to autodetect dimensions and create scales
    if (!dimensions) pc.detectDimensions();
    if (pc.xscale.domain().length == 0) pc.autoscale();

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

  pc.createAxes = function() {
    // Add a group element for each dimension.
    g = svg.selectAll(".dimension")
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
        .attr({
          "text-anchor": "left",
          "y": 0,
          "transform": "rotate(-30) translate(-6,-8)",
          "x": 0,
          "class": "label"
        })
        .text(String)
    return this;
  };

  pc.brushable = function() {
    if (!g) pc.createAxes(); 

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

  // Jason Davies, http://bl.ocks.org/1341281
  pc.reorderable = function() {
    if (!g) pc.createAxes(); 

    g.style("cursor", "move")
      .call(d3.behavior.drag()
        .on("dragstart", function(d) {
          dragging[d] = this.__origin__ = xscale(d);
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          xscale.domain(dimensions);
          pc.render();
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete this.__origin__;
          delete dragging[d];
          d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");
          pc.render();
        }))

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
    ctx.strokeStyle = d3.functor(color)(d);
    ctx.beginPath();
    dimensions.map(function(p,i) {
      if (i == 0) {
        ctx.moveTo(position(p),yscale[p](d[p]));
      } else { 
        ctx.lineTo(position(p),yscale[p](d[p]));
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

  function position(d) {
    var v = dragging[d];
    return v == null ? xscale(d) : v;
  }

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

parcoords.version = "beta";

// Global utility functions

// Get quantitative dimensions based on numerical or null values in the first row
parcoords.quantitative = function(data) {
  return d3.keys(data[0])
    .filter(function(col) {
      var v = data[0][col];
      return (parseFloat(v) == v) && (v != null);
    });
};

// Get pairs of adjacent dimensions
parcoords.adjacent_pairs = function(arr) {
  var ret = [];
  for (var i = 0; i < arr.length-1; i++) {
    console.log(i);
    ret.push([arr[i],arr[i+1]]);
  };
  return ret;
};

d3.getset = function(_)  {
  var self = this
  Object.keys(_).forEach(function(key) {   
    self[key] = function(x) {
      if (!arguments.length) return _[key];
      _[key] = x;
      return self;
    }
  });
}

function parcoords(container) {

  var pc = {};

  var container = d3.select("#" + container);

  // an experimental object suggested by Ziggy Jonsson
  var __ = {
    width: 600,
    height: 300,
    margin: { top: 24, right: 0, bottom: 12, left: 0 },
    color: "rgba(0,100,160,0.5)",
    data: [],
    dimensions: [],
  };

  // expose the state of the chart
  pc.__ = __;
  d3.getset.call(pc, __);

  // set width and height
  pc.width(container[0][0].clientWidth);
  pc.height(container[0][0].clientHeight);

  var events = d3.dispatch("render", "resize"),
      w = function() { return __.width - __.margin.right - __.margin.left; },
      h = function() { return __.height - __.margin.top - __.margin.bottom },
      xscale = d3.scale.ordinal().rangePoints([0, w()], 1),
      yscale = {},
      dragging = {},
      line = d3.svg.line(),
      axis = d3.svg.axis().orient("left").ticks(1+__.height/50),
      brushed,
      g,                            // groups for axes, brushes
      ctx = {};

  // canvas data layers
  ["background", "foreground", "highlight"].forEach(function(layer) {
    ctx[layer] = container
      .append("canvas")
        .attr("class", layer)
        .style("margin-top", __.margin.top + "px")
        .style("margin-left", __.margin.left + "px") 
        .attr("width", w())
        .attr("height", h())
        [0][0].getContext("2d");
  });

  // default styles
  ctx.foreground.strokeStyle = __.color;
  ctx.foreground.lineWidth = 1.7;
  ctx.background.strokeStyle = "rgba(140,140,140,0.25)";
  ctx.background.fillStyle = "rgba(255,255,255,0.4)";

  // svg tick and brush layers
  var svg = pc.svg = container
    .append("svg")
      .attr("width", __.width)
      .attr("height", __.height)
    .append("svg:g")
      .attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");

  pc.autoscale = function() {
    // xscale
    xscale.domain(__.dimensions);

    // yscale
    __.dimensions.forEach(function(k) {
      yscale[k] = d3.scale.linear()
        .domain(d3.extent(__.data, function(d) { return +d[k]; }))
        .range([h(), 0])
    });

    return this;
  };

  pc.detectDimensions = function() {
    __.dimensions = parcoords.quantitative(__.data);
    return this;
  };

  pc.render = function() {
    // try to autodetect dimensions and create scales
    if (!__.dimensions.length) pc.detectDimensions();
    if (!pc.xscale.domain().length) pc.autoscale();

    pc.clear('foreground');
    if (brushed) {
      brushed.forEach(path_foreground);
    } else {
      __.data.forEach(path_foreground);
    }
    return this;
  };

  pc.clear = function(layer) {
    ctx[layer].clearRect(0,0,w()+1,h()+1);
  };

  pc.createAxes = function() {
    // Add a group element for each dimension.
    g = svg.selectAll(".dimension")
        .data(__.dimensions)
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
        .each(function(d) {
          d3.select(this).call(
            yscale[d].brush = d3.svg.brush()
              .y(yscale[d])
              .on("brush", brush)
          );
        })
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
          dragging[d] = Math.min(w(), Math.max(0, this.__origin__ += d3.event.dx));
          __.dimensions.sort(function(a, b) { return position(a) - position(b); });
          xscale.domain(__.dimensions);
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

  // BROKEN!
  pc.margin = function(_) {
    if (!arguments.length) return __.margin;
    __.margin = _;
    container.selectAll("canvas")
        .style("margin-left", __.margin.left + "px") 
        .style("margin-left", __.margin.left + "px") 
        .attr("width", w())
        .attr("height", h())
    svg
      .attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");
    xscale = d3.scale.ordinal().rangePoints([0, w()], 1);
    return this;
  };


  // utility Functions

  // draw single polyline
  function path(d, ctx) {
    ctx.strokeStyle = d3.functor(__.color)(d);
    ctx.beginPath();
    __.dimensions.map(function(p,i) {
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
    var actives = __.dimensions.filter(is_brushed);
    if (actives.length == 0) return;

    // create envelope
    var ctx = pc.ctx.background;
    ctx.beginPath();
    __.dimensions.map(function(p,i) {
      if (i == 0) {
        ctx.moveTo(xscale(p), brush_max(p));
      } else { 
        ctx.lineTo(xscale(p), brush_max(p));
      }
    });
    __.dimensions.reverse().map(function(p,i) {
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
    return is_brushed(p) ? yscale[p](yscale[p].brush.extent()[0]) : h();
  };

  function position(d) {
    var v = dragging[d];
    return v == null ? xscale(d) : v;
  }

  // data within extents
  function selected() {
    var actives = __.dimensions.filter(is_brushed),
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

// quantitative dimensions based on numerical or null values in the first row
parcoords.quantitative = function(data) {
  return d3.keys(data[0])
    .filter(function(col) {
      var v = data[0][col];
      return (parseFloat(v) == v) && (v != null);
    });
};

// pairs of adjacent dimensions
parcoords.adjacent_pairs = function(arr) {
  var ret = [];
  for (var i = 0; i < arr.length-1; i++) {
    ret.push([arr[i],arr[i+1]]);
  };
  return ret;
};

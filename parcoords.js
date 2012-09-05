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

d3.parcoords = function(config) {
  // an experimental object suggested by Ziggy Jonsson
  var __ = {
    dimensions: [],
    data: [],
    width: 600,
    height: 300,
    margin: { top: 24, right: 0, bottom: 12, left: 0 },
    color: "#069",
    compositing: "source-over",
    alpha: "0.7"
  };

  extend(__, config);

  var pc = function(selection) {
    selection = pc.selection = d3.select(selection);

    // set width and height
    __.width = selection[0][0].clientWidth;
    __.height = selection[0][0].clientHeight;

    // canvas data layers
    ["background", "marks", "foreground", "highlight"].forEach(function(layer) {
      ctx[layer] = selection
        .append("canvas")
          .attr("class", layer)
          [0][0].getContext("2d");
    });

    // svg tick and brush layers
    var svg = pc.svg = selection
      .append("svg")
        .attr("width", __.width)
        .attr("height", __.height)
      .append("svg:g")
        .attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");

    return pc;
  };

  var events = d3.dispatch("render", "resize", "highlight", "brush"),
      w = function() { return __.width - __.margin.right - __.margin.left; },
      h = function() { return __.height - __.margin.top - __.margin.bottom },
      xscale = d3.scale.ordinal(),
      yscale = {},
      dragging = {},
      line = d3.svg.line(),
      axis = d3.svg.axis().orient("left").ticks(1+__.height/50),
      brushed,
      g,                            // groups for axes, brushes
      ctx = {};

  // expose the state of the chart
  pc.__ = __;
  d3.getset.call(pc, __);
  d3.rebind(pc, events, "on");

  pc.autoscale = function() {
    // xscale
    xscale.rangePoints([0, w()], 1)
      .domain(__.dimensions);

    // yscale
    __.dimensions.forEach(function(k) {
      yscale[k] = d3.scale.linear()
        .domain(d3.extent(__.data, function(d) { return +d[k]; }))
        .range([h(), 0])
    });

    // canvas sizes 
    pc.selection.selectAll("canvas")
        .style("margin-top", __.margin.top + "px") 
        .style("margin-left", __.margin.left + "px") 
        .attr("width", w())
        .attr("height", h())

    // default styles
    ctx.foreground.strokeStyle = __.color;
    ctx.foreground.lineWidth = 1.4;
    ctx.foreground.globalCompositeOperation = __.composite;
    ctx.foreground.globalAlpha = __.alpha;
    ctx.highlight.lineWidth = 3;
    ctx.background.strokeStyle = "rgba(140,140,140,0.25)";
    ctx.background.fillStyle = "rgba(255,255,255,0.4)";

    return this;
  };

  pc.detectDimensions = function() {
    __.dimensions = d3.parcoords.quantitative(__.data);
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
    events.render();

    return this;
  };

  pc.axisDots = function() {
    var ctx = pc.ctx.marks;
    ctx.globalAlpha = d3.min([1/Math.pow(data.length, 1/2), 1]);
    __.data.forEach(function(d) {
      __.dimensions.map(function(p,i) {
        ctx.fillRect(position(p)-0.75,yscale[p](d[p])-0.75,1.5,1.5);
      });
    });
    return this;
  };

  pc.clear = function(layer) {
    ctx[layer].clearRect(0,0,w()+1,h()+1);
    return this;
  };

  pc.createAxes = function() {
    // Add a group element for each dimension.
    g = pc.svg.selectAll(".dimension")
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
    events.brush(pc.brushed());
  };

  // expose a few objects
  pc.xscale = xscale;
  pc.yscale = yscale;
  pc.ctx = ctx;
  pc.brushed = function() { return brushed };

  // rescale for height, width and margins
  pc.resize = function() {
    // selection size
    pc.selection.select("svg") 
      .attr("width", __.width)
      .attr("height", __.height)
    pc.svg.attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");

    // scales
    pc.autoscale();

    // axes
    if (g) {
      g.attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
      g.selectAll("g.axis").each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
    };
 
    pc.render();
    events.resize();

    return this;
  };

  // highlight an array of data
  pc.highlight = function(data) {
    pc.clear("highlight");
    ctx.highlight.fillStyle = "rgba(255,255,255,0.8)";
    ctx.highlight.fillRect(-1,-1,w()+2,h()+2);
    data.forEach(path_highlight);
    events.highlight();
    return this;
  };

  // clear highlighting
  pc.unhighlight = function(data) {
    pc.clear("highlight");
    return this;
  };

  // custom getsets
  pc.height = function(_) {
    if (!arguments.length) return __.height;
    __.height  = _;
    pc.resize();
    return this;
  };

  pc.width = function(_) {
    if (!arguments.length) return __.width;
    __.width = _;
    pc.resize();
    return this;
  };

  pc.margin = function(_) {
    if (!arguments.length) return __.margin;
    __.margin = _;
    pc.resize();
    return this;
  };

  pc.composite = function(_) {
    if (!arguments.length) return __.composite;
    __.composite = _;
    ctx.foreground.globalCompositeOperation = __.composite;
    return this;
  };

  pc.alpha = function(_) {
    if (!arguments.length) return __.alpha;
    __.alpha = _;
    ctx.foreground.globalAlpha = __.alpha;
    return this;
  };

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

    return __.data
      .filter(function(d) {
        return actives.every(function(p, dimension) {
          return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1];
        });
      });
  };

  function path_foreground(d) {
    return path(d, ctx.foreground);
  };

  function path_highlight(d) {
    return path(d, ctx.highlight);
  };

  function extend(target, source) {
    for (key in source) {
      target[key] = source[key];
    }
    return target;
  };

  return pc;
};

d3.parcoords.version = "beta";

// quantitative dimensions based on numerical or null values in the first row
d3.parcoords.quantitative = function(data) {
  return d3.keys(data[0])
    .filter(function(col) {
      var v = data[0][col];
      return (parseFloat(v) == v) && (v != null);
    });
};

// pairs of adjacent dimensions
d3.parcoords.adjacent_pairs = function(arr) {
  var ret = [];
  for (var i = 0; i < arr.length-1; i++) {
    ret.push([arr[i],arr[i+1]]);
  };
  return ret;
};

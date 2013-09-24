pc.interactive = function() {
  flags.interactive = true;
  return this;
};

// Get data within brushes
pc.brush = function() {
  __.brushed = selected();
  events.brush.call(pc,__.brushed);
  pc.render();
};

// expose a few objects
pc.xscale = xscale;
pc.yscale = yscale;
pc.ctx = ctx;
pc.canvas = canvas;
pc.g = function() { return g; };

pc.brushReset = function(dimension) {
  if (g) {
    g.selectAll('.brush')
      .each(function(d) {
        d3.select(this).call(
          yscale[d].brush.clear()
        );
      })
    pc.brush();
  }
  return this;
};

// rescale for height, width and margins
// TODO currently assumes chart is brushable, and destroys old brushes
pc.resize = function() {
  // selection size
  pc.selection.select("svg")
    .attr("width", __.width)
    .attr("height", __.height)
  pc.svg.attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");

  // scales
  pc.autoscale();

  // axes, destroys old brushes. the current brush state should pass through in the future
  if (g) pc.createAxes().brushable();

  events.resize.call(this, {width: __.width, height: __.height, margin: __.margin});
  return this;
};

// highlight an array of data
pc.highlight = function(data) {
  pc.clear("highlight");
  d3.select(canvas.foreground).classed("faded", true);
  data.forEach(path_highlight);
  events.highlight.call(this,data);
  return this;
};

// clear highlighting
pc.unhighlight = function(data) {
  pc.clear("highlight");
  d3.select(canvas.foreground).classed("faded", false);
  return this;
};

// calculate 2d intersection of line a->b with line c->d
// points are objects with x and y properties
pc.intersection =  function(a, b, c, d) {
  return {
    x: ((a.x * b.y - a.y * b.x) * (c.x - d.x) - (a.x - b.x) * (c.x * d.y - c.y * d.x)) / ((a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x)),
    y: ((a.x * b.y - a.y * b.x) * (c.y - d.y) - (a.y - b.y) * (c.x * d.y - c.y * d.x)) / ((a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x))
  };
};

function is_brushed(p) {
  return !yscale[p].brush.empty();
};

// data within extents
function selected() {
  var actives = __.dimensions.filter(is_brushed),
      extents = actives.map(function(p) { return yscale[p].brush.extent(); });

  // test if within range
  var within = {
    "date": function(d,p,dimension) {
      return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
    },
    "number": function(d,p,dimension) {
      return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
    },
    "string": function(d,p,dimension) {
      return extents[dimension][0] <= yscale[p](d[p]) && yscale[p](d[p]) <= extents[dimension][1]
    }
  };

  return __.data
    .filter(function(d) {
      return actives.every(function(p, dimension) {
        return within[__.types[p]](d,p,dimension);
      });
    });
};

function position(d) {
  var v = dragging[d];
  return v == null ? xscale(d) : v;
}

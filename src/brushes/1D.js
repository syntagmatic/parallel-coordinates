// brush mode: 1D-Axes

pc.brushExtents = function() {
  var extents = {};
  __.dimensions.forEach(function(d) {
    var brush = yscale[d].brush;
    if (!brush.empty()) {
      // https://github.com/mbostock/d3/wiki/SVG-Controls#brush_extent
      // NOTE: According to the documentation, inversion is required *if* the
      //       brush is moved by the user (on mousemove following a mousedown).
      //       However, this gets me the wrong values, so no inversion here.
      //       See issue: mbostock/d3 #1981
      var extent = brush.extent();
      extent.sort(d3.ascending);
      extents[d] = extent;
    }
  });
  return extents;
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
            .on("brushstart", function() {
              d3.event.sourceEvent.stopPropagation();
            })
            .on("brush", pc.brush)
            .on("brushend", function() {
              events.brushend.call(pc, __.brushed);
            })
        );
      })
    .selectAll("rect")
      .style("visibility", null)
      .attr("x", -15)
      .attr("width", 30);
  flags.brushable = true;
  return this;
};

brushModes["1D-axes"] = {
  install: function() {
  },
  uninstall: function() {
  }
}


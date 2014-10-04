// brush mode: 1D-Axes

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


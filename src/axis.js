pc.createAxes = function() {
  if (g) pc.removeAxes();

  // Add a group element for each dimension.
  g = pc.svg.selectAll(".dimension")
      .data(__.dimensions, function(d) { return d; })
    .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; });

  // Add an axis and title.
  g.append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
    .append("svg:text")
      .attr({
        "text-anchor": "middle",
        "y": 0,
        "transform": "translate(0,-12)",
        "x": 0,
        "class": "label"
      })
      .text(function(d) {
        return d in __.dimensionTitles ? __.dimensionTitles[d] : d;  // dimension display names
      });

  flags.axes= true;
  return this;
};

pc.removeAxes = function() {
  g.remove();
  return this;
};

pc.updateAxes = function() {
  var g_data = pc.svg.selectAll(".dimension")
      .data(__.dimensions, function(d) { return d; });

  g_data.enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(p) { return "translate(" + position(p) + ")"; })
      .style("opacity", 0)
    .append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
    .append("svg:text")
      .attr({
        "text-anchor": "middle",
        "y": 0,
        "transform": "translate(0,-12)",
        "x": 0,
        "class": "label"
      })
      .text(String);

  g_data.exit().remove();

  g = pc.svg.selectAll(".dimension");

  g.transition().duration(1100)
    .attr("transform", function(p) { return "translate(" + position(p) + ")"; })
    .style("opacity", 1);

  pc.svg.selectAll(".axis").transition().duration(1100)
  	.each(function(d) { d3.select(this).call(axis.scale(yscale[d])); });

  if (flags.shadows) paths(__.data, ctx.shadows);
  if (flags.brushable) pc.brushable();
  if (flags.reorderable) pc.reorderable();
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

// Jason Davies, http://bl.ocks.org/1341281
pc.reorderable = function() {
  if (!g) pc.createAxes();

  // Keep track of the order of the axes to verify if the order has actually
  // changed after a drag ends. Changed order might have consequence (e.g.
  // strums that need to be reset).
  var dimsAtDragstart;

  g.style("cursor", "move")
    .call(d3.behavior.drag()
      .on("dragstart", function(d) {
        dragging[d] = this.__origin__ = xscale(d);
        dimsAtDragstart = __.dimensions.slice();
      })
      .on("drag", function(d) {
        dragging[d] = Math.min(w(), Math.max(0, this.__origin__ += d3.event.dx));
        __.dimensions.sort(function(a, b) { return position(a) - position(b); });
        xscale.domain(__.dimensions);
        pc.render();
        g.attr("transform", function(d) { return "translate(" + position(d) + ")"; });
      })
      .on("dragend", function(d) {
        // Let's see if the order has changed and send out an event if so.
        var orderChanged = dimsAtDragstart.some(function(d, i) {
          return d !== __.dimensions[i];
        });

        if (orderChanged) {
          events.axesreorder.call(pc, __.dimensions);
        }

        delete this.__origin__;
        delete dragging[d];
        d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");
        pc.render();
      }));
  flags.reorderable = true;
  return this;
};

// pairs of adjacent dimensions
pc.adjacent_pairs = function(arr) {
  var ret = [];
  for (var i = 0; i < arr.length-1; i++) {
    ret.push([arr[i],arr[i+1]]);
  };
  return ret;
};

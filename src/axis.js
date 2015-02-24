d3.rebind(pc, axis, "ticks", "orient", "tickValues", "tickSubdivide", "tickSize", "tickPadding", "tickFormat");

function flipAxisAndUpdatePCP(dimension) {
  var g = pc.svg.selectAll(".dimension");

  pc.flip(dimension);

  d3.select(this.parentElement)
    .transition()
      .duration(1100)
      .call(axis.scale(yscale[dimension]));

  pc.render();
  if (flags.shadows) paths(__.data, ctx.shadows);
}

function rotateLabels() {
  var delta = d3.event.deltaY;
  delta = delta < 0 ? -5 : delta;
  delta = delta > 0 ? 5 : delta;

  __.dimensionTitleRotation += delta;
  pc.svg.selectAll("text.label")
    .attr("transform", "translate(0,-5) rotate(" + __.dimensionTitleRotation + ")");
  d3.event.preventDefault();
}

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
        "transform": "translate(0,-5) rotate(" + __.dimensionTitleRotation + ")",
        "x": 0,
        "class": "label"
      })
      .text(function(d) {
        return d in __.dimensionTitles ? __.dimensionTitles[d] : d;  // dimension display names
      })
      .on("dblclick", flipAxisAndUpdatePCP)
      .on("wheel", rotateLabels);

  flags.axes= true;
  return this;
};

pc.removeAxes = function() {
  g.remove();
  return this;
};

pc.updateAxes = function() {
  var g_data = pc.svg.selectAll(".dimension").data(__.dimensions);

  // Enter
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
        "transform": "translate(0,-5) rotate(" + __.dimensionTitleRotation + ")",
        "x": 0,
        "class": "label"
      })
      .text(String)
      .on("dblclick", flipAxisAndUpdatePCP)
      .on("wheel", rotateLabels);

  // Update
  g_data.attr("opacity", 0);
  g_data.select(".axis")
    .transition()
      .duration(1100)
      .each(function(d) {
        d3.select(this).call(axis.scale(yscale[d]));
      });
  g_data.select(".label")
    .transition()
      .duration(1100)
      .text(String)
      .attr("transform", "translate(0,-5) rotate(" + __.dimensionTitleRotation + ")");

  // Exit
  g_data.exit().remove();

  g = pc.svg.selectAll(".dimension");
  g.transition().duration(1100)
    .attr("transform", function(p) { return "translate(" + position(p) + ")"; })
    .style("opacity", 1);

  pc.svg.selectAll(".axis")
    .transition()
      .duration(1100)
      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); });

  if (flags.shadows) paths(__.data, ctx.shadows);
  if (flags.brushable) pc.brushable();
  if (flags.reorderable) pc.reorderable();
  if (pc.brushMode() !== "None") {
    var mode = pc.brushMode();
    pc.brushMode("None");
    pc.brushMode(mode);
  }
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
        g.attr("transform", function(d) { return "translate(" + position(d) + ")"; });
      })
      .on("dragend", function(d) {
        // Let's see if the order has changed and send out an event if so.
        var i = 0,
            j = __.dimensions.indexOf(d),
            elem = this,
            parent = this.parentElement;

        while((elem = elem.previousElementSibling) != null) ++i;
        if (i !== j) {
          events.axesreorder.call(pc, __.dimensions);
          // We now also want to reorder the actual dom elements that represent
          // the axes. That is, the g.dimension elements. If we don't do this,
          // we get a weird and confusing transition when updateAxes is called.
          // This is due to the fact that, initially the nth g.dimension element
          // represents the nth axis. However, after a manual reordering,
          // without reordering the dom elements, the nth dom elements no longer
          // necessarily represents the nth axis.
          //
          // i is the original index of the dom element
          // j is the new index of the dom element
          if (i > j) { // Element moved left
            parent.insertBefore(this, parent.children[j - 1]);
          } else {     // Element moved right
            if ((j + 1) < parent.children.length) {
              parent.insertBefore(this, parent.children[j + 1]);
            } else {
              parent.appendChild(this);
            }
          }
        }

        delete this.__origin__;
        delete dragging[d];
        d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");
        pc.render();
        if (flags.shadows) paths(__.data, ctx.shadows);
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

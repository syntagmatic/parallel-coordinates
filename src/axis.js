d3.rebind(pc, axis, "ticks", "orient", "tickValues", "tickSubdivide", "tickSize", "tickPadding", "tickFormat");

function flipAxisAndUpdatePCP(dimension) {
  var g = pc.svg.selectAll(".dimension");

  pc.flip(dimension);

  d3.select(this.parentElement)
    .transition()
      .duration(__.animationTime)
      .call(axis.scale(__.dimensions[dimension].yscale));

  pc.render();
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

function dimensionLabels(d) {
  return __.dimensions[d].title ? __.dimensions[d].title : d;  // dimension display names
}

pc.createAxes = function() {
  if (g) pc.removeAxes();

  // Add a group element for each dimension.
  g = pc.svg.selectAll(".dimension")
      .data(pc.getOrderedDimensionKeys(), function(d) {
        return d;
      })
    .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(d) {
        return "translate(" + xscale(d) + ")";
      });

  // Add an axis and title.
  g.append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call( pc.applyAxisConfig(axis, __.dimensions[d]) )
      })
    .append("svg:text")
      .attr({
        "text-anchor": "middle",
        "y": 0,
        "transform": "translate(0,-5) rotate(" + __.dimensionTitleRotation + ")",
        "x": 0,
        "class": "label"
      })
      .text(dimensionLabels)
      .on("dblclick", flipAxisAndUpdatePCP)
      .on("wheel", rotateLabels);

  if (__.nullValueSeparator=="top") {
    pc.svg.append("line")
      .attr("x1", 0)
      .attr("y1", 1+__.nullValueSeparatorPadding.top)
      .attr("x2", w())
      .attr("y2", 1+__.nullValueSeparatorPadding.top)
      .attr("stroke-width", 1)
      .attr("stroke", "#777")
      .attr("fill", "none")
      .attr("shape-rendering", "crispEdges");
  } else if (__.nullValueSeparator=="bottom") {
    pc.svg.append("line")
      .attr("x1", 0)
      .attr("y1", h()+1-__.nullValueSeparatorPadding.bottom)
      .attr("x2", w())
      .attr("y2", h()+1-__.nullValueSeparatorPadding.bottom)
      .attr("stroke-width", 1)
      .attr("stroke", "#777")
      .attr("fill", "none")
      .attr("shape-rendering", "crispEdges");
  }

  flags.axes= true;
  return this;
};

pc.removeAxes = function() {
  g.remove();
  g = undefined;
  return this;
};

pc.updateAxes = function(animationTime) {
  if (typeof animationTime === 'undefined') {
    animationTime = __.animationTime;
  }

  var g_data = pc.svg.selectAll(".dimension").data(pc.getOrderedDimensionKeys());

  // Enter
  g_data.enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(p) { return "translate(" + position(p) + ")"; })
      .style("opacity", 0)
    .append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call( pc.applyAxisConfig(axis, __.dimensions[d]) )
      })
    .append("svg:text")
      .attr({
        "text-anchor": "middle",
        "y": 0,
        "transform": "translate(0,-5) rotate(" + __.dimensionTitleRotation + ")",
        "x": 0,
        "class": "label"
      })
      .text(dimensionLabels)
      .on("dblclick", flipAxisAndUpdatePCP)
      .on("wheel", rotateLabels);

  // Update
  g_data.attr("opacity", 0);
  g_data.select(".axis")
    .transition()
      .duration(animationTime)
      .each(function(d) { d3.select(this).call( pc.applyAxisConfig(axis, __.dimensions[d]) )
      });
  g_data.select(".label")
    .transition()
      .duration(animationTime)
      .text(dimensionLabels)
      .attr("transform", "translate(0,-5) rotate(" + __.dimensionTitleRotation + ")");

  // Exit
  g_data.exit().remove();

  g = pc.svg.selectAll(".dimension");
  g.transition().duration(animationTime)
    .attr("transform", function(p) { return "translate(" + position(p) + ")"; })
    .style("opacity", 1);

  pc.svg.selectAll(".axis")
    .transition()
      .duration(animationTime)
      .each(function(d) { d3.select(this).call( pc.applyAxisConfig(axis, __.dimensions[d]) );
      });

  if (flags.brushable) pc.brushable();
  if (flags.reorderable) pc.reorderable();
  if (pc.brushMode() !== "None") {
    var mode = pc.brushMode();
    pc.brushMode("None");
    pc.brushMode(mode);
  }
  return this;
};

pc.applyAxisConfig = function(axis, dimension) {
  return axis.scale(dimension.yscale)
    .orient(dimension.orient)
    .ticks(dimension.ticks)
    .tickValues(dimension.tickValues)
    .innerTickSize(dimension.innerTickSize)
    .outerTickSize(dimension.outerTickSize)
    .tickPadding(dimension.tickPadding)
    .tickFormat(dimension.tickFormat)
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
        pc.sortDimensions();
        xscale.domain(pc.getOrderedDimensionKeys());
        pc.render();
        g.attr("transform", function(d) {
          return "translate(" + position(d) + ")";
        });
      })
      .on("dragend", function(d) {
        // Let's see if the order has changed and send out an event if so.
        var i = 0,
            j = __.dimensions[d].index,
            elem = this,
            parent = this.parentElement;

        while((elem = elem.previousElementSibling) != null) ++i;
        if (i !== j) {
          events.axesreorder.call(pc, pc.getOrderedDimensionKeys());
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
      }));
  flags.reorderable = true;
  return this;
};

// Reorder dimensions, such that the highest value (visually) is on the left and
// the lowest on the right. Visual values are determined by the data values in
// the given row.
pc.reorder = function(rowdata) {
  var firstDim = pc.getOrderedDimensionKeys()[0];

  pc.sortDimensionsByRowData(rowdata);
  // NOTE: this is relatively cheap given that:
  // number of dimensions < number of data items
  // Thus we check equality of order to prevent rerendering when this is the case.
  var reordered = false;
  reordered = firstDim !== pc.getOrderedDimensionKeys()[0];

  if (reordered) {
    xscale.domain(pc.getOrderedDimensionKeys());
    var highlighted = __.highlighted.slice(0);
    pc.unhighlight();

    g.transition()
      .duration(1500)
      .attr("transform", function(d) {
        return "translate(" + xscale(d) + ")";
      });
    pc.render();

    // pc.highlight() does not check whether highlighted is length zero, so we do that here.
    if (highlighted.length !== 0) {
      pc.highlight(highlighted);
    }
  }
}

pc.sortDimensionsByRowData = function(rowdata) {
  var copy = __.dimensions;
  var positionSortedKeys = d3.keys(__.dimensions).sort(function(a, b) {
    var pixelDifference = __.dimensions[a].yscale(rowdata[a]) - __.dimensions[b].yscale(rowdata[b]);

    // Array.sort is not necessarily stable, this means that if pixelDifference is zero
    // the ordering of dimensions might change unexpectedly. This is solved by sorting on
    // variable name in that case.
    if (pixelDifference === 0) {
      return a.localeCompare(b);
    } // else
    return pixelDifference;
  });
  __.dimensions = {};
  positionSortedKeys.forEach(function(p, i){
    __.dimensions[p] = copy[p];
    __.dimensions[p].index = i;
  });
}

pc.sortDimensions = function() {
  var copy = __.dimensions;
  var positionSortedKeys = d3.keys(__.dimensions).sort(function(a, b) {
    return position(a) - position(b);
  });
  __.dimensions = {};
  positionSortedKeys.forEach(function(p, i){
    __.dimensions[p] = copy[p];
    __.dimensions[p].index = i;
  })
};

// pairs of adjacent dimensions
pc.adjacent_pairs = function(arr) {
  var ret = [];
  for (var i = 0; i < arr.length-1; i++) {
    ret.push([arr[i],arr[i+1]]);
  };
  return ret;
};

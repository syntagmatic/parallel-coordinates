// brush mode: 1D-Axes with multiple extents
// requires d3.svg.multibrush

(function() {
  if (typeof d3.svg.multibrush !== 'function') {
	  return;
  }
  var brushes = {};

  function is_brushed(p) {
    return !brushes[p].empty();
  }

  // data within extents
  function selected() {
    var actives = d3.keys(__.dimensions).filter(is_brushed),
        extents = actives.map(function(p) { return brushes[p].extent(); });

    // We don't want to return the full data set when there are no axes brushed.
    // Actually, when there are no axes brushed, by definition, no items are
    // selected. So, let's avoid the filtering and just return false.
    //if (actives.length === 0) return false;

    // Resolves broken examples for now. They expect to get the full dataset back from empty brushes
    if (actives.length === 0) return __.data;

    // test if within range
    var within = {
      "date": function(d,p,dimension,b) {
        if (typeof __.dimensions[p].yscale.rangePoints === "function") { // if it is ordinal
          return b[0] <= __.dimensions[p].yscale(d[p]) && __.dimensions[p].yscale(d[p]) <= b[1]
        } else {
            return b[0] <= d[p] && d[p] <= b[1]
        }
      },
      "number": function(d,p,dimension,b) {
        if (typeof __.dimensions[p].yscale.rangePoints === "function") { // if it is ordinal
          return b[0] <= __.dimensions[p].yscale(d[p]) && __.dimensions[p].yscale(d[p]) <= b[1]
        } else {
            return b[0] <= d[p] && d[p] <= b[1]
        }
      },
      "string": function(d,p,dimension,b) {
        return b[0] <= __.dimensions[p].yscale(d[p]) && __.dimensions[p].yscale(d[p]) <= b[1]
      }
    };

    return __.data
    .filter(function(d) {
      switch(brush.predicate) {
      case "AND":
        return actives.every(function(p, dimension) {
          return extents[dimension].some(function(b) {
          	return within[__.dimensions[p].type](d,p,dimension,b);
          });
        });
      case "OR":
        return actives.some(function(p, dimension) {
      	  return extents[dimension].some(function(b) {
            	return within[__.dimensions[p].type](d,p,dimension,b);
            });
        });
      default:
        throw new Error("Unknown brush predicate " + __.brushPredicate);
      }
    });
  };

  function brushExtents(extents) {
    if (typeof(extents) === 'undefined') {
      extents = {};
      d3.keys(__.dimensions).forEach(function (d) {
        var brush = brushes[d];
        if (brush !== undefined && !brush.empty()) {
          var extent = brush.extent();
          extents[d] = extent;
        }
      });
      return extents;
    }
    else {
      //first get all the brush selections
      var brushSelections = {};
      g.selectAll('.brush')
          .each(function (d) {
            brushSelections[d] = d3.select(this);
          });

      // loop over each dimension and update appropriately (if it was passed in through extents)
      d3.keys(__.dimensions).forEach(function (d) {
        if (extents[d] === undefined) {
          return;
        }

        var brush = brushes[d];
        if (brush !== undefined) {
          //update the extent
          brush.extent(extents[d]);

          //redraw the brush
          brushSelections[d]
              .transition()
              .duration(0)
              .call(brush);

          //fire some events
          brush.event(brushSelections[d]);
        }
      });

      //redraw the chart
      pc.renderBrushed();

      return pc;
    }
  }

  //function brushExtents() {
  //  var extents = {};
  //  d3.keys(__.dimensions).forEach(function(d) {
  //    var brush = brushes[d];
  //    if (brush !== undefined && !brush.empty()) {
  //      var extent = brush.extent();
  //      extents[d] = extent;
  //    }
  //  });
  //  return extents;
  //}

  function brushFor(axis) {
    var brush = d3.svg.multibrush();

    brush
      .y(__.dimensions[axis].yscale)
      .on("brushstart", function() {
				if(d3.event.sourceEvent !== null) {
                    events.brushstart.call(pc, __.brushed);
					d3.event.sourceEvent.stopPropagation();
				}
      })
      .on("brush", function() {
        brushUpdated(selected());
      })
      .on("brushend", function() {
    	// d3.svg.multibrush clears extents just before calling 'brushend'
    	// so we have to update here again.
    	// This fixes issue #103 for now, but should be changed in d3.svg.multibrush
    	// to avoid unnecessary computation.
    	brushUpdated(selected());
        events.brushend.call(pc, __.brushed);
      })
      .extentAdaption(function(selection) {
    	  selection
    	  .style("visibility", null)
          .attr("x", -15)
          .attr("width", 30)
          .style("fill", "rgba(255,255,255,0.25)")
          .style("stroke", "rgba(0,0,0,0.6)");
      })
      .resizeAdaption(function(selection) {
    	 selection
    	   .selectAll("rect")
    	   .attr("x", -15)
    	   .attr("width", 30)
         .style("visibility", null)
         .style("fill", "rgba(0,0,0,0.1)");
      });

    brushes[axis] = brush;
    return brush;
  }

  function brushReset(dimension) {
    __.brushed = false;
    if (g) {
      g.selectAll('.brush')
        .each(function(d) {
          d3.select(this).call(
            brushes[d].clear()
          );
        });
      pc.renderBrushed();
    }
    return this;
  };

  function install() {
    if (!g) pc.createAxes();

    // Add and store a brush for each axis.
    var brush = g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(brushFor(d));
      })

    brush.selectAll("rect")
        .style("visibility", null)
        .attr("x", -15)
        .attr("width", 30);

    brush.selectAll("rect.background")
        .style("fill", "transparent");

    brush.selectAll("rect.extent")
        .style("fill", "rgba(255,255,255,0.25)")
        .style("stroke", "rgba(0,0,0,0.6)");

    brush.selectAll(".resize rect")
        .style("fill", "rgba(0,0,0,0.1)");

    pc.brushExtents = brushExtents;
    pc.brushReset = brushReset;
    return pc;
  }

  brush.modes["1D-axes-multi"] = {
    install: install,
    uninstall: function() {
      g.selectAll(".brush").remove();
      brushes = {};
      delete pc.brushExtents;
      delete pc.brushReset;
    },
    selected: selected,
    brushState: brushExtents
  }
})();

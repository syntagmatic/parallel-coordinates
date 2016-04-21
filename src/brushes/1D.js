// brush mode: 1D-Axes

(function() {
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
			"date": function(d,p,dimension) {
	if (typeof __.dimensions[p].yscale.rangePoints === "function") { // if it is ordinal
          return extents[dimension][0] <= __.dimensions[p].yscale(d[p]) && __.dimensions[p].yscale(d[p]) <= extents[dimension][1]
        } else {
          return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
        }
      },
      "number": function(d,p,dimension) {
        if (typeof __.dimensions[p].yscale.rangePoints === "function") { // if it is ordinal
          return extents[dimension][0] <= __.dimensions[p].yscale(d[p]) && __.dimensions[p].yscale(d[p]) <= extents[dimension][1]
        } else {
          return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
        }
      },
      "string": function(d,p,dimension) {
        return extents[dimension][0] <= __.dimensions[p].yscale(d[p]) && __.dimensions[p].yscale(d[p]) <= extents[dimension][1]
      }
    };

    return __.data
      .filter(function(d) {
        switch(brush.predicate) {
        case "AND":
          return actives.every(function(p, dimension) {
            return within[__.dimensions[p].type](d,p,dimension);
          });
        case "OR":
          return actives.some(function(p, dimension) {
            return within[__.dimensions[p].type](d,p,dimension);
          });
        default:
          throw "Unknown brush predicate " + __.brushPredicate;
        }
      });
  };

  function brushExtents(extents) {
    if(typeof(extents) === 'undefined')
		{
			var extents = {};
			d3.keys(__.dimensions).forEach(function(d) {
				var brush = brushes[d];
				if (brush !== undefined && !brush.empty()) {
					var extent = brush.extent();
					extent.sort(d3.ascending);
					extents[d] = extent;
				}
			});
			return extents;
		}
		else
		{
			//first get all the brush selections
			var brushSelections = {};
			g.selectAll('.brush')
				.each(function(d) {
					brushSelections[d] = d3.select(this);

			});

			// loop over each dimension and update appropriately (if it was passed in through extents)
			d3.keys(__.dimensions).forEach(function(d) {
				if (extents[d] === undefined){
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

  function brushFor(axis) {
    var brush = d3.svg.brush();

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
				events.brushend.call(pc, __.brushed);
			});

		brushes[axis] = brush;
		return brush;
	};

	function brushReset(dimension) {
		if (dimension===undefined) {
			__.brushed = false;
			if (g) {
				g.selectAll('.brush')
					.each(function(d) {
						d3.select(this)
							.transition()
							.duration(0)
							.call(brushes[d].clear());
					});
				pc.renderBrushed();
			}
		}
		else {
			if (g) {
				g.selectAll('.brush')
					.each(function(d) {
						if (d!=dimension) return;
						d3.select(this)
							.transition()
							.duration(0)
							.call(brushes[d].clear());
						brushes[d].event(d3.select(this));
					});
				pc.renderBrushed();
			}
		}
		return this;
	};

	function install() {
		if (!g) pc.createAxes();

		// Add and store a brush for each axis.
		g.append("svg:g")
			.attr("class", "brush")
			.each(function(d) {
				d3.select(this).call(brushFor(d));
			})
			.selectAll("rect")
				.style("visibility", null)
				.attr("x", -15)
				.attr("width", 30);

		pc.brushExtents = brushExtents;
		pc.brushReset = brushReset;
		return pc;
	};

	brush.modes["1D-axes"] = {
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

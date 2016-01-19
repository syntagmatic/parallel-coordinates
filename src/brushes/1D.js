// brush mode: 1D-Axes

(function() {
	var brushes = {};

	function is_brushed(p) {
		return !brushes[p].empty();
	}

	// data within extents
	function selected() {
		var actives = __.dimensions.filter(is_brushed),
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
	if (typeof yscale[p].rangePoints === "function") { // if it is ordinal
					return extents[dimension][0] <= yscale[p](d[p]) && yscale[p](d[p]) <= extents[dimension][1]
				} else {
					return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
				}
			},
			"number": function(d,p,dimension) {
				if (typeof yscale[p].rangePoints === "function") { // if it is ordinal
					return extents[dimension][0] <= yscale[p](d[p]) && yscale[p](d[p]) <= extents[dimension][1]
				} else {
					return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
				}
			},
			"string": function(d,p,dimension) {
				return extents[dimension][0] <= yscale[p](d[p]) && yscale[p](d[p]) <= extents[dimension][1]
			}
		};

		return __.data
			.filter(function(d) {
				switch(brush.predicate) {
				case "AND":
					return actives.every(function(p, dimension) {
						return within[__.types[p]](d,p,dimension);
					});
				case "OR":
					return actives.some(function(p, dimension) {
						return within[__.types[p]](d,p,dimension);
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
			__.dimensions.forEach(function(d) {
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
			__.dimensions.forEach(function(d) {
				if (extents[d] === undefined){
					return; // continue
				}

				var brush = brushes[d];
				if (brush !== undefined) {
					//update the extent
					brush.extent(extents[d]);

					//redraw the brush
					brush(brushSelections[d]);

					//fire some events
					brush.event(brushSelections[d]);
				}
			});

			//redraw the chart
			pc.renderBrushed();
		}
		return pc;
	}

	/** A setter for 1D-axes brushes, accessible from outside of parcoords. */
	function updateBrush(dimension, extent, duration) {
		var brush = brushes[dimension];
		// set brush extent
		brush.extent(extent);
		/*
		// set brush extents for all dimensions
		for (var key in initialExtents) {
			brushes[key].extent(initialExtents[key])
		}*/
		if (g) {
			//first get all the brush selections
			var brushSelections = {};
			g.selectAll('.brush')
				.each(function(d) {
					brushSelections[d] = d3.select(this);
				});

			//redraw the brush
			brushSelections[dimension]
				.transition()
				.duration(duration)
				.call(brush)
			//brush(brushSelections[d]);

			//fire some events
			brush.event(brushSelections[dimension]);

		}

/*
		// update all brush extents
		if (g) {
			g.selectAll('.brush').each(function(d) {
				if (!(brushes[d].empty())){
				d3.select(this) // draws the brush initially
					.call(brushes[d]);

				d3.select(this) // re-draw brushes with set extent, then start brush event
					.transition()
					.duration(duration)
					.call(brushes[d].extent(initialExtents[d]))
					.call(brushes[d].event);

				} else {
					d3.select(this).call(brushes[d].clear());
				}
			});
		}*/

		return pc;
	};

	function brushFor(axis) {
		var brush = d3.svg.brush();

		brush
			.y(yscale[axis])
			.on("brushstart", function() {
				if(d3.event.sourceEvent !== null) {
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
		pc.updateBrush = updateBrush;
		pc.brushReset = brushReset;
		return pc;
	};

	brush.modes["1D-axes"] = {
		install: install,
		uninstall: function() {
			g.selectAll(".brush").remove();
			brushes = {};
			delete pc.brushExtents;
			delete pc.updateBrush;
			delete pc.brushReset;
		},
		selected: selected,
		brushState: brushExtents
	}
})();

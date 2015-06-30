pc.autoscale = function() {
  // yscale
  var defaultScales = {
    "date": function(k) {
      var extent = d3.extent(__.data, function(d) {
        return d[k] ? d[k].getTime() : null;
      });

      // special case if single value
      if (extent[0] === extent[1]) {
        return d3.scale.ordinal()
          .domain([extent[0]])
          .rangePoints([h()+1, 1]);
      }

      return d3.time.scale()
        .domain(extent)
        .range([h()+1, 1]);
    },
    "number": function(k) {
      var extent = d3.extent(__.data, function(d) { return +d[k]; });

      // special case if single value
      if (extent[0] === extent[1]) {
        return d3.scale.ordinal()
          .domain([extent[0]])
          .rangePoints([h()+1, 1]);
      }

      return d3.scale.linear()
        .domain(extent)
        .range([h()+1, 1]);
    },
    "string": function(k) {
      var counts = {},
          domain = [];

      // Let's get the count for each value so that we can sort the domain based
      // on the number of items for each value.
      __.data.map(function(p) {
        if (counts[p[k]] === undefined) {
          counts[p[k]] = 1;
        } else {
          counts[p[k]] = counts[p[k]] + 1;
        }
      });

      domain = Object.getOwnPropertyNames(counts).sort(function(a, b) {
        return counts[a] - counts[b];
      });

      return d3.scale.ordinal()
        .domain(domain)
        .rangePoints([h()+1, 1]);
    }
  };

  __.dimensions.forEach(function(k) {
    yscale[k] = defaultScales[__.types[k]](k);
  });

  __.hideAxis.forEach(function(k) {
    yscale[k] = defaultScales[__.types[k]](k);
  });

  // xscale
  xscale.rangePoints([0, w()], 1);

  // canvas sizes
  pc.selection.selectAll("canvas")
      .style("margin-top", __.margin.top + "px")
      .style("margin-left", __.margin.left + "px")
      .attr("width", w()+2)
      .attr("height", h()+2);

  // default styles, needs to be set when canvas width changes
  ctx.foreground.strokeStyle = __.color;
  ctx.foreground.lineWidth = 1.4;
  ctx.foreground.globalCompositeOperation = __.composite;
  ctx.foreground.globalAlpha = __.alpha;
  ctx.brushed.strokeStyle = __.brushedColor;
  ctx.brushed.lineWidth = 1.4;
  ctx.brushed.globalCompositeOperation = __.composite;
  ctx.brushed.globalAlpha = __.alpha;
  ctx.highlight.lineWidth = 3;

  return this;
};

pc.scale = function(d, domain) {
	yscale[d].domain(domain);

	return this;
};

pc.flip = function(d) {
	//yscale[d].domain().reverse();					// does not work
	yscale[d].domain(yscale[d].domain().reverse()); // works

	return this;
};

pc.commonScale = function(global, type) {
	var t = type || "number";
	if (typeof global === 'undefined') {
		global = true;
	}

	// scales of the same type
	var scales = __.dimensions.concat(__.hideAxis).filter(function(p) {
		return __.types[p] == t;
	});

	if (global) {
		var extent = d3.extent(scales.map(function(p,i) {
				return yscale[p].domain();
			}).reduce(function(a,b) {
				return a.concat(b);
			}));

		scales.forEach(function(d) {
			yscale[d].domain(extent);
		});

	} else {
		scales.forEach(function(k) {
			yscale[k].domain(d3.extent(__.data, function(d) { return +d[k]; }));
		});
	}

	// update centroids
	if (__.bundleDimension !== null) {
		pc.bundleDimension(__.bundleDimension);
	}

	return this;
};

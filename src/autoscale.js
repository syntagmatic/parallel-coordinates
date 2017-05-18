/** adjusts an axis' default range [h()+1, 1] if a NullValueSeparator is set */
function getRange() {
	if (__.nullValueSeparator=="bottom") {
		return [h()+1-__.nullValueSeparatorPadding.bottom-__.nullValueSeparatorPadding.top, 1];
	} else if (__.nullValueSeparator=="top") {
		return [h()+1, 1+__.nullValueSeparatorPadding.bottom+__.nullValueSeparatorPadding.top];
	}
	return [h()+1, 1];
};

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
          .rangePoints(getRange());
      }

      return d3.time.scale()
        .domain(extent)
        .range(getRange());
    },
    "number": function(k) {
      var extent = d3.extent(__.data, function(d) { return +d[k]; });

      // special case if single value
      if (extent[0] === extent[1]) {
        return d3.scale.ordinal()
          .domain([extent[0]])
          .rangePoints(getRange());
      }

      return d3.scale.linear()
        .domain(extent)
        .range(getRange());
    },
    "string": function(k) {
      var counts = {},
          domain = [];

      // Let's get the count for each value so that we can sort the domain based
      // on the number of items for each value.
      __.data.map(function(p) {
        if (p[k] === undefined && __.nullValueSeparator!== "undefined"){
          return; // null values will be drawn beyond the horizontal null value separator!
        }
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
        .rangePoints(getRange());
    }
  };

  d3.keys(__.dimensions).forEach(function(k) {
    if (!__.dimensions[k].yscale){
      __.dimensions[k].yscale = defaultScales[__.dimensions[k].type](k);
    }
  });

  // xscale
  xscale.rangePoints([0, w()], 1);

  // Retina display, etc.
  var devicePixelRatio = window.devicePixelRatio || 1;

  // canvas sizes
  pc.selection.selectAll("canvas")
      .style("margin-top", __.margin.top + "px")
      .style("margin-left", __.margin.left + "px")
      .style("width", (w()+2) + "px")
      .style("height", (h()+2) + "px")
      .attr("width", (w()+2) * devicePixelRatio)
      .attr("height", (h()+2) * devicePixelRatio);

  // default styles, needs to be set when canvas width changes
  ctx.foreground.strokeStyle = __.color;
  ctx.foreground.lineWidth = 1.4;
  ctx.foreground.globalCompositeOperation = __.composite;
  ctx.foreground.globalAlpha = __.alpha;
  ctx.foreground.scale(devicePixelRatio, devicePixelRatio);
  ctx.brushed.strokeStyle = __.brushedColor;
  ctx.brushed.lineWidth = 1.4;
  ctx.brushed.globalCompositeOperation = __.composite;
  ctx.brushed.globalAlpha = __.alpha;
  ctx.brushed.scale(devicePixelRatio, devicePixelRatio);
  ctx.highlight.lineWidth = 3;
  ctx.highlight.scale(devicePixelRatio, devicePixelRatio);

  return this;
};

pc.scale = function(d, domain) {
  __.dimensions[d].yscale.domain(domain);

  return this;
};

pc.flip = function(d) {
  //__.dimensions[d].yscale.domain().reverse();                               // does not work
  __.dimensions[d].yscale.domain(__.dimensions[d].yscale.domain().reverse()); // works

  return this;
};

pc.commonScale = function(global, type) {
  var t = type || "number";
  if (typeof global === 'undefined') {
    global = true;
  }

  // try to autodetect dimensions and create scales
  if (!d3.keys(__.dimensions).length) {
    pc.detectDimensions()
  }
  pc.autoscale();

  // scales of the same type
  var scales = d3.keys(__.dimensions).filter(function(p) {
    return __.dimensions[p].type == t;
  });

  if (global) {
    var extent = d3.extent(scales.map(function(d,i) {
      return __.dimensions[d].yscale.domain();
    }).reduce(function(a,b) {
      return a.concat(b);
    }));

    scales.forEach(function(d) {
      __.dimensions[d].yscale.domain(extent);
    });

  } else {
    scales.forEach(function(d) {
      __.dimensions[d].yscale.domain(d3.extent(__.data, function(d) { return +d[k]; }));
    });
  }

  // update centroids
  if (__.bundleDimension !== null) {
    pc.bundleDimension(__.bundleDimension);
  }

  return this;
};

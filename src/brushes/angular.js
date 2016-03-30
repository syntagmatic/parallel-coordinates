// brush mode: angular
// code based on 2D.strums.js

(function() {
  var arcs = {},
      strumRect;

  function drawStrum(arc, activePoint) {
    var svg = pc.selection.select("svg").select("g#arcs"),
        id = arc.dims.i,
        points = [arc.p2, arc.p3],
        line = svg.selectAll("line#arc-" + id).data([{p1:arc.p1,p2:arc.p2},{p1:arc.p1,p2:arc.p3}]),
        circles = svg.selectAll("circle#arc-" + id).data(points),
        drag = d3.behavior.drag(),
        path = svg.selectAll("path#arc-" + id).data([arc]);

    path.enter()
      .append("path")
      .attr("id", "arc-" + id)
      .attr("class", "arc")
      .style("fill", "orange")
      .style("opacity", 0.5);

    path
      .attr("d", arc.arc)
      .attr("transform", "translate(" + arc.p1[0] + "," + arc.p1[1] + ")");

    line.enter()
      .append("line")
      .attr("id", "arc-" + id)
      .attr("class", "arc");

    line
      .attr("x1", function(d) { return d.p1[0]; })
      .attr("y1", function(d) { return d.p1[1]; })
      .attr("x2", function(d) { return d.p2[0]; })
      .attr("y2", function(d) { return d.p2[1]; })
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    drag
      .on("drag", function(d, i) {
        var ev = d3.event,
        	angle = 0;

        i = i + 2;

        arc["p" + i][0] = Math.min(Math.max(arc.minX + 1, ev.x), arc.maxX);
        arc["p" + i][1] = Math.min(Math.max(arc.minY, ev.y), arc.maxY);

        angle = i === 3 ? arcs.startAngle(id) : arcs.endAngle(id);

        if ((arc.startAngle < Math.PI && arc.endAngle < Math.PI && angle < Math.PI) ||
        		(arc.startAngle >= Math.PI && arc.endAngle >= Math.PI && angle >= Math.PI)) {

        	if (i === 2) {
	        	arc.endAngle = angle;
	        	arc.arc.endAngle(angle);
	        } else if (i === 3) {
	        	arc.startAngle = angle;
	        	arc.arc.startAngle(angle);
	        }

        }

        drawStrum(arc, i - 2);
      })
      .on("dragend", onDragEnd());

    circles.enter()
      .append("circle")
      .attr("id", "arc-" + id)
      .attr("class", "arc");

    circles
      .attr("cx", function(d) { return d[0]; })
      .attr("cy", function(d) { return d[1]; })
      .attr("r", 5)
      .style("opacity", function(d, i) {
        return (activePoint !== undefined && i === activePoint) ? 0.8 : 0;
      })
      .on("mouseover", function() {
        d3.select(this).style("opacity", 0.8);
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 0);
      })
      .call(drag);
  }

  function dimensionsForPoint(p) {
    var dims = { i: -1, left: undefined, right: undefined };
    d3.keys(__.dimensions).some(function(dim, i) {
      if (xscale(dim) < p[0]) {
        var next = d3.keys(__.dimensions)[pc.getOrderedDimensionKeys().indexOf(dim)+1];
        dims.i = i;
        dims.left = dim;
        dims.right = next;
        return false;
      }
      return true;
    });

    if (dims.left === undefined) {
      // Event on the left side of the first axis.
      dims.i = 0;
      dims.left = pc.getOrderedDimensionKeys()[0];
      dims.right = pc.getOrderedDimensionKeys()[1];
    } else if (dims.right === undefined) {
      // Event on the right side of the last axis
      dims.i = d3.keys(__.dimensions).length - 1;
      dims.right = dims.left;
      dims.left = pc.getOrderedDimensionKeys()[d3.keys(__.dimensions).length - 2];
    }

    return dims;
  }

  function onDragStart() {
    // First we need to determine between which two axes the arc was started.
    // This will determine the freedom of movement, because a arc can
    // logically only happen between two axes, so no movement outside these axes
    // should be allowed.
    return function() {
      var p = d3.mouse(strumRect[0][0]),
          dims,
          arc;

      p[0] = p[0] - __.margin.left;
      p[1] = p[1] - __.margin.top;

      dims = dimensionsForPoint(p),
      arc = {
        p1: p,
        dims: dims,
        minX: xscale(dims.left),
        maxX: xscale(dims.right),
        minY: 0,
        maxY: h(),
        startAngle: undefined,
        endAngle: undefined,
        arc: d3.svg.arc().innerRadius(0)
      };

      arcs[dims.i] = arc;
      arcs.active = dims.i;

      // Make sure that the point is within the bounds
      arc.p1[0] = Math.min(Math.max(arc.minX, p[0]), arc.maxX);
      arc.p2 = arc.p1.slice();
      arc.p3 = arc.p1.slice();
    };
  }

  function onDrag() {
    return function() {
      var ev = d3.event,
          arc = arcs[arcs.active];

      // Make sure that the point is within the bounds
      arc.p2[0] = Math.min(Math.max(arc.minX + 1, ev.x - __.margin.left), arc.maxX);
      arc.p2[1] = Math.min(Math.max(arc.minY, ev.y - __.margin.top), arc.maxY);
      arc.p3 = arc.p2.slice();
//      console.log(arcs.angle(arcs.active));
//      console.log(signedAngle(arcs.unsignedAngle(arcs.active)));
      drawStrum(arc, 1);
    };
  }

  // some helper functions
  function hypothenuse(a, b) {
	  return Math.sqrt(a*a + b*b);
  }

  var rad = (function() {
	  var c = Math.PI / 180;
	  return function(angle) {
		  return angle * c;
	  };
  })();

  var deg = (function() {
	  var c = 180 / Math.PI;
	  return function(angle) {
		  return angle * c;
	  };
  })();

  // [0, 2*PI] -> [-PI/2, PI/2]
  var signedAngle = function(angle) {
    var ret = angle;
    if (angle > Math.PI) {
      ret = angle - 1.5 * Math.PI;
      ret = angle - 1.5 * Math.PI;
    } else {
      ret = angle - 0.5 * Math.PI;
      ret = angle - 0.5 * Math.PI;
    }
    return -ret;
  }

  /**
   * angles are stored in radians from in [0, 2*PI], where 0 in 12 o'clock.
   * However, one can only select lines from 0 to PI, so we compute the
   * 'signed' angle, where 0 is the horizontal line (3 o'clock), and +/- PI/2
   * are 12 and 6 o'clock respectively.
   */
  function containmentTest(arc) {
    var startAngle = signedAngle(arc.startAngle);
    var endAngle = signedAngle(arc.endAngle);

    if (startAngle > endAngle) {
    	var tmp = startAngle;
    	startAngle = endAngle;
    	endAngle = tmp;
    }

    // test if segment angle is contained in angle interval
    return function(a) {

      if (a >= startAngle && a <= endAngle) {
        return true;
      }

      return false;
    };
  }

  function selected() {
    var ids = Object.getOwnPropertyNames(arcs),
        brushed = __.data;

    // Get the ids of the currently active arcs.
    ids = ids.filter(function(d) {
      return !isNaN(d);
    });

    function crossesStrum(d, id) {
      var arc = arcs[id],
          test = containmentTest(arc),
          d1 = arc.dims.left,
          d2 = arc.dims.right,
          y1 = __.dimensions[d1].yscale,
          y2 = __.dimensions[d2].yscale,
          a = arcs.width(id),
          b = y1(d[d1]) - y2(d[d2]),
          c = hypothenuse(a, b),
          angle = Math.asin(b/c);	// rad in [-PI/2, PI/2]
      return test(angle);
    }

    if (ids.length === 0) { return brushed; }

    return brushed.filter(function(d) {
      switch(brush.predicate) {
      case "AND":
        return ids.every(function(id) { return crossesStrum(d, id); });
      case "OR":
        return ids.some(function(id) { return crossesStrum(d, id); });
      default:
        throw "Unknown brush predicate " + __.brushPredicate;
      }
    });
  }

  function removeStrum() {
    var arc = arcs[arcs.active],
        svg = pc.selection.select("svg").select("g#arcs");

    delete arcs[arcs.active];
    arcs.active = undefined;
    svg.selectAll("line#arc-" + arc.dims.i).remove();
    svg.selectAll("circle#arc-" + arc.dims.i).remove();
    svg.selectAll("path#arc-" + arc.dims.i).remove();
  }

  function onDragEnd() {
    return function() {
      var brushed = __.data,
          arc = arcs[arcs.active];

      // Okay, somewhat unexpected, but not totally unsurprising, a mousclick is
      // considered a drag without move. So we have to deal with that case
      if (arc && arc.p1[0] === arc.p2[0] && arc.p1[1] === arc.p2[1]) {
        removeStrum(arcs);
      }

      if (arc) {
    	  var angle = arcs.startAngle(arcs.active);

    	  arc.startAngle = angle;
          arc.endAngle = angle;
          arc.arc
            .outerRadius(arcs.length(arcs.active))
            .startAngle(angle)
            .endAngle(angle);
      }


      brushed = selected(arcs);
      arcs.active = undefined;
      __.brushed = brushed;
      pc.renderBrushed();
      events.brushend.call(pc, __.brushed);
    };
  }

  function brushReset(arcs) {
    return function() {
      var ids = Object.getOwnPropertyNames(arcs).filter(function(d) {
        return !isNaN(d);
      });

      ids.forEach(function(d) {
        arcs.active = d;
        removeStrum(arcs);
      });
      onDragEnd(arcs)();
    };
  }

  function install() {
    var drag = d3.behavior.drag();

    // Map of current arcs. arcs are stored per segment of the PC. A segment,
    // being the area between two axes. The left most area is indexed at 0.
    arcs.active = undefined;
    // Returns the width of the PC segment where currently a arc is being
    // placed. NOTE: even though they are evenly spaced in our current
    // implementation, we keep for when non-even spaced segments are supported as
    // well.
    arcs.width = function(id) {
      var arc = arcs[id];

      if (arc === undefined) {
        return undefined;
      }

      return arc.maxX - arc.minX;
    };

    // returns angles in [-PI/2, PI/2]
    angle = function(p1, p2) {
        var a = p1[0] - p2[0],
        	b = p1[1] - p2[1],
        	c = hypothenuse(a, b);

        return Math.asin(b/c);
    }

    // returns angles in [0, 2 * PI]
    arcs.endAngle = function(id) {
    	var arc = arcs[id];
    	if (arc === undefined) {
            return undefined;
        }
    	var sAngle = angle(arc.p1, arc.p2),
    		uAngle = -sAngle + Math.PI / 2;

    	if (arc.p1[0] > arc.p2[0]) {
    		uAngle = 2 * Math.PI - uAngle;
    	}

    	return uAngle;
    }

    arcs.startAngle = function(id) {
    	var arc = arcs[id];
    	if (arc === undefined) {
            return undefined;
        }

    	var sAngle = angle(arc.p1, arc.p3),
    		uAngle = -sAngle + Math.PI / 2;

    	if (arc.p1[0] > arc.p3[0]) {
    		uAngle = 2 * Math.PI - uAngle;
    	}

    	return uAngle;
    }

    arcs.length = function(id) {
    	var arc = arcs[id];

        if (arc === undefined) {
          return undefined;
        }

        var a = arc.p1[0] - arc.p2[0],
        	b = arc.p1[1] - arc.p2[1],
        	c = hypothenuse(a, b);

        return(c);
    }

    pc.on("axesreorder.arcs", function() {
      var ids = Object.getOwnPropertyNames(arcs).filter(function(d) {
        return !isNaN(d);
      });

      // Checks if the first dimension is directly left of the second dimension.
      function consecutive(first, second) {
        var length = d3.keys(__.dimensions).length;
        return d3.keys(__.dimensions).some(function(d, i) {
          return (d === first)
            ? i + i < length && __.dimensions[i + 1] === second
            : false;
        });
      }

      if (ids.length > 0) { // We have some arcs, which might need to be removed.
        ids.forEach(function(d) {
          var dims = arcs[d].dims;
          arcs.active = d;
          // If the two dimensions of the current arc are not next to each other
          // any more, than we'll need to remove the arc. Otherwise we keep it.
          if (!consecutive(dims.left, dims.right)) {
            removeStrum(arcs);
          }
        });
        onDragEnd(arcs)();
      }
    });

    // Add a new svg group in which we draw the arcs.
    pc.selection.select("svg").append("g")
      .attr("id", "arcs")
      .attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");

    // Install the required brushReset function
    pc.brushReset = brushReset(arcs);

    drag
      .on("dragstart", onDragStart(arcs))
      .on("drag", onDrag(arcs))
      .on("dragend", onDragEnd(arcs));

    // NOTE: The styling needs to be done here and not in the css. This is because
    //       for 1D brushing, the canvas layers should not listen to
    //       pointer-events.
    strumRect = pc.selection.select("svg").insert("rect", "g#arcs")
      .attr("id", "arc-events")
      .attr("x", __.margin.left)
      .attr("y", __.margin.top)
      .attr("width", w())
      .attr("height", h() + 2)
      .style("opacity", 0)
      .call(drag);
  }

  brush.modes["angular"] = {
    install: install,
    uninstall: function() {
      pc.selection.select("svg").select("g#arcs").remove();
      pc.selection.select("svg").select("rect#arc-events").remove();
      pc.on("axesreorder.arcs", undefined);
      delete pc.brushReset;

      strumRect = undefined;
    },
    selected: selected,
    brushState: function () { return arcs; }
  };

}());

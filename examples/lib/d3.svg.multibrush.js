(function () {
  d3.svg.multibrush = function() {

    // From d3/scale/scale.js
    function d3_scaleExtent(domain) {
      var start = domain[0], stop = domain[domain.length - 1];
      return start < stop ? [ start, stop ] : [ stop, start ];
    }
    function d3_scaleRange(scale) {
      return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
    }

    // From d3
    var d3_document = this.document;
    function d3_documentElement(node) {
      return node && (node.ownerDocument || node.document || node).documentElement;
    }
    function d3_window(node) {
      return node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
    }
    if (d3_document) {
      try {
        d3_array(d3_document.documentElement.childNodes)[0].nodeType;
      } catch (e) {
        d3_array = function(list) {
          var i = list.length, array = new Array(i);
          while (i--) array[i] = list[i];
          return array;
        };
      }
    }

    function d3_eventPreventDefault() {
      d3.event.preventDefault();
    }

    function d3_vendorSymbol(object, name) {
      if (name in object) return name;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
        var prefixName = d3_vendorPrefixes[i] + name;
        if (prefixName in object) return prefixName;
      }
    }
    var d3_vendorPrefixes = [ "webkit", "ms", "moz", "Moz", "o", "O" ];

    var d3_event_dragSelect = "onselectstart" in document ? null : d3_vendorSymbol(document.documentElement.style, "userSelect"), d3_event_dragId = 0;
    function d3_event_dragSuppress(node) {
      var name = ".dragsuppress-" + ++d3_event_dragId, click = "click" + name, w = d3.select(d3_window(node)).on("touchmove" + name, d3_eventPreventDefault).on("dragstart" + name, d3_eventPreventDefault).on("selectstart" + name, d3_eventPreventDefault);
      if (d3_event_dragSelect == null) {
        d3_event_dragSelect = "onselectstart" in node ? false : d3_vendorSymbol(node.style, "userSelect");
      }
      if (d3_event_dragSelect) {
        var style = d3_documentElement(node).style, select = style[d3_event_dragSelect];
        style[d3_event_dragSelect] = "none";
      }
      return function(suppressClick) {
        w.on(name, null);
        if (d3_event_dragSelect) style[d3_event_dragSelect] = select;
        if (suppressClick) {
          var off = function() {
            w.on(click, null);
          };
          w.on(click, function() {
            d3_eventPreventDefault();
            off();
          }, true);
          setTimeout(off, 0);
        }
      };
    }

    var event = d3.dispatch("brushstart", "brush", "brushend"),
        brushElement,
        x = null, // x-scale, optional
        y = null, // y-scale, optional
        xExtent = [[0, 0]], // [x0, x1] in integer pixels
        yExtent = [[0, 0]], // [y0, y1] in integer pixels
        xExtentDomain = [], // x-extent in data space
        yExtentDomain = [], // y-extent in data space
        xClamp = true, // whether to clamp the x-extent to the range
        yClamp = true, // whether to clamp the y-extent to the range
        resizes = d3_svg_brushResizes[0],
        resizeAdaption = function () {}, // Function to 'call' on new resize selection
        extentAdaption = function () {}; // Function to 'call' on new extent selection

    event.of = function(thiz, argumentz) {
      return function(e1) {
        try {
          var e0 =
          e1.sourceEvent = d3.event;
          e1.target = brush;
          d3.event = e1;
          event[e1.type].apply(thiz, argumentz);
        } finally {
          d3.event = e0;
        }
      };
    };

    function brush(g) {
      g.each(function() {

        // Prepare the brush container for events.
        var g = d3.select(this)
            .style("pointer-events", "all")
            .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)")
            .on("mousedown.brush", brushstart)
            .on("touchstart.brush", brushstart);

        brushElement = g;

        // An invisible, mouseable area for starting a new brush.
        var background = g.selectAll(".background")
            .data([0]);

        background.enter().append("rect")
            .attr("class", "background")
            .style("visibility", "hidden")
            .style("cursor", "crosshair");

        drawExtents(g);

        // When called on a transition, use a transition to update.
        var gUpdate = d3.transition(g),
            backgroundUpdate = d3.transition(background),
            range;

        // Initialize the background to fill the defined range.
        // If the range isn't defined, you can post-process.
        if (x) {
          range = d3_scaleRange(x);
          backgroundUpdate.attr("x", range[0]).attr("width", range[1] - range[0]);
          redrawX(gUpdate);
        }
        if (y) {
          range = d3_scaleRange(y);
          backgroundUpdate.attr("y", range[0]).attr("height", range[1] - range[0]);
          redrawY(gUpdate);
        }
        redraw(gUpdate);
      });
    }

    function drawExtents(g) {
      var ex = xExtent.length > yExtent.length ? xExtent : yExtent,
          i = ex.length
          extentArr = ex.map(function(d,i) { return i; }),
          extentResizes = d3.merge(ex.map(function(d,i) { return resizes.map(function(r) { return [r, i]; }); }));

      if(!g) g = brushElement;

      // The visible brush extent; style this as you like!
      var extent = g.selectAll(".extent")
          .data(extentArr, function (d) { return d; });

      extent.exit().remove();

      extent.enter().append("rect")
          .attr("class", "extent")
          .style("cursor", "move")
          .call(extentAdaption);

      // More invisible rects for resizing the extent.
      var resize = g.selectAll(".resize")
          .data(extentResizes, function (d) { return d[0] + d[1]; });

      // Remove any superfluous resizers.
      resize.exit().remove();

      var newResize = resize.enter().append("g")
          .attr("class", function(d) { return "resize " + d[0]; })
          .style("cursor", function(d) { return d3_svg_brushCursor[d[0]]; });

      newResize.append("rect")
          .attr("x", function(d) { return /[ew]$/.test(d[0]) ? -3 : null; })
          .attr("y", function(d) { return /^[ns]/.test(d[0]) ? -3 : null; })
          .attr("width", 6)
          .attr("height", 6)
          .style("visibility", "hidden");

      newResize.call(resizeAdaption);

      // Show or hide the resizers.
      resize.style("display", function (d) { return brush.empty(d[1]) ? "none" : null; });
    }

    brush.event = function(g) {
      g.each(function() {
        var event_ = event.of(this, arguments),
            extent1 = {x: xExtent, y: yExtent, i: xExtentDomain, j: yExtentDomain},
            extent0 = this.__chart__ || extent1;
        this.__chart__ = extent1;
	event_({type: "brushstart"});
	event_({type: "brush", mode: "resize"});
	event_({type: "brushend"});
      });
    };

    function redraw(g) {
      g.selectAll(".resize").attr("transform", function(d) {
        return "translate(" + xExtent[d[1]][+/e$/.test(d[0])] + "," + yExtent[d[1]][+/^s/.test(d[0])] + ")";
      });
    }

    function redrawX(g) {
      g.selectAll(".extent").attr("x", function (d) { return xExtent[d][0]; });
      g.selectAll(".extent").attr("width", function(d) { return xExtent[d][1] - xExtent[d][0]; });
    }

    function redrawY(g) {
      g.selectAll(".extent").attr("y", function (d) { return yExtent[d][0]; });
      g.selectAll(".extent").attr("height", function (d) { return yExtent[d][1] - yExtent[d][0]; });
    }

    function brushstart() {
      var target = this,
          eventTarget = d3.select(d3.event.target),
          event_ = event.of(target, arguments),
          g = d3.select(target),
          resizing = eventTarget.datum()[0],
          resizingX = !/^(n|s)$/.test(resizing) && x,
          resizingY = !/^(e|w)$/.test(resizing) && y,
          dragging = eventTarget.classed("extent"),
          dragRestore = d3_event_dragSuppress(target),
          center,
          origin = d3.mouse(target),
          offset,
          i;

      var w = d3.select(window)
          .on("keydown.brush", keydown)
          .on("keyup.brush", keyup);

      if (d3.event.changedTouches) {
        w.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
      } else {
        w.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
      }

      // Interrupt the transition, if any.
      g.interrupt().selectAll("*").interrupt();

      // If the extent was clicked on, drag rather than brush;
      // store the point between the mouse and extent origin instead.
      if (dragging) {
        i = eventTarget.datum();
        origin[0] = xExtent[i][0] - origin[0];
        origin[1] = yExtent[i][0] - origin[1];
      }

      // If a resizer was clicked on, record which side is to be resized.
      // Also, set the origin to the opposite side.
      else if (resizing) {
        var ex = +/w$/.test(resizing),
            ey = +/^n/.test(resizing);

        i = eventTarget.datum()[1];
        offset = [xExtent[i][1 - ex] - origin[0], yExtent[i][1 - ey] - origin[1]];
        origin[0] = xExtent[i][ex];
        origin[1] = yExtent[i][ey];
      }

      else {
        i = xExtent.length - 1; // Figure out the count of the new extent.
        xExtent.push([0,0]);
        yExtent.push([0,0]);

        // If the ALT key is down when starting a brush, the center is at the mouse.
        if (d3.event.altKey) center = origin.slice();
      }

      // Propagate the active cursor to the body for the drag duration.
      g.style("pointer-events", "none");
      d3.select("body").style("cursor", eventTarget.style("cursor"));

      // Show resizers as long as we're not dragging or resizing.
      if(!dragging && !resizing) g.selectAll(".resize").style("display", null)

      // Notify listeners.
      event_({type: "brushstart"});
      brushmove();

      function keydown() {
        if (d3.event.keyCode == 32) {
          if (!dragging) {
            center = null;
            origin[0] -= xExtent[i][1];
            origin[1] -= yExtent[i][1];
            dragging = 2;
          }
          d3.event.preventDefault();
        }
      }

      function keyup() {
        if (d3.event.keyCode == 32 && dragging == 2) {
          origin[0] += xExtent[i][1];
          origin[1] += yExtent[i][1];
          dragging = 0;
          d3.event.preventDefault();
        }
      }

      function brushmove() {
        var point = d3.mouse(target),
            moved = false;

        // Preserve the offset for thick resizers.
        if (offset) {
          point[0] += offset[0];
          point[1] += offset[1];
        }

        if (!dragging) {

          // If needed, determine the center from the current extent.
          if (d3.event.altKey) {
            if (!center) center = [(xExtent[i][0] + xExtent[i][1]) / 2, (yExtent[i][0] + yExtent[i][1]) / 2];

            // Update the origin, for when the ALT key is released.
            origin[0] = xExtent[i][+(point[0] < center[0])];
            origin[1] = yExtent[i][+(point[1] < center[1])];
          }

          // When the ALT key is released, we clear the center.
          else center = null;
        }

        // Update the brush extent for each dimension.
        if (resizingX && move1(point, x, 0)) {
          redrawX(g, i);
          moved = true;
        }
        if (resizingY && move1(point, y, 1)) {
          redrawY(g, i);
          moved = true;
        }

        // Final redraw and notify listeners.
        if (moved) {
          redraw(g);
          event_({type: "brush", mode: dragging ? "move" : "resize"});
        }
      }

      function move1(point, scale, j) {
        var range = d3_scaleRange(scale),
            r0 = range[0],
            r1 = range[1],
            position = origin[j],
            extent = j ? yExtent[i] : xExtent[i],
            size = extent[1] - extent[0],
            min,
            max;

        // When dragging, reduce the range by the extent size and position.
        if (dragging) {
          r0 -= position;
          r1 -= size + position;
        }

        // Clamp the point (unless clamp set to false) so that the extent fits within the range extent.
        min = (j ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[j])) : point[j];

        // Compute the new extent bounds.
        if (dragging) {
          max = (min += position) + size;
        } else {

          // If the ALT key is pressed, then preserve the center of the extent.
          if (center) position = Math.max(r0, Math.min(r1, 2 * center[j] - min));

          // Compute the min and max of the position and point.
          if (position < min) {
            max = min;
            min = position;
          } else {
            max = position;
          }
        }

        // Update the stored bounds.
        if (extent[0] != min || extent[1] != max) {
          if (j) yExtentDomain[i] = null;
          else xExtentDomain[i] = null;
          extent[0] = min;
          extent[1] = max;
          return true;
        }
      }

      function brushend() {
        brushmove();

        // If the current extent is empty, clear everything.
        if(x && xExtent[i][0] == xExtent[i][1] ||
           y && yExtent[i][0] == yExtent[i][1]) {
          brush.clear();
        }

        // reset the cursor styles
        g.style("pointer-events", "all").selectAll(".resize").style("display", function(d) { return brush.empty(d[1]) ? "none" : null; });
        d3.select("body").style("cursor", null);

        w .on("mousemove.brush", null)
          .on("mouseup.brush", null)
          .on("touchmove.brush", null)
          .on("touchend.brush", null)
          .on("keydown.brush", null)
          .on("keyup.brush", null);

        drawExtents();

        dragRestore();
        event_({type: "brushend"});
      }
    }

    brush.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y]; // fore!
      return brush;
    };

    brush.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y]; // fore!
      return brush;
    };

    brush.resizeAdaption = function(z) {
      if (!arguments.length) return resizeAdaption;
      resizeAdaption = z;
      return brush;
    }

    brush.extentAdaption = function(z) {
      if (!arguments.length) return extentAdaption;
      extentAdaption = z;
      return brush;
    }

    brush.clamp = function(z) {
      if (!arguments.length) return x && y ? [xClamp, yClamp] : x ? xClamp : y ? yClamp : null;
      if (x && y) xClamp = !!z[0], yClamp = !!z[1];
      else if (x) xClamp = !!z;
      else if (y) yClamp = !!z;
      return brush;
    };

    brush.extent = function(z) {
      var x0, x1, y0, y1, t;
      var xOutput, yOutput, xyOutput = [];

      // Invert the pixel extent to data-space.
      if (!arguments.length) {
        if (x) {
          if (xExtentDomain[0]) {
            xOutput = xExtentDomain;
          } else {
            xOutput = xExtent.map(function (d) {
              if (x.invert) return [ x.invert(d[0]), x.invert(d[1]) ];
              return d;
            }).map(function (d) {
              if (d[1] < d[0]) return [ d[1], d[0] ];
              return d;
            }).filter(function (d) { return d[1] - d[0] != 0; });
          }
        }
        if (y) {
          if (yExtentDomain[0]) {
            yOutput = yExtentDomain;
          } else {
            yOutput = yExtent.map(function (d) {
              if(y.invert) return [ y.invert(d[0]), y.invert(d[1]) ];
              return d;
            }).map(function (d) {
              if (d[1] < d[0]) return [ d[1], d[0] ];
              return d;
            }).filter(function (d) { return d[1] - d[0] != 0; });
          }
        }
        if(x && y) {
          xOutput.forEach(function (d, i) {
            xyOutput.push([[d[0], yOutput[i][0]], [d[1], yOutput[i][1]]]);
          });
        }
        return x && y ? xyOutput : x ? xOutput : y && yOutput;
      }

      // Scale the data-space extent to pixels.
      if (x) {
        xOutput = z;
        if (y) xOutput = xOutput.map(function (d) {
          return [d[0][0], d[1][0]];
        });
        xExtentDomain = xOutput;
        xOutput = xOutput.map(function (d) {
          if (x.invert) return [x(d[0]), x(d[1])];
          return d;
        }).map(function (d) {
          if(d[1] < d[0]) return [d[1], d[0]];
          return d;
        });
        xExtent = xOutput;
        if(!y) yExtent = xOutput.map(function() { return [0,0]; });
      }
      if (y) {
        yOutput = z;
        if (x) yOutput = yOutput.map(function (d) {
          return [d[0][1], d[1][1]];
        });
        yExtentDomain = yOutput;
        yOutput = yOutput.map(function (d) {
          if (y.invert) return [y(d[0]), y(d[1])];
          return d;
        }).map(function (d) {
          if(d[1] < d[0]) return [d[1], d[0]];
          return d;
        });
        yExtent = yOutput;
        if(!x) xExtent = yOutput.map(function () { return [0,0]; });
      }

      // Handle the case where the extents are set to empty arrays.
      if(xExtent.length === 0) xExtent = [[0,0]];
      if(yExtent.length === 0) yExtent = [[0,0]];

      return brush;
    };

    brush.clear = function() {
      xExtent = [[0, 0]], yExtent = [[0, 0]];
      xExtentDomain = yExtentDomain = [];
      drawExtents();
      if(x) redrawX(brushElement);
      if(y) redrawY(brushElement);
      return brush;
    };

    brush.empty = function(i) {
    if (this.extent().length === 0) {
      return true;
    }
      if(xExtent.length == 1 && yExtent.length == 1) i = 0;
      if(i !== undefined) {
        return !!x && xExtent[i][0] == xExtent[i][1]
          || !!y && yExtent[i][0] == yExtent[i][1];
      } else {
        return false;
      }
    };

    return d3.rebind(brush, event, "on");
  };

  var d3_svg_brushCursor = {
    n: "ns-resize",
    e: "ew-resize",
    s: "ns-resize",
    w: "ew-resize",
    nw: "nwse-resize",
    ne: "nesw-resize",
    se: "nwse-resize",
    sw: "nesw-resize"
  };

  var d3_svg_brushResizes = [
    ["n", "e", "s", "w", "nw", "ne", "se", "sw"],
    ["e", "w"],
    ["n", "s"],
    []
  ];
})();
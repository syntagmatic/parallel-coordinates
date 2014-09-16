// bl.ocks.org/syntagmatic/5441022

function drawStrum(p1, p2) {
  var pinchCtx = ctx["pinch"];
  pinchCtx.strokeStyle = "#0f8";
  pinchCtx.beginPath();
  pinchCtx.moveTo(p1[0], p1[1]);
  pinchCtx.lineTo(p2[0], p2[1]);
  pinchCtx.stroke();
}

function dimensionsForPoint(p) {
  var dims = { i: -1, left: undefined, right: undefined }
  __.dimensions.some(function(dim, i) {
    if (xscale(dim) < p[0]) {
      var next = __.dimensions[i + 1];
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
    dims.left = __.dimensions[0];
    dims.right = __.dimensions[1];
  } else if (dims.right === undefined) {
    // Event on the right side of the last axis
    dims.i = __.dimensions.length - 1;
    dims.right = dims.left;
    dims.left = __.dimensions[__.dimensions.length - 2];
  }

  return dims;
}

function onDragStart(strums) {
  // First we need to determine between which two axes the sturm was started.
  // This will determine the freedom of movement, because a strum can
  // logically only happen between two axes, so no movement outside these axes
  // should be allowed.
  return function() {
    var p = d3.mouse(canvas["pinch"]),
        dims = dimensionsForPoint(p),
        strum = {
          p1: p,
          dims: dims,
          minX: xscale(dims.left),
          maxX: xscale(dims.right)
        };

    strums[dims.i] = strum;
    strums.active = dims.i;

    // Make sure that the point is within the bounds
    strum.p1[0] = Math.min(Math.max(strum.minX, p[0]), strum.maxX);
    strum.p1[1] = p[1];
    strum.p2 = strum.p1.slice();
  };
}

function onDrag(strums) {
  return function() {
    var ev = d3.event,
        strum = strums[strums.active];

    // Make sure that the point is within the bounds
    strum.p2[0] = Math.min(Math.max(strum.minX + 1, ev.x), strum.maxX);
    strum.p2[1] = ev.y - __.margin.top;

    ctx["pinch"].clearRect(strum.minX, 0, strum.maxX - strum.minX, h() + 2);
    drawStrum(strum.p1, strum.p2);
    //mouseMove(d3.event.x,d3.event.y);
  }
}

function onDragEnd(strums) {
  return function() {
    var brushed = __.data,
        ids = [],
        strum = strums[strums.active];

    // Okay, somewhat unexpected, but not totally unsurprising, a mousclick is
    // considered a drag without move. So we have to deal with that case
    if (strum.p1[0] === strum.p2[0] && strum.p1[1] === strum.p2[1]) {
      removeStrum(strums);
    }

    // Get the ids of the currently active strums.
    ids = Object.getOwnPropertyNames(strums).filter(function(d) { 
      return !isNaN(d); 
    });

    brushed = brushed.filter(function(d) {
      // Yes, double negation. However, this avoids each strum being tested for
      // each data item, even though when the first strum already doesn't
      // contain the item. So, even though it doesn't reduces the worst case
      // scenario O(n * N), with n being the number of strums and N the number
      // of data items, it does improve the average run time.
      return !ids.some(function(id) {
        var strum = strums[id],
            test = containmentTest(strum, strums.width(id)),
            d1 = strum.dims.left,
            d2 = strum.dims.right,
            y1 = yscale[d1],
            y2 = yscale[d2],
            point = [y1(d[d1]) - strum.minX, y2(d[d2]) - strum.minX];
        return !test(point);
      });
    });

    strums.active = undefined;
    __.brushed = brushed.length === __.data.length ? false : brushed;
    events.brushend.call(pc, __.brushed);
    pc.render();
  }
}

function containmentTest(strum, width) {
  var p1 = [strum.p1[0] - strum.minX, strum.p1[1] - strum.minX],
      p2 = [strum.p2[0] - strum.minX, strum.p2[1] - strum.minX],
      m1 = 1 - width / p1[0],
      b1 = p1[1] * (1 - m1),
      m2 = 1 - width / p2[0],
      b2 = p2[1] * (1 - m2);

  // test if point falls between lines
  return function(p) {
    var x = p[0],
        y = p[1],
        y1 = m1 * x + b1,
        y2 = m2 * x + b2;

    if (y > Math.min(y1, y2) && y < Math.max(y1, y2))
      return true;

    return false;
  };
};

function removeStrum(strums) {
  var strum = strums[strums.active],
      pinchCtx = ctx["pinch"];

  delete strums[strums.active];
  strums.active = undefined;
  pinchCtx.clearRect(strum.minX, 0, strum.maxX - strum.minX, h() + 2);
}

pc.pinchable = function() {
  var strums = {},
      drag = d3.behavior.drag();
  
  // Map of current strums. Strums are stored per segment of the PC. A segment,
  // being the area between two axes. The left most area is indexed at 0.
  strums.active = undefined;
  // Returns the width of the PC segment where currently a strum is being
  // placed. NOTE: even though they are evenly spaced in our current 
  // implementation, we keep for when non-even spaced segments are supported as
  // well. 
  strums.width = function(id) {
    var strum = strums[id];

    if (strum === undefined) {
      return undefined;
    }

    return strum.maxX - strum.minX;
  }

  drag
    .on("dragstart", onDragStart(strums))
    .on("drag", onDrag(strums))
    .on("dragend", onDragEnd(strums));

  d3.select(canvas["pinch"])
    .call(drag);
}

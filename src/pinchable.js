// bl.ocks.org/syntagmatic/5441022

function drawPinchline(p1, p2) {
  var pinchCtx = ctx["pinch"];
  pinchCtx.strokeStyle = "#0f8";
  pinchCtx.beginPath();
  pinchCtx.moveTo(p1[0], p1[1]);
  pinchCtx.lineTo(p2[0], p2[1]);
  pinchCtx.stroke();
}

function dimensionsForPoint(p) {
  var dims = { left: undefined, right: undefined }
  __.dimensions.some(function(dim, i) {
    if (xscale(dim) < p[0]) {
      var next = __.dimensions[i + 1];
      dims.left = dim;
      dims.right = next;
      return false;
    }
    return true;
  });

  if (dims.left === undefined) {
    // Event on the left side of the first axis.
    dims.left = __.dimensions[0];
    dims.right = __.dimensions[1];
  } else if (dims.right === undefined) {
    // Event on the right side of the last axis
    dims.right = dims.left;
    dims.left = __.dimensions[__.dimensions.length - 2];
  }

  return dims;
}

function onDragStart(cfg) {
  // First we need to determine between which two axes the pinch was started.
  // This will determine the freedom of movement, because a pinch can
  // logically only happen between two axes, so no movement outside these axes
  // should be allowed.
  return function() {
    var p = d3.mouse(canvas["pinch"]),
        dims = dimensionsForPoint(p);

    cfg.dims = dims;
    cfg.minX = xscale(dims.left);
    cfg.maxX = xscale(dims.right);

    // Make sure that the point is within the bounds
    cfg.p1[0] = Math.min(Math.max(cfg.minX, p[0]), cfg.maxX);
    cfg.p1[1] = p[1];
  };
}

function onDrag(cfg) {
  return function() {
    var ev = d3.event;

    // Make sure that the point is within the bounds
    cfg.p2[0] = Math.min(Math.max(cfg.minX, ev.x), cfg.maxX);
    cfg.p2[1] = ev.y - __.margin.top;

    ctx["pinch"].clearRect(cfg.minX, 0, cfg.maxX - cfg.minX, h() + 2);
    drawPinchline(cfg.p1, cfg.p2);
    //mouseMove(d3.event.x,d3.event.y);
  }
}

function onDragEnd(cfg) {
  return function() {
    var test = containmentTest(cfg),
        d1 = cfg.dims.left,
        d2 = cfg.dims.right,
        y1 = yscale[d1],
        y2 = yscale[d2],
        brushed = [];

    __.data.forEach(function(d) {
      var point = [y1(d[d1]) - cfg.minX, y2(d[d2]) - cfg.minX];
      if (test(point)) {
        brushed.push(d);
      }
    });

    __.brushed = brushed;
    events.brushend.call(pc, __.brushed);
    pc.render();
  }
}

function containmentTest(cfg) {
  var p1 = [cfg.p1[0] - cfg.minX, cfg.p1[1] - cfg.minX],
      p2 = [cfg.p2[0] - cfg.minX, cfg.p2[1] - cfg.minX],
      m1 = 1 - cfg.width() / p1[0],
      b1 = p1[1] * (1 - m1),
      m2 = 1 - cfg.width() / p2[0],
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

function removePinch() {
  var p = d3.mouse(canvas["pinch"]),
      dims = dimensionsForPoint(p),
      minX = xscale(dims.left),
      maxX = xscale(dims.right),
      pinchCtx = ctx["pinch"];

  pinchCtx.clearRect(minX, 0, maxX - minX, h() + 2);
  __.brushed = false;
  pc.render();
}

pc.pinchable = function() {
  var cfg = {       // Holds the configuration of the current pinch
        p1: [0, 0], // Start point of the pinch
        p2: [0, 0], // End point of the pinch
        minX: 0,    // The minimum x-value that the start and the end point may take
        maxX: 0     // The maximum x-value that the start and end point may take
      },            // All above coords are in visualization space.
      drag = d3.behavior.drag();

  cfg.width = function() {
    return cfg.maxX - cfg.minX;
  };

  drag
    .on("dragstart", onDragStart(cfg))
    .on("drag", onDrag(cfg))
    .on("dragend", onDragEnd(cfg));

  d3.select(canvas["pinch"])
    .on("click", removePinch)
    .call(drag);
}

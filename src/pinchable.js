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

    cfg.minX = xscale(dims.left),
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

function removePinch() {
  var p = d3.mouse(canvas["pinch"]),
      dims = dimensionsForPoint(p),
      minX = xscale(dims.left),
      maxX = xscale(dims.right),
      pinchCtx = ctx["pinch"];

  pinchCtx.clearRect(minX, 0, maxX - minX, h() + 2);
}

pc.pinchable = function() {
  var cfg = { p1: [0, 0], p2: [0, 0], minX: 0, maxX: 0 },
      drag = d3.behavior.drag();

  drag
    .on("dragstart", onDragStart(cfg))
    .on("drag", onDrag(cfg));

  d3.select(canvas["pinch"])
    .on("click", removePinch)
    .call(drag);
}

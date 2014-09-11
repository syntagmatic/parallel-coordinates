// bl.ocks.org/syntagmatic/5441022

function drawPinchline(cfg) {
  var pinchCtx = ctx["pinch"];
  pinchCtx.clearRect(cfg.minX, 0, cfg.maxX - cfg.minX, h() + 2);
  pinchCtx.strokeStyle = "#0f8";
  pinchCtx.beginPath();
  pinchCtx.moveTo(cfg.p1[0], cfg.p1[1]);
  pinchCtx.lineTo(cfg.p2[0], cfg.p2[1]);
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

function initDrag(cfg, ev) {
  var left, righ;

  cfg.p1 = [ev.x - ev.dx, ev.y - ev.dy - __.margin.top];
  cfg.p2 = [ev.x, ev.y];
  // First we need to determine between which two axes the pinch was started.
  // This will determine the freedom of movement, because a pinch can
  // logically only happen between two axes, so no movement outside these axes
  // should be allowed.
  __.dimensions.some(function(dim, index) {
    if (xscale(dim) < cfg.p1[0]) {
      // TODO: Make sure that the start is between two axes (and not before
      //       the first, or after the last.
      var next = __.dimensions[index + 1];
      left = { dim: dim, x: xscale(dim) };
      right = { dim: next, x: xscale(next) };
      return false;
    }
    return true;
  });
  cfg.minX = left.x;
  cfg.maxX = right.x;
  return cfg;
}

function onDragStart(cfg) {
  return function() {
    cfg.p1 = undefined;
  };
}

function onDrag(cfg) {
  return function() {
    var ev = d3.event;
    
    // We initialize the drag here in stead of on dragstart, as dragstart
    // doesn't give us a convenient mouse position.
    // FIXME: Try harder to get the correct mouse position in dragstart to avoid
    //        this check for every drag event.
    if (cfg.p1 === undefined) {
      cfg = initDrag(cfg, ev);
    }

    // Make sure that the point is within the bounds
    cfg.p2[0] = Math.min(Math.max(cfg.minX, ev.x), cfg.maxX);
    cfg.p2[1] = ev.y - __.margin.top;

    drawPinchline(cfg);
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
  var cfg = { p1: undefined, p2: undefined, minX: 0, maxX: 0 },
      drag = d3.behavior.drag();

  drag
    .on("dragstart", onDragStart(cfg))
    .on("drag", onDrag(cfg));

  d3.select(canvas["pinch"])
    .on("click", removePinch)
    .call(drag);
}

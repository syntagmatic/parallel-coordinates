pc.clear = function(layer) {
  ctx[layer].clearRect(0, 0, w() + 2, h() + 2);

  // This will make sure that the foreground items are transparent
  // without the need for changing the opacity style of the foreground canvas
  // as this would stop the css styling from working
  if(layer === "brushed" && isBrushed()) {
    ctx.brushed.fillStyle = pc.selection.style("background-color");
    ctx.brushed.globalAlpha = 1 - __.alphaOnBrushed;
    ctx.brushed.fillRect(0, 0, w() + 2, h() + 2);
    ctx.brushed.globalAlpha = __.alpha;
  }
  return this;
};

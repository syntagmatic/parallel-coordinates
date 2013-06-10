pc.clear = function(layer) {
  ctx[layer].clearRect(0,0,w()+2,h()+2);
  return this;
};

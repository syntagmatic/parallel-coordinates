pc.shadows = function() {
  flags.shadows = true;
  if (__.data.length > 0) paths(__.data, ctx.shadows);
  return this;
};

// draw little dots on the axis line where data intersects
pc.axisDots = function() {
  var ctx = pc.ctx.marks;
  ctx.globalAlpha = d3.min([1/Math.pow(data.length, 1/2), 1]);
  __.data.forEach(function(d) {
    __.dimensions.map(function(p,i) {
      ctx.fillRect(position(p)-0.75,yscale[p](d[p])-0.75,1.5,1.5);
    });
  });
  return this;
};

// draw single polyline
function color_path(d, ctx) {
  ctx.strokeStyle = d3.functor(__.color)(d);
  ctx.beginPath();
  __.dimensions.map(function(p,i) {
    if (i == 0) {
      ctx.moveTo(position(p),yscale[p](d[p]));
    } else {
      ctx.lineTo(position(p),yscale[p](d[p]));
    }
  });
  ctx.stroke();
};

// draw many polylines of the same color
function paths(data, ctx) {
  ctx.clearRect(-1,-1,w()+2,h()+2);
  ctx.beginPath();
  data.forEach(function(d) {
    __.dimensions.map(function(p,i) {
      if (i == 0) {
        ctx.moveTo(position(p),yscale[p](d[p]));
      } else {
        ctx.lineTo(position(p),yscale[p](d[p]));
      }
    });
  });
  ctx.stroke();
};

function path_foreground(d) {
  return color_path(d, ctx.foreground);
};

function path_highlight(d) {
  return color_path(d, ctx.highlight);
};

pc.shadows = function() {
	flags.shadows = true;
	pc.alphaOnBrushed(0.1);
	pc.render();
	return this;
};

// draw little dots on the axis line where data intersects
pc.axisDots = function() {
	var ctx = pc.ctx.marks;
	ctx.globalAlpha = d3.min([ 1 / Math.pow(__.data.length, 1 / 2), 1 ]);
	__.data.forEach(function(d) {
		__.dimensions.map(function(p, i) {
			ctx.fillRect(position(p) - 0.75, yscale[p](d[p]) - 0.75, 1.5, 1.5);
		});
	});
	return this;
};

// draw single cubic bezier curve
function single_curve(d, ctx) {

	var centroids = compute_centroids(d);
	var cps = compute_control_points(centroids);

	ctx.moveTo(cps[0].e(1), cps[0].e(2));
	for (var i = 1; i < cps.length; i += 3) {
		if (__.showControlPoints) {
			for (var j = 0; j < 3; j++) {
				ctx.fillRect(cps[i+j].e(1), cps[i+j].e(2), 2, 2);
			}
		}
		ctx.bezierCurveTo(cps[i].e(1), cps[i].e(2), cps[i+1].e(1), cps[i+1].e(2), cps[i+2].e(1), cps[i+2].e(2));
	}
};

// draw single polyline
function color_path(d, ctx) {
	ctx.beginPath();
	if ((__.bundleDimension !== null && __.bundlingStrength > 0) || __.smoothness > 0) {
		single_curve(d, ctx);
	} else {
		single_path(d, ctx);
	}
	ctx.stroke();
};

// draw many polylines of the same color
function paths(data, ctx) {
	ctx.clearRect(-1, -1, w() + 2, h() + 2);
	ctx.beginPath();
	data.forEach(function(d) {
		if ((__.bundleDimension !== null && __.bundlingStrength > 0) || __.smoothness > 0) {
			single_curve(d, ctx);
		} else {
			single_path(d, ctx);
		}
	});
	ctx.stroke();
};

function single_path(d, ctx) {
	__.dimensions.map(function(p, i) {
		if (i == 0) {
			ctx.moveTo(position(p), yscale[p](d[p]));
		} else {
			ctx.lineTo(position(p), yscale[p](d[p]));
		}
	});
}

function path_brushed(d, i) {
  if (__.brushedColor !== null) {
    ctx.brushed.strokeStyle = d3.functor(__.brushedColor)(d, i);
  } else {
    ctx.brushed.strokeStyle = d3.functor(__.color)(d, i);
  }
  return color_path(d, ctx.brushed)
}

function path_foreground(d, i) {
  ctx.foreground.strokeStyle = d3.functor(__.color)(d, i);
	return color_path(d, ctx.foreground);
};

function path_highlight(d, i) {
  ctx.highlight.strokeStyle = d3.functor(__.color)(d, i);
	return color_path(d, ctx.highlight);
};

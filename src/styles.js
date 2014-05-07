pc.shadows = function() {
	flags.shadows = true;
	if (__.data.length > 0) {
		paths(__.data, ctx.shadows);
	}
	return this;
};

// draw little dots on the axis line where data intersects
pc.axisDots = function() {
	var ctx = pc.ctx.marks;
	ctx.globalAlpha = d3.min([ 1 / Math.pow(data.length, 1 / 2), 1 ]);
	__.data.forEach(function(d) {
		__.dimensions.map(function(p, i) {
			ctx.fillRect(position(p) - 0.75, yscale[p](d[p]) - 0.75, 1.5, 1.5);
		});
	});
	return this;
};

// draw single cubic bezier curve
function single_curve(d, ctx) {
	var dim = __.dimensions[0];
	ctx.moveTo(position(dim), yscale[dim](d[dim]));
	for (var i = 0; i < __.dimensions.length - 1; ++i) {
		var p = $V([ position(__.dimensions[i]),
				yscale[__.dimensions[i]](d[__.dimensions[i]]) ]);
		var pm1 = i == 0 ? null : $V([ position(__.dimensions[i - 1]),
				yscale[__.dimensions[i - 1]](d[__.dimensions[i - 1]]) ]);
		var pp1 = $V([ position(__.dimensions[i + 1]),
				yscale[__.dimensions[i + 1]](d[__.dimensions[i + 1]]) ]);
		var pp2 = i >= __.dimensions.length - 2 ? null : $V([
				position(__.dimensions[i + 2]),
				yscale[__.dimensions[i + 2]](d[__.dimensions[i + 2]]) ]);

		var yi1 = i == 0 ? $V([ p.e(1) + __.smoothness * (pp1.e(1) - p.e(1)),
				p.e(2) ]) : p.add(pp1.subtract(pm1).x(__.smoothness));
		var dpp1p = pp1.subtract(p);
		var zi1 = qp.subtract(dpp1p.x(__.smoothness));
		ctx.bezierCurveTo(yi1.e(1), yi1.e(2), zi1.e(1), zi1.e(2), qp.e(1), qp
				.e(2));

		var zi2 = qp.add(dpp1p.x(__.smoothness));
		var yi2 = i >= __.dimensions.length - 2 ? $V([
				pp1.e(1) + __.smoothness * (pp1.e(1) - p.e(1)), pp1.e(2) ])
				: pp1.subtract(pp2.subtract(p).x(__.smoothness));
		ctx.bezierCurveTo(zi2.e(1), zi2.e(2), yi2.e(1), yi2.e(2), pp1.e(1), pp1
				.e(2));
	}
};

function compute_control_points(centroids) {

	var cols = centroids.length;
	var a = __.smoothness;
	var cps = [];

	for (var col = 0; col < cols; ++col) {
		var mid = centroids[col];
		var left = col == 0 ? $V(mid.e(1) - 0.5, mid.e(2)) : centroids[col - 1];
		var right = col == cols - 1 ? $V(mid.e(1) + 0.5, mid.e(2))
				: centroids[col + 1];

		var diff = left.subtract(right);
		cps.push(mid + diff.x(a));
		cps.push(mid - diff.x(a));
	}

	return cps;

};

// draw single polyline
function color_path(d, ctx) {
	ctx.strokeStyle = d3.functor(__.color)(d);
	ctx.beginPath();
	if (__.bundleDimension === null) {
		single_path(d, ctx);
	} else {
		single_curve(d, ctx);
	}
	ctx.stroke();
};

// draw many polylines of the same color
function paths(data, ctx) {
	ctx.clearRect(-1, -1, w() + 2, h() + 2);
	ctx.beginPath();
	data.forEach(function(d) {
		if (__.bundleDimension === null) {
			single_path(d, ctx);
		} else {
			single_curve(d, ctx);
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

function path_foreground(d) {
	return color_path(d, ctx.foreground);
};

function path_highlight(d) {
	return color_path(d, ctx.highlight);
};

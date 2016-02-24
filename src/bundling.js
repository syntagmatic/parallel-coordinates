function compute_cluster_centroids(d) {

	var clusterCentroids = d3.map();
	var clusterCounts = d3.map();
	// determine clusterCounts
	__.data.forEach(function(row) {
		var scaled = __.dimensions[d].yscale(row[d]);
		if (!clusterCounts.has(scaled)) {
			clusterCounts.set(scaled, 0);
		}
		var count = clusterCounts.get(scaled);
		clusterCounts.set(scaled, count + 1);
	});

	__.data.forEach(function(row) {
		d3.keys(__.dimensions).map(function(p, i) {
			var scaled = __.dimensions[d].yscale(row[d]);
			if (!clusterCentroids.has(scaled)) {
				var map = d3.map();
				clusterCentroids.set(scaled, map);
			}
			if (!clusterCentroids.get(scaled).has(p)) {
				clusterCentroids.get(scaled).set(p, 0);
			}
			var value = clusterCentroids.get(scaled).get(p);
			value += __.dimensions[p].yscale(row[p]) / clusterCounts.get(scaled);
			clusterCentroids.get(scaled).set(p, value);
		});
	});

	return clusterCentroids;

}

function compute_centroids(row) {
	var centroids = [];

	var p = d3.keys(__.dimensions);
	var cols = p.length;
	var a = 0.5;			// center between axes
	for (var i = 0; i < cols; ++i) {
		// centroids on 'real' axes
		var x = position(p[i]);
		var y = __.dimensions[p[i]].yscale(row[p[i]]);
		centroids.push($V([x, y]));

		// centroids on 'virtual' axes
		if (i < cols - 1) {
			var cx = x + a * (position(p[i+1]) - x);
			var cy = y + a * (__.dimensions[p[i+1]].yscale(row[p[i+1]]) - y);
			if (__.bundleDimension !== null) {
				var leftCentroid = __.clusterCentroids.get(__.dimensions[__.bundleDimension].yscale(row[__.bundleDimension])).get(p[i]);
				var rightCentroid = __.clusterCentroids.get(__.dimensions[__.bundleDimension].yscale(row[__.bundleDimension])).get(p[i+1]);
				var centroid = 0.5 * (leftCentroid + rightCentroid);
				cy = centroid + (1 - __.bundlingStrength) * (cy - centroid);
			}
			centroids.push($V([cx, cy]));
		}
	}

	return centroids;
}

function compute_control_points(centroids) {

	var cols = centroids.length;
	var a = __.smoothness;
	var cps = [];

	cps.push(centroids[0]);
	cps.push($V([centroids[0].e(1) + a*2*(centroids[1].e(1)-centroids[0].e(1)), centroids[0].e(2)]));
	for (var col = 1; col < cols - 1; ++col) {
		var mid = centroids[col];
		var left = centroids[col - 1];
		var right = centroids[col + 1];

		var diff = left.subtract(right);
		cps.push(mid.add(diff.x(a)));
		cps.push(mid);
		cps.push(mid.subtract(diff.x(a)));
	}
	cps.push($V([centroids[cols-1].e(1) + a*2*(centroids[cols-2].e(1)-centroids[cols-1].e(1)), centroids[cols-1].e(2)]));
	cps.push(centroids[cols - 1]);

	return cps;

};
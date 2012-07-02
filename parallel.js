// random data
var data = _.map(_.range(400), function() {
  return _.map(_.range(10), function() {
    return Math.random();
  });
});

var w = document.body.clientWidth,        // width
    h = document.body.clientHeight,       // height
    numcols = data[0].length;             // number of dimensions

// canvas
var container = document.getElementById("parallel-coordinates");
container.innerHTML = "<canvas width=" + w + " height=" + h + "></canvas>";
var canvas = $("#parallel-coordinates canvas")[0];
var ctx = canvas.getContext("2d");

// settings
ctx.lineWidth = 1.2;
ctx.fillStyle = "rgba(255,255,255,0.3)";
ctx.strokeStyle = "rgba(255,255,255,0.3)";



// domain of dimensions
var domain = extents(data);

// y scales
var Y = _(domain).map(function(dom) {
  return yscale(dom, {
    "min": 0,
    "max": h
  })
});

// x scale (even)
var X = _(domain).map(function(dom,i) {
  return xscale(numcols, {
    "min": 0,
    "max": w
  })(i);
});

// demo code
_(data).each(function(point) {
  polyline(point, X, Y);
});

// rendering
function polyline(point, X, Y) {
  ctx.beginPath();
  _(point).each(function(val,i) {
    var x = X[i],
        y = Y[i](val);

    if (i==0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
};

// scale by domain and range
function yscale(extent,range) {
  return function(val) {
    return (val-extent.min) * (range.max-range.min) / (extent.max - extent.min);
  };
};

// scale by even column widths
function xscale(numcols,range) {
  return function(i) {
    return i * (range.max-range.min)/(numcols-1);
  };
};

// return min and max for each dimension in a set of coordinates
function extents(coords) {
  return _.map(coords[0], function(__,i) {
    return extent(coords,i);
  });
};

// return min and max for one dimension in a set of coordinates
function extent(coords, i) {
  return {
    "min": _.min(coords, function(d) { return d[i] })[i],
    "max": _.max(coords, function(d) { return d[i] })[i]
  };
};

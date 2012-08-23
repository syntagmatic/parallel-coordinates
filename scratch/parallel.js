// random data
var w = document.body.clientWidth,        // width
    h = document.body.clientHeight;       // height

// canvas
var container = document.getElementById("parallel-coordinates");
container.innerHTML = "<canvas width=" + w + " height=" + h + "></canvas>";
var canvas = $("#parallel-coordinates canvas")[0];
var ctx = canvas.getContext("2d");

// settings
ctx.lineWidth = 1.2;
ctx.fillStyle = "rgba(255,255,255,0.3)";
ctx.strokeStyle = "rgba(255,255,255,0.3)";

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

// return min and max for each dimension in a set of data
function extents(data) {
  return _.map(data[0], function(__,i) {
    return extent(data,i);
  });
};

// return min and max for one dimension in a set of data 
function extent(data, i) {
  return {
    "min": _.min(data, function(d) { return d[i] })[i],
    "max": _.max(data, function(d) { return d[i] })[i]
  };
};

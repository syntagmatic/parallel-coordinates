pc.detectDimensions = function() {
  pc.types(pc.detectDimensionTypes(__.data));
  pc.dimensions(pc.applyDimensionDefaults(d3.keys(pc.types())));
  return this;
};

pc.applyDimensionDefaults = function(dims) {
  var newDims = {};
  dims.forEach(function(k) {
    newDims[k] = __.dimensions[k] ? __.dimensions[k] : {};
    //Set up defaults
    newDims[k].orient= newDims[k].orient ? newDims[k].orient : 'left',
    newDims[k].ticks= newDims[k].ticks ? newDims[k].ticks : 5,
    newDims[k].innerTickSize= newDims[k].innerTickSize ? newDims[k].innerTickSize : 6,
    newDims[k].outerTickSize= newDims[k].outerTickSize ? newDims[k].outerTickSize : 0,
    newDims[k].tickPadding= newDims[k].tickPadding ? newDims[k].tickPadding : 3
  });
  return newDims;
};

// a better "typeof" from this post: http://stackoverflow.com/questions/7390426/better-way-to-get-type-of-a-javascript-variable
pc.toType = function(v) {
  return ({}).toString.call(v).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

// try to coerce to number before returning type
pc.toTypeCoerceNumbers = function(v) {
  if ((parseFloat(v) == v) && (v != null)) {
	return "number";
}
  return pc.toType(v);
};

// attempt to determine types of each dimension based on first row of data
pc.detectDimensionTypes = function(data) {
  var types = {};
  d3.keys(data[0])
    .forEach(function(col) {
      types[isNaN(Number(col)) ? col : parseInt(col)] = pc.toTypeCoerceNumbers(data[0][col]);
    });
  return types;
};

pc.detectDimensions = function() {
  pc.types(pc.detectDimensionTypes(__.data));
  pc.applyDimensionDefaults(d3.keys(pc.types()));
  pc.dimensions(__.dimensions);
  return this;
};

pc.applyDimensionDefaults = function(dims) {
  dims.forEach(function(k) {
    var dim = __.dimensions[k] ? __.dimensions[k] : __.dimensions[k] = {};
    //Set up defaults
    dim.orient= dim.orient ? dim.orient : 'left',
    dim.ticks= dim.ticks ? dim.ticks : 5,
    dim.innerTickSize= dim.innerTickSize ? dim.innerTickSize : 6,
    dim.outerTickSize= dim.outerTickSize ? dim.outerTickSize : 0,
    dim.tickPadding= dim.tickPadding ? dim.tickPadding : 3

  });
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

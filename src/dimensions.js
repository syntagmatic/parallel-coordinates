pc.detectDimensions = function() {
  pc.dimensions(pc.applyDimensionDefaults());
  return this;
};

pc.applyDimensionDefaults = function(dims) {
  var types = pc.detectDimensionTypes(__.data);
  dims = dims ? dims : d3.keys(types);
  var newDims = {};
  var currIndex = 0;
  dims.forEach(function(k) {
    newDims[k] = __.dimensions[k] ? __.dimensions[k] : {};
    //Set up defaults
    newDims[k].orient= newDims[k].orient ? newDims[k].orient : 'left';
    newDims[k].ticks= newDims[k].ticks != null ? newDims[k].ticks : 5;
    newDims[k].innerTickSize= newDims[k].innerTickSize != null ? newDims[k].innerTickSize : 6;
    newDims[k].outerTickSize= newDims[k].outerTickSize != null ? newDims[k].outerTickSize : 0;
    newDims[k].tickPadding= newDims[k].tickPadding != null ? newDims[k].tickPadding : 3;
    newDims[k].type= newDims[k].type ? newDims[k].type : types[k];

    newDims[k].index = newDims[k].index != null ? newDims[k].index : currIndex;
    currIndex++;
  });
  return newDims;
};

pc.getOrderedDimensionKeys = function(){
  return d3.keys(__.dimensions).sort(function(x, y){
    return d3.ascending(__.dimensions[x].index, __.dimensions[y].index);
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

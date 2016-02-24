  // this descriptive text should live with other introspective methods
  pc.toString = function() { return "Parallel Coordinates: " + d3.keys(__.dimensions).length + " dimensions (" + d3.keys(__.data[0]).length + " total) , " + __.data.length + " rows"; };

  return pc;
};


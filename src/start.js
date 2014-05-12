d3.parcoords = function(config) {
  var __ = {
    data: [],
    dimensions: [],
    dimensionTitles: {},
    types: {},
    brushed: false,
    mode: "default",
    rate: 20,
    width: 600,
    height: 300,
    margin: { top: 24, right: 0, bottom: 12, left: 0 },
    color: "#069",
    composite: "source-over",
    alpha: 0.7,
    bundlingStrength: 0.5,
    bundleDimension: null,
    smoothness: 0.25,
    showControlPoints: false,
    hideAxis : []
  };

  extend(__, config);

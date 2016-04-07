d3.parcoords = function(config) {
  var __ = {
    data: [],
    highlighted: [],
    dimensions: {},
    dimensionTitleRotation: 0,
    brushed: false,
    brushedColor: null,
    alphaOnBrushed: 0.0,
    mode: "default",
    rate: 20,
    width: 600,
    height: 300,
    margin: { top: 24, right: 0, bottom: 12, left: 0 },
    nullValueSeparator: "undefined", // set to "top" or "bottom"
    nullValueSeparatorPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    color: "#069",
    composite: "source-over",
    alpha: 0.7,
    bundlingStrength: 0.5,
    bundleDimension: null,
    smoothness: 0.0,
    showControlPoints: false,
    hideAxis : [],
    flipAxes: [],
    animationTime: 1100 // How long it takes to flip the axis when you double click
  };

  extend(__, config);

  if (config && config.dimensionTitles) {
    console.warn("dimensionTitles passed in config is deprecated. Add title to dimension object.");
    d3.entries(config.dimensionTitles).forEach(function(d) {
      if (__.dimensions[d.key]) {
        __.dimensions[d.key].title = __.dimensions[d.key].title ? __.dimensions[d.key].title : d.value;
      } else {
        __.dimensions[d.key] = {
          title: d.value
        };
      }
    });
  }

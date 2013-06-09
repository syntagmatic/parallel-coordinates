d3.parcoords = function(config) {
  var __ = {
    data: [],
    dimensions: [],
    types: {},
    brushed: false,
    mode: "default",
    rate: 20,
    width: 600,
    height: 300,
    margin: { top: 24, right: 0, bottom: 12, left: 0 },
    color: "#069",
    composite: "source-over",
    alpha: 0.7
  };

  extend(__, config);

  var pc = function(selection) {
    selection = pc.selection = d3.select(selection);

    __.width = selection[0][0].clientWidth;
    __.height = selection[0][0].clientHeight;

    // canvas data layers
    ["shadows", "marks", "foreground", "highlight"].forEach(function(layer) {
      canvas[layer] = selection
        .append("canvas")
        .attr("class", layer)[0][0];
      ctx[layer] = canvas[layer].getContext("2d");
    });

    // svg tick and brush layers
    pc.svg = selection
      .append("svg")
        .attr("width", __.width)
        .attr("height", __.height)
      .append("svg:g")
        .attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");

    return pc;
  };

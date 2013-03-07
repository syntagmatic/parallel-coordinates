function scatterplot() {
  var m = [30, 16, 16, 16],      // margins
      w = 300-m[1]-m[3],         // width
      h = 300-m[0]-m[2],         // height
      xcol = 0,                  // active x column
      ycol = 1,                  // active y column
      data = [];

  var svg, dimensions, key, extents;

  // create scales
  var x = d3.scale.linear().range([0, w]),
      y = d3.scale.linear().range([h, 0]);

  // color scale
  var color = {
    "Baby Foods"                        : '#555555',
    "Baked Products"                    : '#7f7f7f',
    "Beverages"                         : '#c49c94',
    "Breakfast Cereals"                 : '#9467bd',
    "Cereal Grains and Pasta"           : '#bcbd22',
    "Dairy and Egg Products"            : '#ff7f0e',
    "Ethnic Foods"                      : '#e7ba52',
    "Fast Foods"                        : '#dbdb8d',
    "Fats and Oils"                     : '#ffbb78',
    "Finfish and Shellfish Products"    : '#e377c2',
    "Fruits and Fruit Juices"           : '#c5b0d5',
    "Legumes and Legume Products"       : '#f7b6d2',
    "Meals, Entrees, and Sidedishes"    : '#17becf',
    "Nut and Seed Products"             : '#8c564b',
    "Pork Products"                     : "#00ee99",
    "Poultry Products"                  : '#d62728',
    "Restaurant Foods"                  : '#1f77b4',
    "Sausages and Luncheon Meats"       : '#ff9896',
    "Snacks"                            : '#9edae5',
    "Soups, Sauces, and Gravies"        : '#98df8a',
    "Spices and Herbs"                  : '#aec7e8',
    "Sweets"                            : '#c7c7c7',
    "Vegetables and Vegetable Products" : '#2ca02c'
  };


  function scatter(selection) {
    // create svg element, adjusted by margins
    svg = d3.select(selection)
      .attr("width", w + m[1] + m[3])
      .attr("height", w + m[0] + m[2])
      .append("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    // get columns of csv, mark excluded columns
    var columns = d3.keys( data[0] ),
        excluded = ['name', 'group', 'id'];

    // get quantitative dimensions
    dimensions = _(columns)
      .difference(excluded);

    // extents for each dimension
    extents = _(dimensions)
      .map(function(col) {
        return [0, d3.max(data, function(d) { return parseFloat(d[col]) })]
      });

    scatter.update();
  };

  scatter.show = function(shown) {
    update = svg.selectAll('circle')
      .style("display", function(d) { return shown.indexOf(d) > -1 ? null : "none"; });
  };
  
  scatter.update = function() {
    x.domain(extents[[xcol]]);
    y.domain(extents[[ycol]]);

    var update = svg.selectAll('circle')
       .data(data, key ? key : undefined);

    update.enter().append('circle')
       .attr("fill", function(d) { return color[d.group]; })
       .attr("cx", function(d) { return x(d[dimensions[xcol]]); })
       .attr("cy", function(d) { return y(d[dimensions[ycol]]); })
       .attr("r", 2)
       .on("mouseover", function(d) {
         d3.select('#hover-food').text(d.name.substr(0,50));
       });

    update.exit().remove();

    update
      .attr("cx", function(d) { return x(d[dimensions[xcol]]); })
      .attr("cy", function(d) { return y(d[dimensions[ycol]]); });

    return scatter;
  };

  scatter.data = function(d) {
    if (!arguments.length) return data;
    data = d; 
    return scatter;
  };

  scatter.key = function(d) {
    if (!arguments.length) return key;
    key = d; 
    return scatter;
  };

  scatter.width = function(d) {
    if (!arguments.length) return w + m[1] + m[3];
    w = d-m[1]-m[3];
    x = d3.scale.linear().range([0, w]);
    return scatter;
  };

  scatter.height = function(d) {
    if (!arguments.length) return h + m[0] + m[2];
    h = d-m[0]-m[2];
    y = d3.scale.linear().range([h, 0]);
    return scatter;
  };

  return scatter;
};

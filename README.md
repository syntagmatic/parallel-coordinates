# Parallel Coordinates

An implementation of parallel coordinates in d3 as a [reusable chart](http://bost.ocks.org/mike/chart/)

## API

<a name="parcoords" href="#parcoords">#</a> <b>parcoords</b>(<i>container_id</i>)

Creates a new parallel coordinates chart within the container. By default the chart will fill the container with margins on the top and bottom. There will also be margins on the left and right equal to half a column width.

<a name="parcoords_data" href="#parcoords_data">#</a> parcoords.<b>data</b>([<i>values</i>])

Add data to the chart by passing in an array of *values*.

A single value may be either an object or an array. All values should be the same format. 

```javascript
// objects
var foods = [
  {name: "Asparagus", protein: 2.2, calcium: 0.024, sodium: 0.002},
  {name: "Butter", protein: 0.85, calcium: 0.024, sodium: 0.714},
  {name: "Coffeecake", protein: 6.8, calcium: 0.054, sodium: 0.351},
  {name: "Pork", protein: 28.5, calcium: 0.016, sodium: 0.056},
  {name: "Provolone", protein: 25.58, calcium: 0.756, sodium: 0.876}
];

// arrays
var cube = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1]
];
```

<a name="parcoords_render" href="#parcoords_render">#</a> parcoords.<b>render</b>()

Renders the polylines.

If no dimensions have been specified, it will attempt to <a href="#parcoords_detectDimensions">detect quantitative dimensions</a> based on the first data entry. If scales haven't been set, it will <a href="#parcoords_autoscale">autoscale</a> based on the <a href="https://github.com/mbostock/d3/wiki/Arrays#wiki-d3_extent">extent</a> for each dimension.

<a name="parcoords_dimensions" href="#parcoords_dimensions">#</a> parcoords.<b>dimensions</b>(*dimensions*)

If *dimensions* is specified, sets the quantitative dimensions to be visualized. The format is an array of dimension names.

```javascript
var dimensions = ['protein', 'calcium', 'sodium'];
```

If no dimensions are specified, then it returns the currently set dimensions.

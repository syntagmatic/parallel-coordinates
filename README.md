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

If no *dimensions* are specified, then it returns the currently set dimensions.

<a name="parcoords_color" href="#parcoords_color">#</a> parcoords.<b>color</b>(*color*)

If a *color* is a string, polylines will be rendered as that color. If *color* is a function, that function will be run for each data element and the polyline color will be the return value.

To set all lines to a transparent green:

```javascript
parcoords.color("rgba(0,200,0,0.3)");
```

TODO: function example

If no *color* is specified, then it returns the currently set color.

<a name="parcoords_state" href="#parcoords_state">#</a> parcoords.<b>state</b>()

Returns an object which contains the state of the chart. This is particularly useful for debugging with a JavaScript console.

<a name="parcoords___" href="#parcoords___">#</a> parcoords.<b>__</b>

Exposes the public state of parallel coordinates. Useful for debugging in a JavaScript console. Avoid modifying values directly, instead use methods such as <a href="#parcoords_data">parcoords.data()</a> to update the state.

The design of this object is experimental and contributed by Ziggy Jonsson. Read more at this (d3-js mailing list discussion)[https://groups.google.com/forum/?fromgroups=#!topic/d3-js/F2IspJnDbEs].

<a name="parcoords_createAxes" href="#parcoords_createAxes">#</a> parcoords.<b>createAxes</b>()

TODO

<a name="parcoords_brushable" href="#parcoords_brushable">#</a> parcoords.<b>brushable</b>()

TODO

<a name="parcoords_reorderable" href="#parcoords_reorderable">#</a> parcoords.<b>reorderable</b>()

TODO

<a name="parcoords_width" href="#parcoords_width">#</a> parcoords.<b>width</b>()

TODO

<a name="parcoords_height" href="#parcoords_height">#</a> parcoords.<b>height</b>()

TODO

<a name="parcoords_margin" href="#parcoords_margin">#</a> parcoords.<b>margin</b>()

TODO

<a name="parcoords_autoscale" href="#parcoords_autoscale">#</a> parcoords.<b>autoscale</b>()

TODO

<a name="parcoords_detectDimensions" href="#parcoords_detectDimensions">#</a> parcoords.<b>detectDimensions</b>()

TODO

<a name="parcoords_clear" href="#parcoords_clear">#</a> parcoords.<b>clear</b>()

TODO

<a name="parcoords_ctx" href="#parcoords_ctx">#</a> parcoords.<b>ctx</b>

TODO


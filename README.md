# Parallel Coordinates

An implementation of parallel coordinates in d3 as a [reusable chart](http://bost.ocks.org/mike/chart/)

## Resources 

### Tutorials

* [Wikipedia](http://en.wikipedia.org/wiki/Parallel_coordinates)
* [Parallel Coordinates](http://eagereyes.org/techniques/parallel-coordinates), Robert Kosara
* [Better Know a Visualization: Parallel Coordinates](http://www.juiceanalytics.com/writing/parallel-coordinates/), Zach Gemignani
* [Multivariate Analysis Using Parallel Coordinates](http://www.b-eye-network.com/view/3355), Stephen Few
* [Edward Tufte's "Slopegraphs"](http://charliepark.org/slopegraphs/), Charlie Park

### Papers

* [Parallel Coordinates: a tool for visualizing mult-dimensional geometry](http://astrostatistics.psu.edu/su06/inselberg061006.pdf), Alfred Inselberg
* [Hyperdimensional Data Analysis Using Parallel Coordinates](https://www.cs.ubc.ca/~tmm/courses/cpsc533c-04-fall/readings/wegman.pdf), Edward Wegman [2](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.15.1902&rep=rep1&type=pdf)
* [On Some Mathametics for Visualizing High Dimensional Data](http://sankhya.isical.ac.in/search/64a2/64a2031.pdf), Edward Wegman, Jeffrey Solka

### Books

* [Parallel Coordinates: Visual Multidimensional Geometry and Its Applications](http://www.amazon.com/Parallel-Coordinates-Multidimensional-Geometry-Applications/dp/0387215077/), Alfred Inselberg.

### Videos

* [Graph theory applied to data visualization playlist](http://www.youtube.com/playlist?list=PL35C0D424A858AE69), Wayne Oldford

### Software

* [Protovis Parallel Coordinates](http://mbostock.github.com/protovis/ex/cars.html), Mike Bostock
* [d3.js Parallel Coordinates](http://bl.ocks.org/1341021), Mike Bostock, Jason Davies
* [GGobi](http://www.ggobi.org/), Debby Swayne, Di Cook, Duncan Temple Lang, Andres Buja, Nicholas Lewin-Koh, Heike Hofmann, Michael Lawrence, Hadley Wickham
* [VizApp](http://vangjee.wordpress.com/2009/04/07/visualizing-massive-and-high-dimensional-data-in-parallel-coordinates-using-vizapp/), Jee Vang
* [XDAT](http://www.xdat.org/)
* [Mondrian](http://www.theusrus.de/Mondrian/), Martin Theus
* [Parvis](http://www.mediavirus.org/parvis/), flo ledermann
* [Parallel Coordinate Graphics using MATLAB](http://people.ece.cornell.edu/land/PROJECTS/Inselberg/), Bruce R. Land
* [Parallel Coordinates in pandas, Python](http://pandasplotting.blogspot.com/2012/06/parallel-coordinates.html), Vytautas Jančauskas

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

The design of this object is experimental and contributed by Ziggy Jonsson. Read more at this [d3-js mailing list discussion](https://groups.google.com/forum/?fromgroups=#!topic/d3-js/F2IspJnDbEs).

<a name="parcoords_createAxes" href="#parcoords_createAxes">#</a> parcoords.<b>createAxes</b>()

Create static SVG axes with dimension names, ticks, and labels.

<a name="parcoords_brushable" href="#parcoords_brushable">#</a> parcoords.<b>brushable</b>()

Enable brushing of axes. Automatically creates axes if they don't exist.

Click and drag vertically on an axis line to create a brush. The brush is both draggable and resizeable. 

To delete an axis, click the axis line (behind the brush extent).

The behavior is identical to that of the [original d3.js parallel coordinates](http://bl.ocks.org/1341021).

<a name="parcoords_brushed" href="#parcoords_brushed">#</a> parcoords.<b>brushed</b>()

For <a href="#parcoords_brushable">brushable</a> plots, returns the selected data.

<a name="parcoords_reorderable" href="#parcoords_reorderable">#</a> parcoords.<b>reorderable</b>()

Enable reordering of axes. Automatically creates axes if they don't exist.

The behavior is identical to that of the [original reorderable d3.js parallel coordinates](http://bl.ocks.org/1341281).

<a name="parcoords_width" href="#parcoords_width">#</a> parcoords.<b>width</b>()

```javascript
parcoords.width(300)
```

<a name="parcoords_height" href="#parcoords_height">#</a> parcoords.<b>height</b>()

```javascript
parcoords.height(300)
```

<a name="parcoords_margin" href="#parcoords_margin">#</a> parcoords.<b>margin</b>()

```javascript
parcoords.margin({
  top: 100,
  left: 0,
  right: 0,
  bottom: 20
})
```

<a name="parcoords_autoscale" href="#parcoords_autoscale">#</a> parcoords.<b>autoscale</b>()

Set the xscale, yscale, and canvas sizes. Usually this is called automatically, such as on render() or resize() events 

<a name="parcoords_detectDimensions" href="#parcoords_detectDimensions">#</a> parcoords.<b>detectDimensions</b>()

Set the quantative dimensions using based on the first row of data.

<a name="parcoords_highlight" href="#parcoords_highlight">#</a> parcoords.<b>highlight</b>([<i>values</i>])

Pass an array of data to overlay the data on the chart, masking the background.

<a name="parcoords_unhighlight" href="#parcoords_unhighlight">#</a> parcoords.<b>unhighlight</b>([<i>values</i>])

Clear the highlighting layer. This is equivalent to calling <a href="#parcoords_clear">parcoords.clear("highlight")</a>.

<a name="parcoords_clear" href="#parcoords_clear">#</a> parcoords.<b>clear</b>(*layer*)

Clear the *layer*, which could be *"foreground"*, *"background"* or *"highlight"*.

<a name="parcoords_ctx" href="#parcoords_ctx">#</a> parcoords.<b>ctx</b>

An object containing the [canvas 2d rendering contexts](https://developer.mozilla.org/en-US/docs/DOM/CanvasRenderingContext2D). Use this to modify canvas rendering styles, except for the foreground stroke which is controlled by <a href="#parcoords_autoscale">parcoords.color()</a>.

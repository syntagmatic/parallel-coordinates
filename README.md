# Parallel Coordinates

An implementation of parallel coordinates in d3 as a [reusable chart](http://bost.ocks.org/mike/chart/)

## Resources 

### Tutorials

* [Wikipedia](http://en.wikipedia.org/wiki/Parallel_coordinates)
* [Parallel Coordinates](http://eagereyes.org/techniques/parallel-coordinates), Robert Kosara
* [Better Know a Visualization: Parallel Coordinates](http://www.juiceanalytics.com/writing/parallel-coordinates/), Zach Gemignani
* [Multivariate Analysis Using Parallel Coordinates](http://www.b-eye-network.com/view/3355), Stephen Few
* [Edward Tufte's "Slopegraphs"](http://charliepark.org/slopegraphs/), Charlie Park
* [Data Visualization's Final Frontier](http://smartdatacollective.com/j-kevin-byrne/52031/data-visualizations-final-frontier), J. Kevin Byrne
* [D3JS Parallel Lines and Football](http://dexvis.wordpress.com/2013/01/28/d3js-parallel-lines-and-football/), Patrick Martin

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
* [PointCloudXplore](http://vis.lbl.gov/Vignettes/Drosophila/index.html)

## API

<a name="d3_parcoords" href="#d3_parcoords">#</a> d3.<b>parcoords</b>(<i>config</i>)

Setup a new parallel coordinates chart.

<a name="parcoords" href="#parcoords">#</a> <b>parcoords</b>(<i>selector</i>)

Create the chart within a container. The selector can also be a [d3 selection](https://github.com/mbostock/d3/wiki/Selections).

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

If *dimensions* is specified, sets the quantitative dimensions to be visualized. The format is an array of dimension names. This will update the xscale domain, but will not trigger re-rendering of lines or axes.

```javascript
var dimensions = ['protein', 'calcium', 'sodium'];
```

If no *dimensions* are specified, then it returns the currently set dimensions.

<a name="parcoords_types" href="#parcoords_types">#</a> parcoords.<b>types</b>(*object*)

If *types* is specified, sets the data types for the dimensions. The format is an object where the keys are dimension names and the values are type strings.

For example:

```javascript
var types = {
  "name": "string",
  "protein": "number",
  "calcium": "number"
}
```

If no *types* are specified, then it returns the currently set types.

Detected types are automatically populated by <a href="#parcoords_detectDimensions">detectDimensions</a> using d3.parcoords.<strong>detectDimensionTypes</strong>.

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

<a name="parcoords_state" href="#parcoords_state">#</a> parcoords.<b>state</b>

Exposes the public state of parallel coordinates. Useful for debugging in a JavaScript console. Avoid modifying values directly, instead use methods such as <a href="#parcoords_data">parcoords.data()</a> to update the state.

The design of this object is experimental and contributed by Ziggy Jonsson. Read more at this [d3-js mailing list discussion](https://groups.google.com/forum/?fromgroups=#!topic/d3-js/F2IspJnDbEs).

When the public state is updated through a method, an <a href="#parcoords_on">event</a> will fire.

<a name="parcoords_createAxes" href="#parcoords_createAxes">#</a> parcoords.<b>createAxes</b>()

Create static SVG axes with dimension names, ticks, and labels.

<a name="parcoords_removeAxes" href="#parcoords_removeAxes">#</a> parcoords.<b>removeAxes</b>()

Remove SVG axes.

<a name="parcoords_updateAxes" href="#parcoords_updateAxes">#</a> parcoords.<b>updateAxes</b>()

Update SVG axes. Call this after updating the dimension order.

<a name="parcoords_brushable" href="#parcoords_brushable">#</a> parcoords.<b>brushable</b>()

Enable brushing of axes. Automatically creates axes if they don't exist.

Click and drag vertically on an axis line to create a brush. The brush is both draggable and resizeable. 

To delete an axis, click the axis line (behind the brush extent).

The behavior is identical to that of the [original d3.js parallel coordinates](http://bl.ocks.org/1341021).

<a name="parcoords_brushed" href="#parcoords_brushed">#</a> parcoords.<b>brushed</b>()

For <a href="#parcoords_brushable">brushable</a> plots, returns the selected data.

<a name="parcoords_brushReset" href="#parcoords_brushReset">#</a> parcoords.<b>brushReset</b>()

TODO. This is supposed to reset all brushes, but may not work presently.

<a name="parcoords_reorderable" href="#parcoords_reorderable">#</a> parcoords.<b>reorderable</b>()

Enable reordering of axes. Automatically creates axes if they don't exist.

The behavior is identical to that of the [original reorderable d3.js parallel coordinates](http://bl.ocks.org/1341281).

<a name="parcoords_axisDots" href="#parcoords_axisDots">#</a> parcoords.<b>axisDots</b>()

Mark the points where polylines meet an axis with dots.

<a name="parcoords_shadows" href="#parcoords_shadows">#</a> parcoords.<b>shadows</b>()

Active greyed-out background shadows.

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

<a name="parcoords_composite" href="#parcoords_composite">#</a> parcoords.<b>composite</b>()

Change foreground context's [globalCompositeOperation](https://developer.mozilla.org/en-US/docs/Canvas_tutorial/Compositing)

* source-over
* source-in
* source-out
* source-atop
* destination-over
* destination-in
* destination-out
* destination-atop
* lighter
* darker
* xor
* copy

<a name="parcoords_alpha" href="#parcoords_alpha">#</a> parcoords.<b>alpha</b>()

Change the opacity of the polylines, also the foreground context's globalAlpha. 

<a name="parcoords_autoscale" href="#parcoords_autoscale">#</a> parcoords.<b>autoscale</b>()

Set the xscale, yscale, and canvas sizes. Usually this is called automatically, such as on render() or resize() events 

<a name="parcoords_mode" href="#parcoords_mode">#</a> parcoords.<b>mode</b>(*type*)

Toggle the rendering mode. Currently there are two options:

* *"default"* renders instantaneously, but is less responsive with more than ~2000 rows of data
* *"queue"* puts the data in a queue, and renders progressively. This way the user can interact with the chart during rendering.

<a name="parcoords_rate" href="#parcoords_rate">#</a> parcoords.<b>rate</b>(*integer*)

Change the number of lines drawn each frame when the <a href="#parcoords_mode">rendering mode</a> is set to *"queue"*. Some suggested values for different machines are:

* Mobile phone or iPad: 12-30
* Normal PC with Firefox: 20-60
* Normal PC with Chrome/Safari: 30-100
* Fast PC with Chrome/Safari: 100-300

In the future, an automatic rate adjuster will be included to optimize this number on-the-fly.

<a name="parcoords_detectDimensions" href="#parcoords_detectDimensions">#</a> parcoords.<b>detectDimensions</b>()

Set the quantative dimensions using based on the first row of data.

<a name="parcoords_highlight" href="#parcoords_highlight">#</a> parcoords.<b>highlight</b>([<i>values</i>])

Pass an array of data to overlay the data on the chart, masking the foreground.

<a name="parcoords_unhighlight" href="#parcoords_unhighlight">#</a> parcoords.<b>unhighlight</b>([<i>values</i>])

Clear the highlighting layer. This is equivalent to calling <a href="#parcoords_clear">parcoords.clear("highlight")</a>.

<a name="parcoords_interactive" href="#parcoords_interactive">#</a> parcoords.<b>interactive</b>()

Activate interactive mode for use with a JavaScript console. The concept is that for each method that modifies a chart, everything that needs to happen to update the rendered chart will run automatically.

Currently this only affects adding/removing/reordering dimensions. Normally the chart must be re-rendered and axes updated:

```javascript
parcoords.dimensions([3,1,2])
  .render()
  .updateAxes()
```

In interactive mode, just specify the new dimensions array.

```javascript
parcoords.dimensions([3,1,2])
```

<a name="parcoords_clear" href="#parcoords_clear">#</a> parcoords.<b>clear</b>(*layer*)

Clear the *layer*, which could be *"foreground"*, *"shadows"*, *"marks"*, *"extents"* or *"highlight"*.

<a name="parcoords_canvas" href="#parcoords_canvas">#</a> parcoords.<b>canvas</b>

An object containing the canvas elements.

<a name="parcoords_ctx" href="#parcoords_ctx">#</a> parcoords.<b>ctx</b>

An object containing the [canvas 2d rendering contexts](https://developer.mozilla.org/en-US/docs/DOM/CanvasRenderingContext2D). Use this to modify canvas rendering styles, except for the foreground stroke which is controlled by <a href="#parcoords_autoscale">parcoords.color()</a>.

<a name="parcoords_on" href="#parcoords_on">#</a> parcoords.<b>on</b>(*event*, *listener*)

Trigger a *listener* when an event fires. The value of *this* in the listener refers to parcoords. The data passed into the listener depends on type of event:

* *"render"* returns no data
* *"resize"* returns an object containing the width, height and margin
* *"highlight"* returns the highlighted data
* *"brush"* returns the brushed data

When values in the <a href="#parcoords_state">state</a> are updated through methods, an event of the same name fires (except *height*, *width* and *margin* which fire *resize*). The data passed into the listener is an object containing the new value, *value*, and the old value, *previous*.

Custom values must be passed into the original chart config to register events.

* *"dimensions"*
* *"data"*
* *"color"*
* *"composite"*
* *"alpha"*

### Axes

The following methods are available from [d3.svg.axis](https://github.com/mbostock/d3/wiki/SVG-Axes): ticks, orient, tickValues, tickSubdivide, tickSize, tickPadding, tickFormat.

## Credits

This library created with examples, suggestions and encouragement from Mike Bostock, Jason Davies, Mary Becica, Stephen Boak, Ziggy Jonsson, Ger Hobbelt, Johan Sundström, Raffael Marty, Hugo Lopez, Bob Monteverde, Vadim Ogievetsky, Chris Rich, Patrick Martin, and Alfred Inselberg.

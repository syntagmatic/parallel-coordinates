var vows = require('vows'),
    assert = require('assert'),
    events = require('events'),
    load = require('./load'),
    suite = vows.describe('brushMode'),
    testData = [];

testData = [
  { x1: 1, x2: -1, x3: 1 },
  { x1: 2, x2: -2, x3: 4 },
  { x1: 3, x2: -3, x3: 9 },
  { x1: 4, x2: -4, x3: 16 },
  { x1: 5, x2: -5, x3: 25 },
];

function d3Parcoords() {
  var promise = new events.EventEmitter();
  load(function(d3) {
    var pc = d3.parcoords();

    d3.select('body').append('div').attr('id', 'test');
    pc('div#test');
    promise.emit('success', pc);
  });
  return promise;
}
function d3ParcoordsWith(brushMode) {
  var promise = new events.EventEmitter();

  load(function(d3) {
    var pc = d3.parcoords();

    d3.select('body').append('div').attr('id', 'test');
    pc('div#test')
      .data(testData)
      .render()
      .brushMode(brushMode);

    promise.emit('success', d3, pc);
  });
  return promise;
}

suite.addBatch({
  'd3.parcoords': {
    'has by default': {
       topic: d3Parcoords(),
       'the brush mode "None"': function(pc) {
         assert.strictEqual(pc.brushMode(), "None");
         // Make sure that no brush related methods are exposed when the brush
         // mode is set to "None"
         assert(!pc.hasOwnProperty('brushPredicate'));
         assert(!pc.hasOwnProperty('brushExtents'));
         assert(!pc.hasOwnProperty('brushReset'));
         assert.strictEqual(pc.on('axesreorder.strums'), undefined);
       }
    },
    'can be configured to': {
      topic: d3Parcoords(),
      'have brush mode 1D-axes': function(pc) {
        // brushExtents is a function that should be install by 1D-axes, as this
        // only makes sense when 1D brushing is active.
        assert(!pc.hasOwnProperty("brushExtents"));
        pc.brushMode("1D-axes");
        assert.strictEqual(pc.brushMode(), "1D-axes");
        // Make sure that the expected functions are installed.
        assert(pc.hasOwnProperty('brushPredicate'));
        assert.strictEqual(typeof(pc.brushPredicate), 'function');
        assert(pc.hasOwnProperty('brushExtents'));
        assert.strictEqual(typeof(pc.brushExtents), 'function');
        assert(pc.hasOwnProperty('brushReset'));
        assert.strictEqual(typeof(pc.brushReset), 'function');
      },
      'have brush mode 2D-strums': function(pc) {
        pc.brushMode("2D-strums");
        assert.strictEqual(pc.brushMode(), "2D-strums");
        // Make sure that the expected functions are installed.
        assert(pc.hasOwnProperty('brushPredicate'));
        assert.strictEqual(typeof(pc.brushPredicate), 'function');
        assert(pc.hasOwnProperty('brushReset'));
        // brushExtents is specific for the 1D brush so net expecting it here
        assert(!pc.hasOwnProperty('brushExtents'), 'but has unexpected brushExtends property');
      }
    },
  },
  'When d3.parcoords has brushMode': {
    '1D-axes': {
      topic: d3ParcoordsWith('1D-axes'),
      'there should be three g.brush elements': function(ev, d3, pc) {
        var svg = d3.select('div#test').select('svg'),
            dimensions = svg.select('g').selectAll('.brush');

        assert.strictEqual(dimensions.size(), 3);
      },
      'there should be no g.brush elements when the brush mode is set back to none': function(ev, d3, pc) {
        var svg = d3.select('div#test').select('svg'),
            dimensions;

        pc.brushMode('None');
        dimensions = svg.select('g').selectAll('.brush');
        assert.strictEqual(dimensions.size(), 0);
      }
    },
    '2D-strums': {
      topic: d3ParcoordsWith('2D-strums'),
      'there should be a rect#strum-events element': function(ev, d3, pc) {
        var div = d3.select('div#test'),
            rect = div.selectAll('rect');

        assert.strictEqual(rect.size(), 1);
        assert.strictEqual(rect.attr("id"), "strum-events");
      },
      'there should be a listener set on the axesreorder signal': function(ev, d3, pc) {
         assert.notStrictEqual(pc.on('axesreorder.strums'), undefined);
         assert.strictEqual(typeof(pc.on('axesreorder.strums')), 'function');
      },
      'there should be a g#strums element': function(ev, d3, pc) {
        var svg = d3.select('div#test').select('svg'),
            g = svg.selectAll('g#strums');

        assert.strictEqual(g.size(), 1);
      },
      'and it is set back to none': {
        topic: d3ParcoordsWith('2D-strums'),
        'there should be no rect#strum-events element': function(ev, d3, pc) {
          var div, canvas;

          pc.brushMode('None');

          div = d3.select('div#test');
          rect = div.selectAll('rect#strum-events');
          assert.strictEqual(rect.size(), 0);
        },
        'there shoulde be no listener set on the axesreorder.strum event': function(ev, d3, pc) {
          assert.strictEqual(pc.on('axesreorder.strums'), undefined);
        },
        'there should be no g#strums element': function(ev, d3, pc) {
          var svg = d3.select('div#test').select('svg'),
              g = svg.selectAll('g#strums');

          assert.strictEqual(g.size(), 0);
        }
      }
    }
  }
});

suite.export(module);

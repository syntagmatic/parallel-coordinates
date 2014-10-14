var vows = require('vows'),
    assert = require('assert'),
    events = require('events'),
    load = require('./load'),
    suite = vows.describe('brushMode');

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

suite.addBatch({
  'd3.parcoords': {
    'has by default': {
       topic: d3Parcoords(),
       'the brush mode "None"': function(pc) {
         assert.strictEqual(pc.brushMode(), "None");
         // Make sure that no brush related methods are exposed when the brush
         // mode is set to "None"
         assert.strictEqual(pc.brushExtents, undefined);
         assert.strictEqual(pc.brushReset, undefined);
       }
    },
    'can be configured to': {
      topic: d3Parcoords(),
      'have brush mode 1D-axes': function(pc) {
        // brushExtents is a function that should be install by 1D-axes, as this
        // only makes sense when 1D brushing is active.
        assert.strictEqual(pc.brushExtents, undefined);
        pc.brushMode("1D-axes");
        assert.strictEqual(pc.brushMode(), "1D-axes");
        // Okay, let's see if brushExtents is there now, and if it is a function.
        assert.notStrictEqual(pc.brushExtents, undefined);
        assert.strictEqual(typeof(pc.brushExtents), "Function");
      },
      'have brush mode 2D-strums': function(pc) {
        pc.brushMode("2D-strums");
        assert.strictEqual(pc.brushMode(), "2D-strums");
      }
    },
  }
});

suite.export(module);

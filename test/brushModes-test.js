var vows = require('vows'),
    assert = require('assert'),
    events = require('events'),
    load = require('./load'),
    suite = vows.describe('brushModes');

function d3Parcoords() {
  var promise = new(events.EventEmitter);
  load(function(d3) {
    promise.emit('success', d3.parcoords());
  });
  return promise;
}

suite.addBatch({
  'd3.parcoords': {
    'has by default': {
       topic: d3Parcoords(),
       'three brush modes': function(pc) {
          assert.strictEqual(pc.brushModes().length, 3);
       }
    },
  }
});

suite.export(module);

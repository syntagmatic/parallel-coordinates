var smash = require("smash"),
    canvas = require("canvas"),
    jsdom = require("jsdom");

module.exports = (function() {
  var files = ['node_modules/d3/d3.min.js', 'd3.parcoords.js'],
      expression = 'd3',
      sandbox = { console: console };

  function document(html) {
    var document = jsdom.jsdom(html);

    sandbox = {
      console: console,
      document: document,
      window: document.parentWindow,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      Date: Date // so we can override Date.now in tests, and use deepEqual
    };

    return topic;
  };

  function topic(cb, html) {
    var html = arguments.length >= 2
      ? '<html><head></head><body></body></html>'
      : html;

    // d3 expects a global 'document' variable.
    document(html);
    smash.load(files, expression, sandbox, function(error, d3) {
      if (error) console.trace(error.stack);
      else cb(d3);
    });
  };

  return topic;
})();

process.on('uncaughtException', function(e) {
  console.trace(e.stack);
});


/* eslint-env worker */
/* eslint no-var: off, strict: off */

// "Polyfills" in order for all the code to run
self.global = self;
self.Buffer = {
  isBuffer: function() {
    return false;
  }
};
// eslint-disable-next-line
fs = module$1 = module = path = os = crypto = {};
self.process = { argv: [], env: {} };
self.assert = { ok: function() {}, strictEqual: function() {} };
self.require = function require(path) {
  return self[path.replace(/.+-/, "")];
};

importScripts("lib/index.js");
var prettier = index; // eslint-disable-line

var parsersLoaded = {};

self.onmessage = function(message) {
  lazyLoadParser(message.data.options.parser);

  var formatted, doc;
  try {
    formatted = prettier.format(message.data.text, message.data.options);
  } catch (e) {
    formatted = e.toString();
  }

  if (message.data.doc) {
    try {
      doc = prettier.__debug.formatDoc(
        prettier.__debug.printToDoc(message.data.text, message.data.options),
        {}
      );
    } catch (e) {
      doc = e.toString();
    }
  }

  self.postMessage({ formatted: formatted, doc: doc });
};

function lazyLoadParser(parser) {
  if (!parsersLoaded[parser]) {
    importScripts("lib/parser-" + parser + ".js");
    parsersLoaded[parser] = true;
  }
}

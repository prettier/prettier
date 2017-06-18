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
  const options = message.data.options || {
    parser: "babylon"
  };

  delete options.ast;
  delete options.doc;

  lazyLoadParser(options.parser);

  var formatted, doc, ast;
  try {
    formatted = prettier.format(message.data.text, options);
  } catch (e) {
    formatted = e.toString();
  }

  if (message.data.ast) {
    try {
      ast = JSON.stringify(
        prettier.__debug.parse(message.data.text, options),
        null,
        2
      );
    } catch (e) {
      ast = e.toString();
    }
  }

  if (message.data.doc) {
    lazyLoadParser("babylon");
    try {
      doc = prettier.__debug.formatDoc(
        prettier.__debug.printToDoc(message.data.text, options),
        { parser: "babylon" }
      );
    } catch (e) {
      doc = e.toString();
    }
  }

  self.postMessage({ formatted: formatted, doc: doc, ast: ast });
};

function lazyLoadParser(parser) {
  if (!parsersLoaded[parser]) {
    importScripts("lib/parser-" + parser + ".js");
    parsersLoaded[parser] = true;
  }
}

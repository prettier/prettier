/* eslint-env worker */
/* eslint no-var: off, strict: off */

// "Polyfills" in order for all the code to run
self.global = self;
self.util = {};
self.path = {};
self.Buffer = {
  isBuffer: function() {
    return false;
  }
};
// eslint-disable-next-line
fs = module$1 = module = path = os = crypto = {};
// eslint-disable-next-line no-undef
os.homedir = function() {
  return "/home/prettier";
};
self.process = { argv: [], env: { PRETTIER_DEBUG: true }, version: "v8.5.0" };
self.assert = { ok: function() {}, strictEqual: function() {} };
self.require = function require(path) {
  if (path === "stream") {
    return { PassThrough() {} };
  }
  if (path === "./third-party") {
    return {};
  }
  return self[path.replace(/.+-/, "")];
};

importScripts("lib/index.js");
var prettier = index; // eslint-disable-line

var parsersLoaded = {};

self.onmessage = function(message) {
  var options = message.data.options || {};
  options.parser = options.parser || "babylon";

  delete options.ast;
  delete options.doc;
  delete options.output2;

  var formatted = formatCode(message.data.text, options);
  var doc;
  var ast;
  var formatted2;

  if (message.data.ast) {
    var actualAst;
    var errored = false;
    try {
      actualAst = prettier.__debug.parse(message.data.text, options);
      ast = JSON.stringify(actualAst);
    } catch (e) {
      errored = true;
      ast = String(e);
    }
    if (!errored) {
      try {
        ast = formatCode(ast, { parser: "json" });
      } catch (e) {
        ast = JSON.stringify(actualAst, null, 2);
      }
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
      doc = String(e);
    }
  }

  if (message.data.formatted2) {
    formatted2 = formatCode(formatted, options);
  }

  self.postMessage({
    formatted: formatted,
    doc: doc,
    ast: ast,
    formatted2: formatted2,
    version: prettier.version
  });
};

function formatCode(text, options) {
  lazyLoadParser(options.parser);
  try {
    return prettier.format(text, options);
  } catch (e) {
    // Multiparser may throw if we haven't loaded the right parser
    // Load it lazily and retry!
    if (e.parser && !lazyLoadParser(e.parser)) {
      return formatCode(text, options);
    }
    return String(e);
  }
}

function lazyLoadParser(parser) {
  var actualParser =
    parser === "json"
      ? "babylon"
      : parser === "css" || parser === "less" || parser === "scss"
        ? "postcss"
        : parser;
  var script = "parser-" + actualParser + ".js";

  if (parsersLoaded[actualParser]) {
    return true;
  }

  importScripts("lib/" + script);
  parsersLoaded[actualParser] = true;
  return false;
}

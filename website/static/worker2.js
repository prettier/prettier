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
self.constants = {};
// eslint-disable-next-line
module$1 = module = path = os = crypto = {};
self.fs = { readFile: function() {} };
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

  if (~path.indexOf("parser-")) {
    var parser = path.replace(/.+-/, "");
    if (!parsersLoaded[parser]) {
      importScripts("lib/parser-" + parser + ".js");
      parsersLoaded[parser] = true;
    }
    return self[parser];
  }

  return self[path];
};

var prettier;
importScripts("lib/index.js");
if (typeof prettier === "undefined") {
  prettier = module.exports; // eslint-disable-line
}
if (typeof prettier === "undefined") {
  prettier = index; // eslint-disable-line
}

var parsersLoaded = {};

self.onmessage = function(event) {
  var uid = event.data.uid;
  var message = event.data.message;
  switch (message.type) {
    case "meta":
      self.postMessage({
        uid: uid,
        message: {
          type: "meta",
          supportInfo: prettier.getSupportInfo("1.9.0"),
          version: prettier.version
        }
      });
      break;

    case "format":
      var options = message.options || {};

      delete options.ast;
      delete options.doc;
      delete options.output2;

      self.postMessage({
        uid: uid,
        message: {
          formatted: formatCode(message.code, options)
        }
      });
      break;
  }
};

function formatCode(text, options) {
  try {
    return prettier.format(text, options);
  } catch (e) {
    return String(e);
  }
}

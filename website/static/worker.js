/* eslint-env worker */
/* eslint no-var: off, strict: off */

var parsersLoaded = {};

// "Polyfills" in order for all the code to run
self.global = self;
self.util = {};
self.path = {};
self.path.resolve = self.path.join = self.path.dirname = function() {
  return "";
};
self.path.parse = function() {
  return { root: "" };
};
self.Buffer = {
  isBuffer: function() {
    return false;
  }
};
self.constants = {};
module$1 = module = os = crypto = {};
self.fs = { readFile: function() {} };
os.homedir = function() {
  return "/home/prettier";
};
os.EOL = "\n";
self.process = {
  argv: [],
  env: { PRETTIER_DEBUG: true },
  version: "v8.5.0",
  binding: function() {
    return {};
  },
  cwd: function() {
    return "";
  }
};
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

self.onmessage = function(event) {
  var uid = event.data.uid;
  var message = event.data.message;
  switch (message.type) {
    case "meta":
      self.postMessage({
        uid: uid,
        message: {
          type: "meta",
          supportInfo: JSON.parse(JSON.stringify(prettier.getSupportInfo())),
          version: prettier.version
        }
      });
      break;

    case "format":
      var options = message.options || {};

      delete options.ast;
      delete options.doc;
      delete options.output2;

      const response = {
        formatted: formatCode(message.code, options),
        ast: null,
        doc: null
      };

      if (message.ast) {
        var actualAst;
        var errored = false;
        try {
          actualAst = prettier.__debug.parse(message.code, options).ast;
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
        response.ast = ast;
      }

      self.postMessage({
        uid: uid,
        message: response
      });
      break;
  }
};

function formatCode(text, options) {
  try {
    return prettier.format(text, options);
  } catch (e) {
    if (e.constructor && e.constructor.name === "SyntaxError") {
      // Likely something wrong with the user's code
      return String(e);
    }
    // Likely a bug in Prettier
    // Provide the whole stack for debugging
    return e.stack || String(e);
  }
}

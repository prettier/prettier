/* eslint-env worker */
/* eslint no-var: off, strict: off */

var parsersLoaded = {};

// "Polyfills" in order for all the code to run
/* eslint-disable no-undef, no-global-assign */
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
module$1 = module = os = crypto = buffer = {};
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
    return { findParentDir() {} };
  }

  if (~path.indexOf("parser-")) {
    var parser = path.replace(/^.*parser-/, "");
    if (!parsersLoaded[parser]) {
      importScripts("lib/parser-" + parser + ".js");
      parsersLoaded[parser] = true;
    }
    return self[
      parser.replace(/-/g, "_") // `json-stringify` is not a valid identifier
    ];
  }

  return self[path];
};
self.__dirname = "";
self.events = {
  EventEmitter: function() {}
};
/* eslint-enable */

var prettier;
importScripts("lib/index.js");
if (typeof prettier === "undefined") {
  prettier = module.exports; // eslint-disable-line
}
if (typeof prettier === "undefined") {
  prettier = index; // eslint-disable-line
}

self.onmessage = function(event) {
  self.postMessage({
    uid: event.data.uid,
    message: handleMessage(event.data.message)
  });
};

function handleMessage(message) {
  if (message.type === "meta") {
    return {
      type: "meta",
      supportInfo: JSON.parse(JSON.stringify(prettier.getSupportInfo())),
      version: prettier.version
    };
  }

  if (message.type === "format") {
    var options = message.options || {};

    delete options.ast;
    delete options.doc;
    delete options.output2;

    var response = {
      formatted: formatCode(message.code, options),
      debug: {
        ast: null,
        doc: null,
        reformatted: null
      }
    };

    if (message.debug.ast) {
      var ast;
      var errored = false;
      try {
        ast = JSON.stringify(prettier.__debug.parse(message.code, options).ast);
      } catch (e) {
        errored = true;
        ast = String(e);
      }

      if (!errored) {
        try {
          ast = formatCode(ast, { parser: "json" });
        } catch (e) {
          ast = JSON.stringify(ast, null, 2);
        }
      }
      response.debug.ast = ast;
    }

    if (message.debug.doc) {
      try {
        response.debug.doc = prettier.__debug.formatDoc(
          prettier.__debug.printToDoc(message.code, options),
          { parser: "babylon" }
        );
      } catch (e) {
        response.debug.doc = String(e);
      }
    }

    if (message.debug.reformat) {
      response.debug.reformatted = formatCode(response.formatted, options);
    }

    return response;
  }
}

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

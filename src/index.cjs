"use strict";

const prettierPromise = import("./index.js");

const functionNames = [
  "formatWithCursor",
  "format",
  "check",
  "resolveConfig",
  "resolveConfigFile",
  "clearConfigCache",
  "getFileInfo",
  "getSupportInfo",
];

const prettier = Object.create(null);
for (const name of functionNames) {
  prettier[name] = function (...args) {
    return prettierPromise.then((prettier) => prettier[name](...args));
  };
}

if (process.env.NODE_ENV === "production") {
  prettier.util = require("./common/util-shared.js");
  prettier.doc = require("./document/index.js");
} else {
  Object.defineProperties(prettier, {
    util: {
      get() {
        throw new Error(
          "prettier.util is not available in development CommonJS version"
        );
      },
    },
    doc: {
      get() {
        throw new Error(
          "prettier.doc is not available in development CommonJS version"
        );
      },
    },
  });
}
prettier.version = require("./main/version.evaluate.cjs");

module.exports = prettier;

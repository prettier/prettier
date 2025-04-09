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
  prettier[name] = async (...args) => {
    const prettier = await prettierPromise;
    return prettier[name](...args);
  };
}

const debugApiFunctionNames = [
  "parse",
  "formatAST",
  "formatDoc",
  "printToDoc",
  "printDocToString",
];

const debugApis = Object.create(null);
for (const name of debugApiFunctionNames) {
  debugApis[name] = async (...args) => {
    const prettier = await prettierPromise;
    return prettier.__debug[name](...args);
  };
}
prettier.__debug = debugApis;

if (process.env.NODE_ENV === "production") {
  prettier.util = require("./utils/public.js");
  prettier.doc = require("./document/public.js");
} else {
  Object.defineProperties(prettier, {
    util: {
      get() {
        try {
          return require("./utils/public.js");
        } catch {
          // No op
        }

        throw new Error(
          "prettier.util is not available in development CommonJS version",
        );
      },
    },
    doc: {
      get() {
        try {
          return require("./document/public.js");
        } catch {
          // No op
        }

        throw new Error(
          "prettier.doc is not available in development CommonJS version",
        );
      },
    },
  });
}
prettier.version = require("./main/version.evaluate.cjs");

module.exports = prettier;

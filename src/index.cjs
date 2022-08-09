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

prettier.util = require("./common/util-shared.js");
prettier.doc = require("./document/index.js");
prettier.version = require("../package.json").version;

module.exports = prettier;

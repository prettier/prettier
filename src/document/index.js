"use strict";

/**
 * @typedef {import("./doc-builders").Doc} Doc
 */

module.exports = {
  builders: require("./doc-builders.js"),
  printer: require("./doc-printer.js"),
  utils: require("./doc-utils.js"),
  debug: require("./doc-debug.js"),
};

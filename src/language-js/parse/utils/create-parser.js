"use strict";

const { hasPragma } = require("../../pragma.js");
const { locStart, locEnd } = require("../../loc.js");
const { isSourceElement } = require("../../range-utils.js");

function createParser(options) {
  options = typeof options === "function" ? { parse: options } : options;

  return {
    astFormat: "estree",
    hasPragma,
    locStart,
    locEnd,
    rangeUtils: {
      isSourceElement,
    },
    ...options,
  };
}

module.exports = createParser;

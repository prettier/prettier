"use strict";

const { hasPragma } = require("../../pragma.js");
const { locStart, locEnd } = require("../../loc.js");

function createParser(options) {
  options = typeof options === "function" ? { parse: options } : options;

  return {
    astFormat: "estree",
    hasPragma,
    locStart,
    locEnd,
    ...options,
  };
}

module.exports = createParser;

"use strict";

const { hasPragma } = require("../pragma");
const { locStart, locEnd } = require("../loc");

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

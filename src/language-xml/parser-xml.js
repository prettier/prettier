"use strict";

const { parse: xmlToolsParse } = require("@xml-tools/parser");

const parse = (text) => {
  const { lexErrors, parseErrors, cst } = xmlToolsParse(text);

  if (lexErrors.length > 0 || parseErrors.length > 0) {
    throw new Error("Error parsing XML");
  }

  return cst;
};

const locStart = (node) => {
  if (node.location) {
    return node.location.startOffset;
  }
  return node.startOffset;
};

const locEnd = (node) => {
  if (node.location) {
    return node.location.endOffset;
  }
  return node.endOffset;
};

const parser = {
  parse,
  astFormat: "xml",
  locStart,
  locEnd,
};

module.exports = parser;

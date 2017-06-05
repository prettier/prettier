"use strict";

function parse(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const parser = require("graphql/language");
  const ast = parser.parse(text);
  return ast;
}

module.exports = parse;

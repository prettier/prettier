"use strict";
const engine = require('php-parser');

function parse(text, parsers, opts) {
  // initialize a new parser instance
  const parser = new engine({
    // some options :
    parser: {
      extractDoc: true
    },
    ast: {
      withPositions: true
    }
  });

  return parser.parseCode(text);
}

module.exports = parse;

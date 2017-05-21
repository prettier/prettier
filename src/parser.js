"use strict";

function parse(text, opts) {
  let parseFunction;

  if (opts.parser === "flow") {
    parseFunction = require("./parsers/flow-parser");
  } else if (opts.parser === "typescript") {
    parseFunction = require("./parsers/typescript-parser");
  } else {
    parseFunction = require("./parsers/babylon-parser");
  }

  try {
    return parseFunction(text);
  } catch (error) {
    const loc = error.loc;

    if (loc) {
      const codeFrame = require("babel-code-frame");
      error.codeFrame = codeFrame(text, loc.line, loc.column + 1, {
        highlightCode: true
      });
      error.message += "\n" + error.codeFrame;
    }

    throw error;
  }
}

module.exports = { parse };

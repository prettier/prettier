"use strict";

function parse(text, opts) {
  let parseFunction;

  if (opts.parser === "flow") {
    parseFunction = require("./parser-flow");
  } else if (opts.parser === "typescript") {
    const r = require;
    parseFunction = r("./parser-typescript");
  } else if (opts.parser === "postcss") {
    const r = require;
    parseFunction = r("./parser-postcss");
  } else {
    parseFunction = require("./parser-babylon");
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
      throw error;
    }

    throw error.stack;
  }
}

module.exports = { parse };

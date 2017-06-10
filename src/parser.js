"use strict";

function getParseFunction(opts) {
  switch (opts.parser) {
    case "flow":
      return eval("require")("./parser-flow");
    case "graphql":
      return eval("require")("./parser-graphql");
    case "parse5":
      return eval("require")("./parser-parse5");
    case "postcss":
      return eval("require")("./parser-postcss");
    case "typescript":
      return eval("require")("./parser-typescript");
    default:
      return eval("require")("./parser-babylon");
  }
}

function parse(text, opts) {
  try {
    return getParseFunction(opts)(text);
  } catch (error) {
    const loc = error.loc;

    if (loc) {
      const codeFrame = require("babel-code-frame");
      error.codeFrame = codeFrame.codeFrameColumns(text, loc, {
        highlightCode: true
      });
      error.message += "\n" + error.codeFrame;
      throw error;
    }

    throw error.stack;
  }
}

module.exports = { parse };

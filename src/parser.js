"use strict";

const path = require("path");

const parsers = {
  get flow() {
    return eval("require")("./parser-flow");
  },
  get graphql() {
    return eval("require")("./parser-graphql");
  },
  get parse5() {
    return eval("require")("./parser-parse5");
  },
  get babylon() {
    return eval("require")("./parser-babylon");
  },
  get typescript() {
    return eval("require")("./parser-typescript");
  },
  get postcss() {
    return eval("require")("./parser-postcss");
  },
  get json() {
    return eval("require")("./parser-json");
  }
};

function resolveParseFunction(opts) {
  if (typeof opts.parser === "function") {
    return opts.parser;
  }
  if (typeof opts.parser === "string") {
    if (parsers.hasOwnProperty(opts.parser)) {
      return parsers[opts.parser];
    }
    try {
      return eval("require")(path.resolve(process.cwd(), opts.parser));
    } catch (err) {
      throw new Error(`Couldn't resolve parser "${opts.parser}"`);
    }
  }
  return parsers.babylon;
}

function parse(text, opts) {
  const parseFunction = resolveParseFunction(opts);

  try {
    return parseFunction(text, parsers, opts);
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

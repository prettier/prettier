"use strict";

const path = require("path");
const ConfigError = require("./errors").ConfigError;

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
  get css() {
    return eval("require")("./parser-postcss");
  },
  get less() {
    return eval("require")("./parser-postcss");
  },
  get scss() {
    return eval("require")("./parser-postcss");
  },
  get json() {
    return eval("require")("./parser-babylon");
  },
  get markdown() {
    return eval("require")("./parser-markdown");
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
      /* istanbul ignore next */
      throw new ConfigError(`Couldn't resolve parser "${opts.parser}"`);
    }
  }
  /* istanbul ignore next */
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

    /* istanbul ignore next */
    throw error.stack;
  }
}

module.exports = { parse };

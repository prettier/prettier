"use strict";

const path = require("path");

function createError(message, line, column) {
  // Construct an error similar to the ones thrown by Babylon.
  const error = new SyntaxError(message + " (" + line + ":" + column + ")");
  error.loc = { line, column };
  return error;
}

const parsers = {
  flow: () => eval("require")("./parser-flow"),
  graphql: () => eval("require")("./parser-graphql"),
  parse5: () => eval("require")("./parser-parse5"),
  babylon: () => eval("require")("./parser-babylon"),
  typescript: () => eval("require")("./parser-typescript"),
  postcss: () => eval("require")("./parser-postcss")
};

function resolveParseFunction(opts) {
  if (typeof opts.parser === "function") {
    return opts.parser;
  }
  if (typeof opts.parser === "string") {
    if (parsers[opts.parser]) {
      return parsers[opts.parser]();
    } else {
      const r = require;
      try {
        return r(path.resolve(process.cwd(), opts.parser));
      } catch (err) {
        throw new Error(`Couldn't resolve parser "${opts.parser}"`);
      }
    }
  }
  return parsers.babylon();
}

function parse(text, opts) {
  const parseFunction = resolveParseFunction(opts);

  try {
    return parseFunction(text);
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

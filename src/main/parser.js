"use strict";

const path = require("path");
const ConfigError = require("../common/errors").ConfigError;
const loadPlugins = require("../common/load-plugins");

const parsers = loadPlugins().reduce(
  (parsers, plugin) => Object.assign({}, parsers, plugin.parsers),
  {}
);

function resolveParseFunction(opts) {
  if (typeof opts.parser === "function") {
    return opts.parser;
  }
  if (typeof opts.parser === "string") {
    if (parsers.hasOwnProperty(opts.parser)) {
      return parsers[opts.parser].parse;
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
      const codeFrame = require("@babel/code-frame");
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

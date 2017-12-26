"use strict";

const path = require("path");
const ConfigError = require("../common/errors").ConfigError;

function getParsers(plugins) {
  return plugins.reduce(
    (parsers, plugin) => Object.assign({}, parsers, plugin.parsers),
    {}
  );
}

function resolveParser(parsers, opts) {
  if (typeof opts.parser === "function") {
    // Custom parser API always works with JavaScript.
    return {
      parse: opts.parser,
      astFormat: "estree"
    };
  }

  if (typeof opts.parser === "string") {
    if (parsers.hasOwnProperty(opts.parser)) {
      return parsers[opts.parser];
    }
    try {
      return {
        parse: eval("require")(path.resolve(process.cwd(), opts.parser)),
        astFormat: "estree"
      };
    } catch (err) {
      /* istanbul ignore next */
      throw new ConfigError(`Couldn't resolve parser "${opts.parser}"`);
    }
  }
  /* istanbul ignore next */
  return parsers.babylon;
}

function parse(text, opts, plugins) {
  const parsers = getParsers(plugins, opts);

  // Copy the "parse" function from parser to a new object whose values are
  // functions. Use defineProperty()/getOwnPropertyDescriptor() such that we
  // don't invoke the parser.parse getters.
  const parsersForCustomParserApi = Object.keys(parsers).reduce(
    (object, parserName) =>
      Object.defineProperty(
        object,
        parserName,
        Object.getOwnPropertyDescriptor(parsers[parserName], "parse")
      ),
    {}
  );

  const parser = resolveParser(parsers, opts);

  try {
    return parser.parse(text, parsersForCustomParserApi, opts);
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

module.exports = { getParsers, parse, resolveParser };

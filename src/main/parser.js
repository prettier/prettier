"use strict";

const path = require("path");
const ConfigError = require("../common/errors").ConfigError;

const parsers = {
  get flow() {
    return eval("require")("../language-js/parser-flow");
  },
  get graphql() {
    return eval("require")("../language-graphql/parser-graphql");
  },
  get parse5() {
    return eval("require")("../language-html/parser-parse5");
  },
  get babylon() {
    return eval("require")("../language-js/parser-babylon");
  },
  get typescript() {
    return eval("require")("../language-js/parser-typescript");
  },
  get css() {
    return eval("require")("../language-css/parser-postcss");
  },
  get less() {
    return eval("require")("../language-css/parser-postcss");
  },
  get scss() {
    return eval("require")("../language-css/parser-postcss");
  },
  get json() {
    return eval("require")("../language-js/parser-babylon");
  },
  get markdown() {
    return eval("require")("../language-markdown/parser-markdown");
  },
  get vue() {
    return eval("require")("../language-vue/parser-vue");
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

"use strict";

const createError = require("../common/parser-create-error");
const postprocess = require("./postprocess");

function parse(text, parsers, options) {
  const glimmer = require("@glimmer/syntax/dist/commonjs/es2017/lib/parser/tokenizer-event-handlers")
    .preprocess;
  const traverse = require("@glimmer/syntax/dist/commonjs/es2017/lib/traversal/traverse")
    .default;
  let ast;
  try {
    ast = glimmer(text, { mode: "codemod" });
    /* istanbul ignore next */
  } catch (error) {
    const matches = error.message.match(/on line (\d+)/);
    if (matches) {
      throw createError(error.message, {
        start: { line: Number(matches[1]), column: 0 },
      });
    } else {
      throw error;
    }
  }

  return postprocess(ast, options, traverse);
}

module.exports = {
  parsers: {
    glimmer: {
      parse,
      astFormat: "glimmer",
      // TODO: `locStart` and `locEnd` should return a number offset
      // https://prettier.io/docs/en/plugins.html#parsers
      // but we need access to the original text to use
      // `loc.start` and `loc.end` objects to calculate the offset
      locStart(node) {
        return node.loc && node.loc.start;
      },
      locEnd(node) {
        return node.loc && node.loc.end;
      },
    },
  },
};

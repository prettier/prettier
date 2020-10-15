"use strict";

const createError = require("../common/parser-create-error");

/* from the following template: `non-escaped mustache \\{{helper}}`
 * glimmer parser will produce an AST missing a backslash
 * so here we add it back
 * */
function addBackslash(/* options*/) {
  return {
    name: "addBackslash",
    visitor: {
      TextNode(node) {
        node.chars = node.chars.replace(/\\/, "\\\\");
      },
    },
  };
}

function parse(text) {
  const { preprocess: glimmer } = require("@glimmer/syntax");
  let ast;
  try {
    ast = glimmer(text, { mode: "codemod", plugins: { ast: [addBackslash] } });
  } catch (error) {
    const location = getErrorLocation(error);

    if (location) {
      throw createError(error.message, location);
    }

    /* istanbul ignore next */
    throw error;
  }

  return ast;
}

function getErrorLocation(error) {
  const { location, hash } = error;
  if (location) {
    const { start, end } = location;
    if (typeof end.line !== "number") {
      return { start };
    }
    return location;
  }

  if (hash) {
    const {
      loc: { first_line, first_column, last_line, last_column },
    } = hash;
    return {
      start: { line: first_line, column: first_column },
      end: { line: last_line, column: last_column },
    };
  }
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
      /* istanbul ignore next */
      locStart(node) {
        return node.loc && node.loc.start;
      },
      /* istanbul ignore next */
      locEnd(node) {
        return node.loc && node.loc.end;
      },
    },
  },
};

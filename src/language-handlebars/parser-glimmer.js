"use strict";

const LinesAndColumns = require("lines-and-columns").default;
const createError = require("../common/parser-create-error");
const { locStart, locEnd } = require("./loc");

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

// Add `loc.{start,end}.offset`
function addOffset(text) {
  const lines = new LinesAndColumns(text);
  const calculateOffset = ({ line, column }) =>
    lines.indexForLocation({ line: line - 1, column });
  return (/* options*/) => ({
    name: "addOffset",
    visitor: {
      All(node) {
        const { start, end } = node.loc;
        start.offset = calculateOffset(start);
        end.offset = calculateOffset(end);
      },
    },
  });
}

function parse(text) {
  const { preprocess: glimmer } = require("@glimmer/syntax");
  let ast;
  try {
    ast = glimmer(text, {
      mode: "codemod",
      plugins: { ast: [addBackslash, addOffset(text)] },
    });
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
      loc: { last_line, last_column },
    } = hash;
    return { start: { line: last_line, column: last_column + 1 } };
  }
}

module.exports = {
  parsers: {
    glimmer: {
      parse,
      astFormat: "glimmer",
      locStart,
      locEnd,
    },
  },
};

"use strict";

const createError = require("../common/parser-create-error");
function removeEmptyNodes(node) {
  return (
    node.type !== "TextNode" ||
    (node.type === "TextNode" &&
      node.chars.replace(/^\s+/, "").replace(/\s+$/, "") !== "")
  );
}
function removeWhiteSpace() {
  return {
    visitor: {
      Program(node) {
        node.body = node.body.filter(removeEmptyNodes);
      },
      ElementNode(node) {
        node.children = node.children.filter(removeEmptyNodes);
      }
    }
  };
}

function parse(text) {
  try {
    const glimmer = require("@glimmer/syntax").preprocess;
    return glimmer(text, {
      plugins: {
        ast: [removeWhiteSpace]
      }
    });
    /* istanbul ignore next */
  } catch (error) {
    const matches = error.message.match(/on line (\d+)/);
    if (matches) {
      throw createError(error.message, {
        start: { line: Number(matches[1]), column: 0 }
      });
    } else {
      throw error;
    }
  }
}

module.exports = {
  parsers: {
    glimmer: {
      parse,
      astFormat: "glimmer",
      locStart(node) {
        return node.loc && node.loc.start;
      },
      locEnd(node) {
        return node.loc && node.loc.end;
      }
    }
  }
};

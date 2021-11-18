"use strict";

const mdx = require("../mdx.js");
const { mapAst, INLINE_NODE_WRAPPER_TYPES } = require("../utils.js");

function htmlToJsx() {
  return (ast) =>
    mapAst(ast, (node, _index, [parent]) => {
      if (
        node.type !== "html" ||
        // Keep HTML-style comments (legacy MDX)
        mdx.COMMENT_REGEX.test(node.value) ||
        INLINE_NODE_WRAPPER_TYPES.includes(parent.type)
      ) {
        return node;
      }
      return { ...node, type: "jsx" };
    });
}

module.exports = htmlToJsx;

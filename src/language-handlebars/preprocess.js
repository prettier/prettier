"use strict";

const transform = require("@glimmer/syntax").traverse;

const PREPROCESS_PIPELINE = [addBackslash];

/* VISITORS */

/*
 */
function addBackslash(/* options*/) {
  return {
    TextNode(node) {
      /* from the following template: `non-escaped mustache \\{{helper}}`
       * glimmer parser will produce an AST missing a backslash
       * so here we add it back
       * */
      if (node.chars.includes("\\")) {
        node.chars = node.chars.replace(/\\/, "\\\\");
      }
    },
  };
}

function preprocess(ast, options) {
  for (const fn of PREPROCESS_PIPELINE) {
    const visitor = fn(options);
    transform(ast, visitor);
  }

  return ast;
}

module.exports = preprocess;

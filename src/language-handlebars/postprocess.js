"use strict";

/** @type {Array<(any) => any>} */
const PIPELINE = [addBackslash];

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

function postprocess(ast, options, traverse) {
  for (const fn of PIPELINE) {
    const visitor = fn(options);
    traverse(ast, visitor);
  }

  return ast;
}

module.exports = postprocess;

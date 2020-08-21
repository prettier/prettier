"use strict";

/** @type {Array<(any) => any>} */
const PIPELINE = [addBackslash];

/* VISITORS */

/* from the following template: `non-escaped mustache \\{{helper}}`
 * glimmer parser will produce an AST missing a backslash
 * so here we add it back
 * */
function addBackslash(/* options*/) {
  return {
    visitor: {
      TextNode(node) {
        if (node.chars.includes("\\")) {
          node.chars = node.chars.replace(/\\/, "\\\\");
        }
      },
    }
  };
}

module.exports = [addBackslash];

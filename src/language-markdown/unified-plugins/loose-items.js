"use strict";

const visit = require("unist-util-visit");
const { getLast } = require("../../common/util.js");

function looseItems() {
  function transformer(tree) {
    visit(tree, "listItem", (node, index, parent) => {
      // @ts-expect-error
      node.loose = node.spread;
      const lastChild = getLast(
        // @ts-expect-error
        node.children
      );
      if (lastChild) {
        const lastChildEndLine = lastChild.position.end.line;
        const nextListItemFirstChild = parent.children[index + 1];
        if (nextListItemFirstChild) {
          const nextListItemFirstChildStartLine =
            nextListItemFirstChild.position.start.line;
          if (nextListItemFirstChildStartLine - lastChildEndLine > 1) {
            // @ts-expect-error
            node.loose = true;
          }
        }
      }
      // @ts-expect-error
      if (node.loose) {
        // @ts-expect-error
        parent.loose = true;
      }
    });
  }
  return transformer;
}

module.exports = looseItems;

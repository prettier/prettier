"use strict";

const { getLast } = require("../common/util");

// fix unexpected locEnd caused by --no-semi style
function postprocess(ast, options) {
  visitNode(ast, node => {
    switch (node.type) {
      case "VariableDeclaration": {
        const lastDeclaration = getLast(node.declarations);
        if (lastDeclaration && lastDeclaration.init) {
          overrideLocEnd(node, lastDeclaration);
        }
        break;
      }
    }
  });

  return ast;

  /**
   * - `toOverrideNode` must be the last thing in `toBeOverriddenNode`
   * - do nothing if there's a semicolon on `toOverrideNode.end` (no need to fix)
   */
  function overrideLocEnd(toBeOverriddenNode, toOverrideNode) {
    if (options.originalText[locEnd(toOverrideNode)] === ";") {
      return;
    }
    if (options.parser === "flow") {
      toBeOverriddenNode.range = [
        toBeOverriddenNode.range[0],
        toOverrideNode.range[1]
      ];
    } else {
      toBeOverriddenNode.end = toOverrideNode.end;
    }
    toBeOverriddenNode.loc = Object.assign({}, toBeOverriddenNode.loc, {
      end: toBeOverriddenNode.loc.end
    });
  }

  function locEnd(node) {
    return options.parser === "flow" ? node.range[1] : node.end;
  }
}

function visitNode(node, fn) {
  if (!node || typeof node !== "object") {
    return;
  }

  if (Array.isArray(node)) {
    for (const subNode of node) {
      visitNode(subNode, fn);
    }
    return;
  }

  if (typeof node.type !== "string") {
    return;
  }

  for (const key of Object.keys(node)) {
    visitNode(node[key], fn);
  }

  fn(node);
}

module.exports = postprocess;

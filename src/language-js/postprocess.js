"use strict";

const { getLast } = require("../common/util");

function postprocess(ast, options) {
  visitNode(ast, node => {
    switch (node.type) {
      // Fix unexpected locEnd caused by --no-semi style
      case "VariableDeclaration": {
        const lastDeclaration = getLast(node.declarations);
        if (lastDeclaration && lastDeclaration.init) {
          overrideLocEnd(node, lastDeclaration);
        }
        break;
      }
      case "TSAsExpression": {
        convertTSAsExpression(node);
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

/* Convert TSAsExpression to BinaryExpression interface
 * https://github.com/estree/estree/blob/master/es5.md#binaryexpression
 */
function convertTSAsExpression(node) {
  node.left = node.expression;
  node.operator = "as";
  node.right = node.typeAnnotation;
  delete node.expression;
  delete node.typeAnnotation;
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

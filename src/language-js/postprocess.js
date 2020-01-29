"use strict";

const { getLast } = require("../common/util");
const { composeLoc, locEnd } = require("./loc");

function postprocess(ast, options) {
  visitNode(ast, node => {
    switch (node.type) {
      case "LogicalExpression": {
        // We remove unneeded parens around same-operator LogicalExpressions
        if (isUnbalancedLogicalTree(node)) {
          return rebalanceLogicalTree(node);
        }
        break;
      }
      // fix unexpected locEnd caused by --no-semi style
      case "VariableDeclaration": {
        const lastDeclaration = getLast(node.declarations);
        if (lastDeclaration && lastDeclaration.init) {
          overrideLocEnd(node, lastDeclaration);
        }
        break;
      }
      // remove redundant TypeScript nodes
      case "TSParenthesizedType": {
        return node.typeAnnotation;
      }
      case "TSUnionType":
      case "TSIntersectionType":
        if (node.types.length === 1) {
          // override loc, so that comments are attached properly
          return { ...node.types[0], loc: node.loc, range: node.range };
        }
        break;
      case "TSTypeParameter":
        // babel-ts
        if (typeof node.name === "string") {
          node.name = {
            type: "Identifier",
            name: node.name,
            ...composeLoc(node, node.name.length)
          };
        }
        break;
      case "SequenceExpression":
        // Babel (unlike other parsers) includes spaces and comments in the range. Let's unify this.
        if (node.end && node.end > getLast(node.expressions).end) {
          node.end = getLast(node.expressions).end;
        }
        break;
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
    if (Array.isArray(toBeOverriddenNode.range)) {
      toBeOverriddenNode.range = [
        toBeOverriddenNode.range[0],
        toOverrideNode.range[1]
      ];
    } else {
      toBeOverriddenNode.end = toOverrideNode.end;
    }
    toBeOverriddenNode.loc = {
      ...toBeOverriddenNode.loc,
      end: toBeOverriddenNode.loc.end
    };
  }
}

function visitNode(node, fn, parent, property) {
  if (!node || typeof node !== "object") {
    return;
  }

  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      visitNode(node[i], fn, node, i);
    }
    return;
  }

  if (typeof node.type !== "string") {
    return;
  }

  for (const key of Object.keys(node)) {
    visitNode(node[key], fn, node, key);
  }

  const replacement = fn(node);

  if (replacement) {
    parent[property] = replacement;
  }
}

function isUnbalancedLogicalTree(node) {
  return (
    node.type === "LogicalExpression" &&
    node.right.type === "LogicalExpression" &&
    node.operator === node.right.operator
  );
}

function rebalanceLogicalTree(node) {
  if (!isUnbalancedLogicalTree(node)) {
    return node;
  }

  return rebalanceLogicalTree({
    type: "LogicalExpression",
    operator: node.operator,
    left: rebalanceLogicalTree({
      type: "LogicalExpression",
      operator: node.operator,
      left: node.left,
      right: node.right.left,
      ...composeLoc(node.left, node.right.left)
    }),
    right: node.right.right,
    ...composeLoc(node)
  });
}

module.exports = postprocess;

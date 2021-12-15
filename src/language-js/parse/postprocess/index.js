"use strict";

const { getLast } = require("../../../common/util.js");
const { locStart, locEnd } = require("../../loc.js");
const { isTypeCastComment } = require("../../comments.js");
const visitNode = require("./visitNode.js");
const { throwErrorForInvalidNodes } = require("./typescript.js");

function postprocess(ast, options) {
  if (
    options.parser === "typescript" &&
    // decorators or abstract properties
    /@|abstract/.test(options.originalText)
  ) {
    throwErrorForInvalidNodes(ast, options);
  }

  // Keep Babel's non-standard ParenthesizedExpression nodes only if they have Closure-style type cast comments.
  if (
    options.parser !== "typescript" &&
    options.parser !== "flow" &&
    options.parser !== "espree" &&
    options.parser !== "meriyah"
  ) {
    const startOffsetsOfTypeCastedNodes = new Set();

    // Comments might be attached not directly to ParenthesizedExpression but to its ancestor.
    // E.g.: /** @type {Foo} */ (foo).bar();
    // Let's use the fact that those ancestors and ParenthesizedExpression have the same start offset.

    ast = visitNode(ast, (node) => {
      if (
        node.leadingComments &&
        node.leadingComments.some(isTypeCastComment)
      ) {
        startOffsetsOfTypeCastedNodes.add(locStart(node));
      }
    });

    ast = visitNode(ast, (node) => {
      if (node.type === "ParenthesizedExpression") {
        const { expression } = node;

        // Align range with `flow`
        if (expression.type === "TypeCastExpression") {
          expression.range = node.range;
          return expression;
        }

        const start = locStart(node);
        if (!startOffsetsOfTypeCastedNodes.has(start)) {
          expression.extra = { ...expression.extra, parenthesized: true };
          return expression;
        }
      }
    });
  }

  ast = visitNode(ast, (node) => {
    switch (node.type) {
      // Espree
      case "ChainExpression": {
        return transformChainExpression(node.expression);
      }
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
        node.typeAnnotation.range = [locStart(node), locEnd(node)];
        return node.typeAnnotation;
      }
      case "TSTypeParameter":
        // babel-ts
        if (typeof node.name === "string") {
          const start = locStart(node);
          node.name = {
            type: "Identifier",
            name: node.name,
            range: [start, start + node.name.length],
          };
        }
        break;
      case "SequenceExpression": {
        // Babel (unlike other parsers) includes spaces and comments in the range. Let's unify this.
        const lastExpression = getLast(node.expressions);
        node.range = [
          locStart(node),
          Math.min(locEnd(lastExpression), locEnd(node)),
        ];
        break;
      }
      // For hack-style pipeline
      case "TopicReference":
        options.__isUsingHackPipeline = true;
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
    toBeOverriddenNode.range = [
      locStart(toBeOverriddenNode),
      locEnd(toOverrideNode),
    ];
  }
}

// This is a workaround to transform `ChainExpression` from `espree`, `meriyah`,
// and `typescript` into `babel` shape AST, we should do the opposite,
// since `ChainExpression` is the standard `estree` AST for `optional chaining`
// https://github.com/estree/estree/blob/master/es2020.md
function transformChainExpression(node) {
  switch (node.type) {
    case "CallExpression":
      node.type = "OptionalCallExpression";
      node.callee = transformChainExpression(node.callee);
      break;
    case "MemberExpression":
      node.type = "OptionalMemberExpression";
      node.object = transformChainExpression(node.object);
      break;
    // typescript
    case "TSNonNullExpression":
      node.expression = transformChainExpression(node.expression);
      break;
    // No default
  }
  return node;
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
      range: [locStart(node.left), locEnd(node.right.left)],
    }),
    right: node.right.right,
    range: [locStart(node), locEnd(node)],
  });
}

module.exports = postprocess;

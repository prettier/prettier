"use strict";

const { locStart, locEnd } = require("../../loc.js");
const isTsKeywordType = require("../../utils/is-ts-keyword-type.js");
const isTypeCastComment = require("../../utils/is-type-cast-comment.js");
const getLast = require("../../../utils/get-last.js");
const visitNode = require("./visit-node.js");
const { throwErrorForInvalidNodes } = require("./typescript.js");
const throwSyntaxError = require("./throw-syntax-error.js");

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
    options.parser !== "acorn" &&
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
        if (
          !(
            isTsKeywordType(node.typeAnnotation) ||
            node.typeAnnotation.type === "TSThisType"
          )
        ) {
          node.typeAnnotation.range = [locStart(node), locEnd(node)];
        }
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
      case "ObjectExpression":
        // #12963
        if (options.parser === "typescript") {
          const invalidProperty = node.properties.find(
            (property) =>
              property.type === "Property" &&
              property.value.type === "TSEmptyBodyFunctionExpression"
          );
          if (invalidProperty) {
            throwSyntaxError(invalidProperty.value, "Unexpected token.");
          }
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
      // TODO: Remove this when https://github.com/meriyah/meriyah/issues/200 get fixed
      case "ExportAllDeclaration": {
        const { exported } = node;
        if (
          options.parser === "meriyah" &&
          exported &&
          exported.type === "Identifier"
        ) {
          const raw = options.originalText.slice(
            locStart(exported),
            locEnd(exported)
          );
          if (raw.startsWith('"') || raw.startsWith("'")) {
            node.exported = {
              ...node.exported,
              type: "Literal",
              value: node.exported.name,
              raw,
            };
          }
        }
        break;
      }
      // TODO: Remove this when https://github.com/meriyah/meriyah/issues/231 get fixed
      case "PropertyDefinition":
        if (
          options.parser === "meriyah" &&
          node.static &&
          !node.computed &&
          !node.key
        ) {
          const name = "static";
          const start = locStart(node);
          Object.assign(node, {
            static: false,
            key: {
              type: "Identifier",
              name,
              range: [start, start + name.length],
            },
          });
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
    toBeOverriddenNode.range = [
      locStart(toBeOverriddenNode),
      locEnd(toOverrideNode),
    ];
  }
}

// This is a workaround to transform `ChainExpression` from `acorn`, `espree`,
// `meriyah`, and `typescript` into `babel` shape AST, we should do the opposite,
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

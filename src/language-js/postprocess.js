"use strict";

const {
  getLast,
  getNextNonSpaceNonCommentCharacter,
  getShebang,
} = require("../common/util");
const { composeLoc, locStart, locEnd } = require("./loc");
const { isTypeCastComment } = require("./comments");

function postprocess(ast, options) {
  if (options.parser === "typescript" || options.parser === "flow") {
    includeShebang(ast, options);
  }

  // Keep Babel's non-standard ParenthesizedExpression nodes only if they have Closure-style type cast comments.
  if (options.parser !== "typescript" && options.parser !== "flow") {
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
        const start = locStart(node);
        if (!startOffsetsOfTypeCastedNodes.has(start)) {
          const { expression } = node;
          if (!expression.extra) {
            expression.extra = {};
          }
          expression.extra.parenthesized = true;
          expression.extra.parenStart = start;
          return expression;
        }
      }
    });
  }

  ast = visitNode(ast, (node) => {
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
        node.typeAnnotation.range = composeLoc(node);
        return node.typeAnnotation;
      }
      case "TSUnionType":
      case "TSIntersectionType":
        if (node.types.length === 1) {
          const [firstType] = node.types;
          // override loc, so that comments are attached properly
          firstType.range = composeLoc(node);
          return firstType;
        }
        break;
      case "TSTypeParameter":
        // babel-ts
        if (typeof node.name === "string") {
          node.name = {
            type: "Identifier",
            name: node.name,
            range: composeLoc(node, node.name.length),
          };
        }
        break;
      case "SequenceExpression": {
        // Babel (unlike other parsers) includes spaces and comments in the range. Let's unify this.
        const lastExpression = getLast(node.expressions);
        if (locEnd(node) > locEnd(lastExpression)) {
          node.range = composeLoc(node, lastExpression);
        }
        break;
      }
      case "ClassProperty":
        // TODO: Temporary auto-generated node type. To remove when typescript-estree has proper support for private fields.
        if (
          node.key &&
          node.key.type === "TSPrivateIdentifier" &&
          getNextNonSpaceNonCommentCharacter(
            options.originalText,
            node.key,
            locEnd
          ) === "?"
        ) {
          node.optional = true;
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
    toBeOverriddenNode.range = composeLoc(toBeOverriddenNode, toOverrideNode);
  }
}

function visitNode(node, fn) {
  let entries;

  if (Array.isArray(node)) {
    entries = node.entries();
  } else if (
    node &&
    typeof node === "object" &&
    typeof node.type === "string"
  ) {
    entries = Object.entries(node);
  } else {
    return node;
  }

  for (const [key, child] of entries) {
    node[key] = visitNode(child, fn);
  }

  return fn(node) || node;
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
      range: composeLoc(node.left, node.right.left),
    }),
    right: node.right.right,
    range: composeLoc(node),
  });
}

function includeShebang(ast, options) {
  const shebang = getShebang(options.originalText);

  if (shebang) {
    ast.comments.unshift({
      type: "Line",
      value: shebang.slice(2),
      range: [0, shebang.length],
    });
  }
}

module.exports = postprocess;

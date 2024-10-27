"use strict";

const { hasNewlineInRange } = require("../../common/util");
const {
  isJsxNode,
  isBlockComment,
  getComments,
  isCallExpression,
  isMemberExpression,
} = require("../utils");
const { locStart, locEnd } = require("../loc");
const {
  builders: {
    line,
    softline,
    group,
    indent,
    align,
    ifBreak,
    dedent,
    breakParent,
  },
} = require("../../document");

/**
 * @typedef {import("../../document").Doc} Doc
 * @typedef {import("../../common/ast-path")} AstPath
 *
 * @typedef {any} Options - Prettier options (TBD ...)
 */

// If we have nested conditional expressions, we want to print them in JSX mode
// if there's at least one JSXElement somewhere in the tree.
//
// A conditional expression chain like this should be printed in normal mode,
// because there aren't JSXElements anywhere in it:
//
// isA ? "A" : isB ? "B" : isC ? "C" : "Unknown";
//
// But a conditional expression chain like this should be printed in JSX mode,
// because there is a JSXElement in the last ConditionalExpression:
//
// isA ? "A" : isB ? "B" : isC ? "C" : <span className="warning">Unknown</span>;
//
// This type of ConditionalExpression chain is structured like this in the AST:
//
// ConditionalExpression {
//   test: ...,
//   consequent: ...,
//   alternate: ConditionalExpression {
//     test: ...,
//     consequent: ...,
//     alternate: ConditionalExpression {
//       test: ...,
//       consequent: ...,
//       alternate: ...,
//     }
//   }
// }
function conditionalExpressionChainContainsJsx(node) {
  // Given this code:
  //
  // // Using a ConditionalExpression as the consequent is uncommon, but should
  // // be handled.
  // A ? B : C ? D : E ? F ? G : H : I
  //
  // which has this AST:
  //
  // ConditionalExpression {
  //   test: Identifier(A),
  //   consequent: Identifier(B),
  //   alternate: ConditionalExpression {
  //     test: Identifier(C),
  //     consequent: Identifier(D),
  //     alternate: ConditionalExpression {
  //       test: Identifier(E),
  //       consequent: ConditionalExpression {
  //         test: Identifier(F),
  //         consequent: Identifier(G),
  //         alternate: Identifier(H),
  //       },
  //       alternate: Identifier(I),
  //     }
  //   }
  // }
  //
  // We don't care about whether each node was the test, consequent, or alternate
  // We are only checking if there's any JSXElements inside.
  const conditionalExpressions = [node];
  for (let index = 0; index < conditionalExpressions.length; index++) {
    const conditionalExpression = conditionalExpressions[index];
    for (const property of ["test", "consequent", "alternate"]) {
      const node = conditionalExpression[property];

      if (isJsxNode(node)) {
        return true;
      }

      if (node.type === "ConditionalExpression") {
        conditionalExpressions.push(node);
      }
    }
  }

  return false;
}

function printTernaryTest(path, options, print) {
  const node = path.getValue();
  const isConditionalExpression = node.type === "ConditionalExpression";
  const alternateNodePropertyName = isConditionalExpression
    ? "alternate"
    : "falseType";

  const parent = path.getParentNode();

  const printed = isConditionalExpression
    ? print("test")
    : [print("checkType"), " ", "extends", " ", print("extendsType")];
  /**
   *     a
   *       ? b
   *       : multiline
   *         test
   *         node
   *       ^^ align(2)
   *       ? d
   *       : e
   */
  if (parent.type === node.type && parent[alternateNodePropertyName] === node) {
    return align(2, printed);
  }
  return printed;
}

const ancestorNameMap = new Map([
  ["AssignmentExpression", "right"],
  ["VariableDeclarator", "init"],
  ["ReturnStatement", "argument"],
  ["ThrowStatement", "argument"],
  ["UnaryExpression", "argument"],
  ["YieldExpression", "argument"],
]);
function shouldExtraIndentForConditionalExpression(path) {
  const node = path.getValue();
  if (node.type !== "ConditionalExpression") {
    return false;
  }

  let parent;
  let child = node;
  for (let ancestorCount = 0; !parent; ancestorCount++) {
    const node = path.getParentNode(ancestorCount);

    if (
      (isCallExpression(node) && node.callee === child) ||
      (isMemberExpression(node) && node.object === child) ||
      (node.type === "TSNonNullExpression" && node.expression === child)
    ) {
      child = node;
      continue;
    }

    // Reached chain root

    if (
      (node.type === "NewExpression" && node.callee === child) ||
      (node.type === "TSAsExpression" && node.expression === child)
    ) {
      parent = path.getParentNode(ancestorCount + 1);
      child = node;
    } else {
      parent = node;
    }
  }

  // Do not add indent to direct `ConditionalExpression`
  if (child === node) {
    return false;
  }

  return parent[ancestorNameMap.get(parent.type)] === child;
}

/**
 * The following is the shared logic for
 * ternary operators, namely ConditionalExpression
 * and TSConditionalType
 * @param {AstPath} path - The path to the ConditionalExpression/TSConditionalType node.
 * @param {Options} options - Prettier options
 * @param {Function} print - Print function to call recursively
 * @returns {Doc}
 */
function printTernary(path, options, print) {
  const node = path.getValue();
  const isConditionalExpression = node.type === "ConditionalExpression";
  const consequentNodePropertyName = isConditionalExpression
    ? "consequent"
    : "trueType";
  const alternateNodePropertyName = isConditionalExpression
    ? "alternate"
    : "falseType";
  const testNodePropertyNames = isConditionalExpression
    ? ["test"]
    : ["checkType", "extendsType"];
  const consequentNode = node[consequentNodePropertyName];
  const alternateNode = node[alternateNodePropertyName];
  const parts = [];

  // [prettierx] --space-in-parens option support (...)
  const insideSpace = options.spaceInParens ? " " : "";
  const innerLineBreak = options.spaceInParens ? line : softline;

  // We print a ConditionalExpression in either "JSX mode" or "normal mode".
  // See tests/jsx/conditional-expression.js for more info.
  let jsxMode = false;
  const parent = path.getParentNode();
  const isParentTest =
    parent.type === node.type &&
    testNodePropertyNames.some((prop) => parent[prop] === node);
  let forceNoIndent = parent.type === node.type && !isParentTest;

  // Find the outermost non-ConditionalExpression parent, and the outermost
  // ConditionalExpression parent. We'll use these to determine if we should
  // print in JSX mode.
  let currentParent;
  let previousParent;
  let i = 0;
  do {
    previousParent = currentParent || node;
    currentParent = path.getParentNode(i);
    i++;
  } while (
    currentParent &&
    currentParent.type === node.type &&
    testNodePropertyNames.every(
      (prop) => currentParent[prop] !== previousParent
    )
  );
  const firstNonConditionalParent = currentParent || parent;
  const lastConditionalParent = previousParent;

  if (
    isConditionalExpression &&
    (isJsxNode(node[testNodePropertyNames[0]]) ||
      isJsxNode(consequentNode) ||
      isJsxNode(alternateNode) ||
      conditionalExpressionChainContainsJsx(lastConditionalParent))
  ) {
    jsxMode = true;
    forceNoIndent = true;

    // Even though they don't need parens, we wrap (almost) everything in
    // parens when using ?: within JSX, because the parens are analogous to
    // curly braces in an if statement.
    const wrap = (doc) => [
      ifBreak("("),
      indent([softline, doc]),
      softline,
      ifBreak(")"),
    ];

    // The only things we don't wrap are:
    // * Nested conditional expressions in alternates
    // * null
    // * undefined
    const isNil = (node) =>
      node.type === "NullLiteral" ||
      (node.type === "Literal" && node.value === null) ||
      (node.type === "Identifier" && node.name === "undefined");

    parts.push(
      " ? ",
      isNil(consequentNode)
        ? print(consequentNodePropertyName)
        : wrap(print(consequentNodePropertyName)),
      " : ",
      alternateNode.type === node.type || isNil(alternateNode)
        ? print(alternateNodePropertyName)
        : wrap(print(alternateNodePropertyName))
    );
  } else {
    // normal mode
    const part = [
      line,
      "? ",
      // [prettierx] --space-in-parens option support (...)
      ...(consequentNode.type === node.type
        ? [ifBreak("", ["(", insideSpace])]
        : [""]),
      // [prettierx] offsetTernaryExpressions option support:
      !options.offsetTernaryExpressions
        ? align(2, print(consequentNodePropertyName))
        : print(consequentNodePropertyName),
      // [prettierx] --space-in-parens option support (...)
      ...(consequentNode.type === node.type
        ? [insideSpace, ifBreak("", ")")]
        : [""]),
      line,
      ": ",
      // [prettierx] offsetTernaryExpressions option support:
      options.offsetTernaryExpressions || alternateNode.type === node.type
        ? print(alternateNodePropertyName)
        : align(2, print(alternateNodePropertyName)),
    ];
    parts.push(
      // [prettierx] with offsetTernaryExpressions option support below:
      parent.type !== node.type ||
        parent[alternateNodePropertyName] === node ||
        isParentTest
        ? part
        : options.useTabs || options.offsetTernaryExpressions // [prettierx] offsetTernaryExpressions option support (...)
        ? dedent(indent(part))
        : align(Math.max(0, options.tabWidth - 2), part)
    );

    // [prettierx] offsetTernaryExpressions option support:
    // Indent the whole ternary if offsetTernaryExpressions is enabled
    // (like ESLint).
    if (options.offsetTernaryExpressions) {
      forceNoIndent = false;
    }
  }

  // We want a whole chain of ConditionalExpressions to all
  // break if any of them break. That means we should only group around the
  // outer-most ConditionalExpression.
  const comments = [
    ...testNodePropertyNames.map((propertyName) =>
      getComments(node[propertyName])
    ),
    getComments(consequentNode),
    getComments(alternateNode),
  ].flat();
  const shouldBreak = comments.some(
    (comment) =>
      isBlockComment(comment) &&
      hasNewlineInRange(
        options.originalText,
        locStart(comment),
        locEnd(comment)
      )
  );
  // [prettierx] moved & updated for --space-in-parens option support (...)
  // const maybeGroup = (doc) =>
  //   ...

  // Break the closing paren to keep the chain right after it:
  // (a
  //   ? b
  //   : c
  // ).call()
  const breakClosingParen =
    !jsxMode &&
    (isMemberExpression(parent) ||
      (parent.type === "NGPipeExpression" && parent.left === node)) &&
    !parent.computed;

  // prettierx: with options for insideSpace support in ternaries (...)
  const maybeGroup = (doc) =>
    parent === firstNonConditionalParent
      ? group(doc, { breakParent, addedLine: breakClosingParen })
      : shouldBreak
      ? [doc, breakParent]
      : doc;

  const shouldExtraIndent = shouldExtraIndentForConditionalExpression(path);

  const result = maybeGroup([
    printTernaryTest(path, options, print),
    forceNoIndent ? parts : indent(parts),
    // [prettierx]: --space-in-parens option (...)
    isConditionalExpression && breakClosingParen && !shouldExtraIndent
      ? innerLineBreak
      : "",
  ]);

  return isParentTest || shouldExtraIndent
    ? group([indent([softline, result]), softline])
    : result;
}

module.exports = { printTernary };

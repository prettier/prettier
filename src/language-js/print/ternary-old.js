import {
  align,
  breakParent,
  dedent,
  group,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/builders.js";
import hasNewlineInRange from "../../utils/has-newline-in-range.js";
import { locEnd, locStart } from "../loc.js";
import {
  hasComment,
  isBinaryCastExpression,
  isCallExpression,
  isJsxElement,
  isMemberExpression,
} from "../utils/index.js";
import isBlockComment from "../utils/is-block-comment.js";

/**
 * @typedef {import("../../document/builders.js").Doc} Doc
 * @typedef {import("../../common/ast-path.js").default} AstPath
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

      if (isJsxElement(node)) {
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
  const { node } = path;
  const isConditionalExpression = node.type === "ConditionalExpression";
  const alternateNodePropertyName = isConditionalExpression
    ? "alternate"
    : "falseType";

  const { parent } = path;

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
  ["AwaitExpression", "argument"],
]);
function shouldExtraIndentForConditionalExpression(path) {
  const { node } = path;
  if (node.type !== "ConditionalExpression") {
    return false;
  }

  let parent;
  let child = node;
  for (let ancestorCount = 0; !parent; ancestorCount++) {
    const node = path.getParentNode(ancestorCount);

    if (
      (node.type === "ChainExpression" && node.expression === child) ||
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
      (isBinaryCastExpression(node) && node.expression === child)
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
 * ternary operators, namely ConditionalExpression,
 * ConditionalTypeAnnotation and TSConditionalType
 * @param {AstPath} path - The path to the ConditionalExpression/TSConditionalType node.
 * @param {Options} options - Prettier options
 * @param {Function} print - Print function to call recursively
 * @returns {Doc}
 */
function printTernaryOld(path, options, print) {
  const { node } = path;
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

  // We print a ConditionalExpression in either "JSX mode" or "normal mode".
  // See `tests/format/jsx/conditional-expression.js` for more info.
  let jsxMode = false;
  const { parent } = path;
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
      (prop) => currentParent[prop] !== previousParent,
    )
  );
  const firstNonConditionalParent = currentParent || parent;
  const lastConditionalParent = previousParent;

  if (
    isConditionalExpression &&
    (isJsxElement(node[testNodePropertyNames[0]]) ||
      isJsxElement(consequentNode) ||
      isJsxElement(alternateNode) ||
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
        : wrap(print(alternateNodePropertyName)),
    );
  } else {
    /*
    This does not mean to indent, but make the doc aligned with the first character after `? ` or `: `,
    so we use `2` instead of `options.tabWidth` here.
    
    ```js
    test
     ? {
         consequent
       }
     : alternate
    ```

    instead of
    
    ```js
    test
     ? {
       consequent
     }
     : alternate
    ```
    */
    const printBranch = (nodePropertyName) =>
      options.useTabs
        ? indent(print(nodePropertyName))
        : align(2, print(nodePropertyName));
    // normal mode
    const part = [
      line,
      "? ",
      consequentNode.type === node.type ? ifBreak("", "(") : "",
      printBranch(consequentNodePropertyName),
      consequentNode.type === node.type ? ifBreak("", ")") : "",
      line,
      ": ",
      printBranch(alternateNodePropertyName),
    ];
    parts.push(
      parent.type !== node.type ||
        parent[alternateNodePropertyName] === node ||
        isParentTest
        ? part
        : options.useTabs
          ? dedent(indent(part))
          : align(Math.max(0, options.tabWidth - 2), part),
    );
  }

  // We want a whole chain of ConditionalExpressions to all
  // break if any of them break. That means we should only group around the
  // outer-most ConditionalExpression.
  const shouldBreak = [
    consequentNodePropertyName,
    alternateNodePropertyName,
    ...testNodePropertyNames,
  ].some((property) =>
    hasComment(
      node[property],
      (comment) =>
        isBlockComment(comment) &&
        hasNewlineInRange(
          options.originalText,
          locStart(comment),
          locEnd(comment),
        ),
    ),
  );
  const maybeGroup = (doc) =>
    parent === firstNonConditionalParent
      ? group(doc, { shouldBreak })
      : shouldBreak
        ? [doc, breakParent]
        : doc;

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

  const shouldExtraIndent = shouldExtraIndentForConditionalExpression(path);

  const result = maybeGroup([
    printTernaryTest(path, options, print),
    forceNoIndent ? parts : indent(parts),
    isConditionalExpression && breakClosingParen && !shouldExtraIndent
      ? softline
      : "",
  ]);

  return isParentTest || shouldExtraIndent
    ? group([indent([softline, result]), softline])
    : result;
}

export { printTernaryOld };

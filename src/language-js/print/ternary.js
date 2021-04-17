import hasNewlineInRange from "../../utils/has-newline-in-range.js";
import {
  isJsxElement,
  isCallExpression,
  isMemberExpression,
  isBinaryCastExpression,
  getComments,
  isLoneShortArgument,
  isSimpleExpressionByNodeCount,
  hasComment,
  CommentCheckFlags,
} from "../utils/index.js";
import { locStart, locEnd } from "../loc.js";
import isBlockComment from "../utils/is-block-comment.js";
import {
  line,
  softline,
  hardline,
  group,
  indent,
  dedent,
  ifBreak,
  breakParent,
} from "../../document/builders.js";
import pathNeedsParens from "../needs-parens.js";
import { printDanglingComments } from "../../main/comments/print.js";

/**
 * @typedef {import("../../document/builders.js").Doc} Doc
 * @typedef {import("../../common/ast-path.js").default} AstPath
 *
 * @typedef {any} Options - Prettier options (TBD ...)
 */

// Break the closing paren to keep the chain right after it:
// (a
//   ? b
//   : c
// ).call()
function shouldBreakClosingParen(node, parent) {
  return (
    (isMemberExpression(parent) ||
      (parent.type === "NGPipeExpression" && parent.left === node)) &&
    !parent.computed
  );
}

function hasMultilineBlockComments(
  testNodes,
  consequentNode,
  alternateNode,
  options
) {
  const comments = [
    ...testNodes.map((node) => getComments(node)),
    getComments(consequentNode),
    getComments(alternateNode),
  ].flat();
  return comments.some(
    (comment) =>
      isBlockComment(comment) &&
      hasNewlineInRange(
        options.originalText,
        locStart(comment),
        locEnd(comment)
      )
  );
}

const ancestorNameMap = new Map([
  ["AssignmentExpression", "right"],
  ["VariableDeclarator", "init"],
  ["ReturnStatement", "argument"],
  ["ThrowStatement", "argument"],
  ["UnaryExpression", "argument"],
  ["YieldExpression", "argument"],
]);
/**
 * Do we want to wrap the entire ternary in its own indent?
 * Eg; for when instead of this:
 *    foo = cond ?
 *      cons
 *    : alt
 * We want this:
 *    foo =
 *      cond ?
 *        cons
 *      : alt
 */
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

const wrapInParens = (doc) => [
  ifBreak("("),
  indent([softline, doc]),
  softline,
  ifBreak(")"),
];

/**
 * The following is the shared logic for
 * ternary operators, namely ConditionalExpression,
 * ConditionalTypeAnnotation and TSConditionalType
 * @param {AstPath} path - The path to the ConditionalExpression/TSConditionalType node.
 * @param {Options} options - Prettier options
 * @param {Function} print - Print function to call recursively
 * @returns {Doc}
 */
function printTernary(path, options, print, args) {
  const { node } = path;
  const isConditionalExpression = node.type === "ConditionalExpression";
  const isTSConditional = !isConditionalExpression;
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
  const testNodes = testNodePropertyNames.map((prop) => node[prop]);
  const { parent } = path;

  const isParentTernary = parent.type === node.type;
  const isInTest =
    isParentTernary &&
    testNodePropertyNames.some((prop) => parent[prop] === node);
  const isInAlternate =
    isParentTernary && parent[alternateNodePropertyName] === node;
  const isConsequentTernary = consequentNode.type === node.type;
  const isAlternateTernary = alternateNode.type === node.type;
  const isInChain = isAlternateTernary || isInAlternate;
  const isBigTabs = options.tabWidth > 2 || options.useTabs;

  // Find the outermost non-ConditionalExpression parent, and the outermost
  // ConditionalExpression parent.
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

  const isOnSameLineAsAssignment =
    args &&
    args.assignmentLayout &&
    args.assignmentLayout !== "break-after-operator" &&
    (parent.type === "AssignmentExpression" ||
      parent.type === "VariableDeclarator" ||
      parent.type === "ClassProperty" ||
      parent.type === "PropertyDefinition" ||
      parent.type === "ClassPrivateProperty" ||
      parent.type === "ObjectProperty" ||
      parent.type === "Property");

  const isOnSameLineAsReturn =
    (parent.type === "ReturnStatement" || parent.type === "ThrowStatement") &&
    !(isConsequentTernary || isAlternateTernary);

  const isInJsx =
    isConditionalExpression &&
    firstNonConditionalParent.type === "JSXExpressionContainer" &&
    path.grandparent.type !== "JSXAttribute";

  const shouldExtraIndent = shouldExtraIndentForConditionalExpression(path);
  const breakClosingParen = shouldBreakClosingParen(node, parent);
  const breakTSClosingParen = isTSConditional && pathNeedsParens(path, options);

  const fillTab = !isBigTabs
    ? ""
    : options.useTabs
    ? "\t"
    : " ".repeat(options.tabWidth - 1);

  // We want a whole chain of ConditionalExpressions to all
  // break if any of them break. That means we should only group around the
  // outer-most ConditionalExpression.
  const shouldBreak =
    hasMultilineBlockComments(
      testNodes,
      consequentNode,
      alternateNode,
      options
    ) ||
    isConsequentTernary ||
    isAlternateTernary;

  // Enable this syntax when relevant, to avoid pushing a short consequent to the next line:
  //
  //   const result = foo != null ? foo : (
  //     some + long + expression
  //   );
  const tryToParenthesizeAlternate =
    !isInChain &&
    !isParentTernary &&
    !isTSConditional &&
    (isInJsx
      ? // In JSX, we want this with a null-consequent to mirror booleans:
        //
        //   {!foo ? null : (
        //     something.else()
        //   )}
        //
        // But not in the general case, where it's (subjectively) better to have things multiline.
        consequentNode.type === "NullLiteral" ||
        (consequentNode.type === "Literal" && consequentNode.value === null)
      : // Right now, we do this when:
        // 1. The test is simple and,
        // 2. The consequent is short.
        // This heuristic could probably be refined over time, but felt right after moderate amounts of tinkering.
        isLoneShortArgument(consequentNode, options) &&
        isSimpleExpressionByNodeCount(node.test, 3));

  const shouldGroupTestAndConsequent =
    isInChain ||
    isParentTernary ||
    isTSConditional ||
    tryToParenthesizeAlternate;

  const testId = Symbol("test");
  const consequentId = Symbol("consequent");
  const testAndConsequentId = Symbol("test-and-consequent");

  const printedTest = isConditionalExpression
    ? [
        wrapInParens(print("test")),
        node.test.type === "ConditionalExpression" ? breakParent : "",
      ]
    : [print("checkType"), " ", "extends", " ", print("extendsType")];
  const printedTestWithQuestionMark = group([printedTest, " ?"], {
    id: testId,
  });

  const printedConsequent = print(consequentNodePropertyName);
  const consequent = indent([
    isConsequentTernary ||
    (isInJsx && (isJsxElement(consequentNode) || isParentTernary || isInChain))
      ? hardline
      : line,
    printedConsequent,
  ]);

  const printedTestAndConsequent = shouldGroupTestAndConsequent
    ? group(
        [
          printedTestWithQuestionMark,
          // Avoid indenting consequent if it isn't a chain, even if the test breaks.
          isInChain
            ? consequent
            : isTSConditional
            ? group(consequent, { id: consequentId })
            : // If the test breaks, also break the consequent
              ifBreak(consequent, group(consequent, { id: consequentId }), {
                groupId: testId,
              }),
        ],
        { id: testAndConsequentId }
      )
    : [printedTestWithQuestionMark, consequent];

  const printedAlternate = print(alternateNodePropertyName);
  const printedAlternateWithParens = tryToParenthesizeAlternate
    ? ifBreak(printedAlternate, dedent(wrapInParens(printedAlternate)), {
        groupId: testAndConsequentId,
      })
    : printedAlternate;

  const danglingComments = [];
  if (hasComment(alternateNode, CommentCheckFlags.Dangling)) {
    path.call((childPath) => {
      danglingComments.push(printDanglingComments(childPath, options));
    }, "alternate");
  }

  const parts = [
    printedTestAndConsequent,

    ...danglingComments,

    isAlternateTernary
      ? hardline
      : tryToParenthesizeAlternate
      ? ifBreak(line, " ", { groupId: testAndConsequentId })
      : line,
    ":",
    isAlternateTernary
      ? " "
      : !isBigTabs
      ? " "
      : shouldGroupTestAndConsequent
      ? ifBreak(
          fillTab,
          ifBreak(isInChain || tryToParenthesizeAlternate ? " " : fillTab, " "),
          { groupId: testAndConsequentId }
        )
      : ifBreak(fillTab, " "),

    isAlternateTernary
      ? printedAlternateWithParens
      : group([
          indent(printedAlternateWithParens),
          isInJsx && !tryToParenthesizeAlternate ? softline : "",
        ]),

    breakClosingParen && !shouldExtraIndent ? softline : "",
    shouldBreak ? breakParent : "",
  ];

  const result =
    isOnSameLineAsAssignment && !shouldBreak
      ? // We try to preserve the case of a single-line ternary bumped to the line after assignment:
        //
        //   const foo =
        //     cond ? result : otherwise;
        //
        // However, this sadly means that tests are always shunted to the next line in this case,
        // which I'm ambivalent about but some people like keeping on the same line as the assignment.
        group(indent([softline, group(parts)]))
      : isOnSameLineAsAssignment || isOnSameLineAsReturn
      ? group(indent(parts))
      : shouldExtraIndent || (isTSConditional && isInTest)
      ? group([indent([softline, parts]), breakTSClosingParen ? softline : ""])
      : parent === firstNonConditionalParent
      ? group(parts)
      : parts;

  return result;
}

export { printTernary };

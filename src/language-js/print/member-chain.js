"use strict";

const { printComments } = require("../../main/comments");
const {
  getLast,
  isNextLineEmptyAfterIndex,
  getNextNonSpaceNonCommentCharacterIndex,
} = require("../../common/util");
const pathNeedsParens = require("../needs-parens");
const {
  isCallExpression,
  isMemberExpression,
  isFunctionOrArrowExpression,
  isLongCurriedCallExpression,
  isMemberish,
  isNumericLiteral,
  isSimpleCallArgument,
  hasComment,
  CommentCheckFlags,
  isNextLineEmpty,
} = require("../utils");
const { locEnd } = require("../loc");

const {
  builders: {
    join,
    hardline,
    group,
    indent,
    conditionalGroup,
    breakParent,
    label,
  },
  utils: { willBreak },
} = require("../../document");
const printCallArguments = require("./call-arguments");
const { printMemberLookup } = require("./member");
const {
  printOptionalToken,
  printFunctionTypeParameters,
  printBindExpressionCallee,
} = require("./misc");

// We detect calls on member expressions specially to format a
// common pattern better. The pattern we are looking for is this:
//
// arr
//   .map(x => x + 1)
//   .filter(x => x > 10)
//   .some(x => x % 2)
//
// The way it is structured in the AST is via a nested sequence of
// MemberExpression and CallExpression. We need to traverse the AST
// and make groups out of it to print it in the desired way.
function printMemberChain(path, options, print) {
  const parent = path.getParentNode();
  const isExpressionStatement =
    !parent || parent.type === "ExpressionStatement";

  // The first phase is to linearize the AST by traversing it down.
  //
  //   a().b()
  // has the following AST structure:
  //   CallExpression(MemberExpression(CallExpression(Identifier)))
  // and we transform it into
  //   [Identifier, CallExpression, MemberExpression, CallExpression]
  const printedNodes = [];

  // Here we try to retain one typed empty line after each call expression or
  // the first group whether it is in parentheses or not
  function shouldInsertEmptyLineAfter(node) {
    const { originalText } = options;
    const nextCharIndex = getNextNonSpaceNonCommentCharacterIndex(
      originalText,
      node,
      locEnd
    );
    const nextChar = originalText.charAt(nextCharIndex);

    // if it is cut off by a parenthesis, we only account for one typed empty
    // line after that parenthesis
    if (nextChar === ")") {
      return (
        nextCharIndex !== false &&
        isNextLineEmptyAfterIndex(originalText, nextCharIndex + 1)
      );
    }

    return isNextLineEmpty(node, options);
  }

  function rec(path) {
    const node = path.getValue();
    if (
      isCallExpression(node) &&
      (isMemberish(node.callee) || isCallExpression(node.callee))
    ) {
      printedNodes.unshift({
        node,
        printed: [
          printComments(
            path,
            [
              printOptionalToken(path),
              printFunctionTypeParameters(path, options, print),
              printCallArguments(path, options, print),
            ],
            options
          ),
          shouldInsertEmptyLineAfter(node) ? hardline : "",
        ],
      });
      path.call((callee) => rec(callee), "callee");
    } else if (isMemberish(node)) {
      printedNodes.unshift({
        node,
        needsParens: pathNeedsParens(path, options),
        printed: printComments(
          path,
          isMemberExpression(node)
            ? printMemberLookup(path, options, print)
            : printBindExpressionCallee(path, options, print),
          options
        ),
      });
      path.call((object) => rec(object), "object");
    } else if (node.type === "TSNonNullExpression") {
      printedNodes.unshift({
        node,
        printed: printComments(path, "!", options),
      });
      path.call((expression) => rec(expression), "expression");
    } else {
      printedNodes.unshift({
        node,
        printed: print(),
      });
    }
  }
  // Note: the comments of the root node have already been printed, so we
  // need to extract this first call without printing them as they would
  // if handled inside of the recursive call.
  const node = path.getValue();
  printedNodes.unshift({
    node,
    printed: [
      printOptionalToken(path),
      printFunctionTypeParameters(path, options, print),
      printCallArguments(path, options, print),
    ],
  });

  if (node.callee) {
    path.call((callee) => rec(callee), "callee");
  }

  // Once we have a linear list of printed nodes, we want to create groups out
  // of it.
  //
  //   a().b.c().d().e
  // will be grouped as
  //   [
  //     [Identifier, CallExpression],
  //     [MemberExpression, MemberExpression, CallExpression],
  //     [MemberExpression, CallExpression],
  //     [MemberExpression],
  //   ]
  // so that we can print it as
  //   a()
  //     .b.c()
  //     .d()
  //     .e

  // The first group is the first node followed by
  //   - as many CallExpression as possible
  //       < fn()()() >.something()
  //   - as many array accessors as possible
  //       < fn()[0][1][2] >.something()
  //   - then, as many MemberExpression as possible but the last one
  //       < this.items >.something()
  const groups = [];
  let currentGroup = [printedNodes[0]];
  let i = 1;
  for (; i < printedNodes.length; ++i) {
    if (
      printedNodes[i].node.type === "TSNonNullExpression" ||
      isCallExpression(printedNodes[i].node) ||
      (isMemberExpression(printedNodes[i].node) &&
        printedNodes[i].node.computed &&
        isNumericLiteral(printedNodes[i].node.property))
    ) {
      currentGroup.push(printedNodes[i]);
    } else {
      break;
    }
  }
  if (!isCallExpression(printedNodes[0].node)) {
    for (; i + 1 < printedNodes.length; ++i) {
      if (
        isMemberish(printedNodes[i].node) &&
        isMemberish(printedNodes[i + 1].node)
      ) {
        currentGroup.push(printedNodes[i]);
      } else {
        break;
      }
    }
  }
  groups.push(currentGroup);
  currentGroup = [];

  // Then, each following group is a sequence of MemberExpression followed by
  // a sequence of CallExpression. To compute it, we keep adding things to the
  // group until we has seen a CallExpression in the past and reach a
  // MemberExpression
  let hasSeenCallExpression = false;
  for (; i < printedNodes.length; ++i) {
    if (hasSeenCallExpression && isMemberish(printedNodes[i].node)) {
      // [0] should be appended at the end of the group instead of the
      // beginning of the next one
      if (
        printedNodes[i].node.computed &&
        isNumericLiteral(printedNodes[i].node.property)
      ) {
        currentGroup.push(printedNodes[i]);
        continue;
      }

      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }

    if (
      isCallExpression(printedNodes[i].node) ||
      printedNodes[i].node.type === "ImportExpression"
    ) {
      hasSeenCallExpression = true;
    }
    currentGroup.push(printedNodes[i]);

    if (hasComment(printedNodes[i].node, CommentCheckFlags.Trailing)) {
      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // There are cases like Object.keys(), Observable.of(), _.values() where
  // they are the subject of all the chained calls and therefore should
  // be kept on the same line:
  //
  //   Object.keys(items)
  //     .filter(x => x)
  //     .map(x => x)
  //
  // In order to detect those cases, we use an heuristic: if the first
  // node is an identifier with the name starting with a capital
  // letter or just a sequence of _$. The rationale is that they are
  // likely to be factories.
  function isFactory(name) {
    return /^[A-Z]|^[$_]+$/.test(name);
  }

  // In case the Identifier is shorter than tab width, we can keep the
  // first call in a single line, if it's an ExpressionStatement.
  //
  //   d3.scaleLinear()
  //     .domain([0, 100])
  //     .range([0, width]);
  //
  function isShort(name) {
    return name.length <= options.tabWidth;
  }

  function shouldNotWrap(groups) {
    const hasComputed = groups[1].length > 0 && groups[1][0].node.computed;

    if (groups[0].length === 1) {
      const firstNode = groups[0][0].node;
      return (
        firstNode.type === "ThisExpression" ||
        (firstNode.type === "Identifier" &&
          (isFactory(firstNode.name) ||
            (isExpressionStatement && isShort(firstNode.name)) ||
            hasComputed))
      );
    }

    const lastNode = getLast(groups[0]).node;
    return (
      isMemberExpression(lastNode) &&
      lastNode.property.type === "Identifier" &&
      (isFactory(lastNode.property.name) || hasComputed)
    );
  }

  const shouldMerge =
    groups.length >= 2 &&
    !hasComment(groups[1][0].node) &&
    shouldNotWrap(groups);

  function printGroup(printedGroup) {
    const printed = printedGroup.map((tuple) => tuple.printed);
    // Checks if the last node (i.e. the parent node) needs parens and print
    // accordingly
    if (printedGroup.length > 0 && getLast(printedGroup).needsParens) {
      return ["(", ...printed, ")"];
    }
    return printed;
  }

  function printIndentedGroup(groups) {
    /* istanbul ignore next */
    if (groups.length === 0) {
      return "";
    }
    return indent(group([hardline, join(hardline, groups.map(printGroup))]));
  }

  const printedGroups = groups.map(printGroup);
  const oneLine = printedGroups;

  const cutoff = shouldMerge ? 3 : 2;
  const flatGroups = groups.flat();

  const nodeHasComment =
    flatGroups
      .slice(1, -1)
      .some((node) => hasComment(node.node, CommentCheckFlags.Leading)) ||
    flatGroups
      .slice(0, -1)
      .some((node) => hasComment(node.node, CommentCheckFlags.Trailing)) ||
    (groups[cutoff] &&
      hasComment(groups[cutoff][0].node, CommentCheckFlags.Leading));

  // If we only have a single `.`, we shouldn't do anything fancy and just
  // render everything concatenated together.
  if (groups.length <= cutoff && !nodeHasComment) {
    if (isLongCurriedCallExpression(path)) {
      return oneLine;
    }
    return group(oneLine);
  }

  // Find out the last node in the first group and check if it has an
  // empty line after
  const lastNodeBeforeIndent = getLast(groups[shouldMerge ? 1 : 0]).node;
  const shouldHaveEmptyLineBeforeIndent =
    !isCallExpression(lastNodeBeforeIndent) &&
    shouldInsertEmptyLineAfter(lastNodeBeforeIndent);

  const expanded = [
    printGroup(groups[0]),
    shouldMerge ? groups.slice(1, 2).map(printGroup) : "",
    shouldHaveEmptyLineBeforeIndent ? hardline : "",
    printIndentedGroup(groups.slice(shouldMerge ? 2 : 1)),
  ];

  const callExpressions = printedNodes
    .map(({ node }) => node)
    .filter(isCallExpression);

  function lastGroupWillBreakAndOtherCallsHaveFunctionArguments() {
    const lastGroupNode = getLast(getLast(groups)).node;
    const lastGroupDoc = getLast(printedGroups);
    return (
      isCallExpression(lastGroupNode) &&
      willBreak(lastGroupDoc) &&
      callExpressions
        .slice(0, -1)
        .some((node) => node.arguments.some(isFunctionOrArrowExpression))
    );
  }

  let result;

  // We don't want to print in one line if at least one of these conditions occurs:
  //  * the chain has comments,
  //  * the chain is an expression statement and all the arguments are literal-like ("fluent configuration" pattern),
  //  * the chain is longer than 2 calls and has non-trivial arguments or more than 2 arguments in any call but the first one,
  //  * any group but the last one has a hard line,
  //  * the last call's arguments have a hard line and other calls have non-trivial arguments.
  if (
    nodeHasComment ||
    (callExpressions.length > 2 &&
      callExpressions.some(
        (expr) => !expr.arguments.every((arg) => isSimpleCallArgument(arg, 0))
      )) ||
    printedGroups.slice(0, -1).some(willBreak) ||
    lastGroupWillBreakAndOtherCallsHaveFunctionArguments()
  ) {
    result = group(expanded);
  } else {
    result = [
      // We only need to check `oneLine` because if `expanded` is chosen
      // that means that the parent group has already been broken
      // naturally
      willBreak(oneLine) || shouldHaveEmptyLineBeforeIndent ? breakParent : "",
      conditionalGroup([oneLine, expanded]),
    ];
  }

  return label("member-chain", result);
}

module.exports = printMemberChain;

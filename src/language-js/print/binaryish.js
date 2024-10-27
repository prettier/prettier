"use strict";

const { printComments } = require("../../main/comments");
const { getLast } = require("../../common/util");
const {
  builders: {
    join,
    line,
    softline,
    group,
    indent,
    align,
    ifBreak,
    indentIfBreak,
  },
  utils: { cleanDoc, getDocParts, isConcat },
} = require("../../document");
const {
  hasLeadingOwnLineComment,
  isBinaryish,
  isJsxNode,
  shouldFlatten,
  hasComment,
  CommentCheckFlags,
  isCallExpression,
  isMemberExpression,
  isObjectProperty,
} = require("../utils");

/** @typedef {import("../../document").Doc} Doc */

let uid = 0;
function printBinaryishExpression(path, options, print) {
  const node = path.getValue();
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  const isInsideParenthesis =
    node !== parent.body &&
    (parent.type === "IfStatement" ||
      parent.type === "WhileStatement" ||
      parent.type === "SwitchStatement" ||
      parent.type === "DoWhileStatement");

  // [prettierx] --space-in-parens option support (...)
  const innerLineBreak = options.spaceInParens ? line : softline;

  const parts = printBinaryishExpressions(
    path,
    print,
    options,
    /* isNested */ false,
    isInsideParenthesis
  );

  //   if (
  //     this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft
  //   ) {
  //
  // looks super weird, we want to break the children if the parent breaks
  //
  //   if (
  //     this.hasPlugin("dynamicImports") &&
  //     this.lookahead().type === tt.parenLeft
  //   ) {
  if (isInsideParenthesis) {
    return parts;
  }

  // [prettierx] --space-in-parens option support
  // (...)
  //
  // Break between the parens in
  // unaries or in a member or specific call expression, i.e.
  //
  //   (
  //     a &&
  //     b &&
  //     c
  //   ).call()
  if (
    (isCallExpression(parent) && parent.callee === node) ||
    parent.type === "UnaryExpression" ||
    (isMemberExpression(parent) && !parent.computed)
  ) {
    // [prettierx] --space-in-parens option support (...)
    return group([indent([innerLineBreak, ...parts]), innerLineBreak], {
      addedLine: options.spaceInParens,
    });
  }

  // Avoid indenting sub-expressions in some cases where the first sub-expression is already
  // indented accordingly. We should indent sub-expressions where the first case isn't indented.
  const shouldNotIndent =
    parent.type === "ReturnStatement" ||
    parent.type === "ThrowStatement" ||
    (parent.type === "JSXExpressionContainer" &&
      parentParent.type === "JSXAttribute") ||
    (node.operator !== "|" && parent.type === "JsExpressionRoot") ||
    (node.type !== "NGPipeExpression" &&
      ((parent.type === "NGRoot" && options.parser === "__ng_binding") ||
        (parent.type === "NGMicrosyntaxExpression" &&
          parentParent.type === "NGMicrosyntax" &&
          parentParent.body.length === 1))) ||
    (node === parent.body && parent.type === "ArrowFunctionExpression") ||
    (node !== parent.body && parent.type === "ForStatement") ||
    (parent.type === "ConditionalExpression" &&
      parentParent.type !== "ReturnStatement" &&
      parentParent.type !== "ThrowStatement" &&
      !isCallExpression(parentParent)) ||
    parent.type === "TemplateLiteral";

  const shouldIndentIfInlining =
    parent.type === "AssignmentExpression" ||
    parent.type === "VariableDeclarator" ||
    parent.type === "ClassProperty" ||
    parent.type === "PropertyDefinition" ||
    parent.type === "TSAbstractClassProperty" ||
    parent.type === "ClassPrivateProperty" ||
    isObjectProperty(parent);

  const samePrecedenceSubExpression =
    isBinaryish(node.left) && shouldFlatten(node.operator, node.left.operator);

  if (
    shouldNotIndent ||
    (shouldInlineLogicalExpression(node) && !samePrecedenceSubExpression) ||
    (!shouldInlineLogicalExpression(node) && shouldIndentIfInlining)
  ) {
    return group(parts);
  }

  if (parts.length === 0) {
    return "";
  }

  // If the right part is a JSX node, we include it in a separate group to
  // prevent it breaking the whole chain, so we can print the expression like:
  //
  //   foo && bar && (
  //     <Foo>
  //       <Bar />
  //     </Foo>
  //   )

  const hasJsx = isJsxNode(node.right);

  const firstGroupIndex = parts.findIndex(
    (part) =>
      typeof part !== "string" && !Array.isArray(part) && part.type === "group"
  );

  // Separate the leftmost expression, possibly with its leading comments.
  const headParts = parts.slice(
    0,
    firstGroupIndex === -1 ? 1 : firstGroupIndex + 1
  );

  const rest = parts.slice(headParts.length, hasJsx ? -1 : undefined);

  const groupId = Symbol("logicalChain-" + ++uid);

  const chain = group(
    [
      // Don't include the initial expression in the indentation
      // level. The first item is guaranteed to be the first
      // left-most expression.
      ...headParts,
      indent(rest),
    ],
    { id: groupId }
  );

  if (!hasJsx) {
    return chain;
  }

  const jsxPart = getLast(parts);
  return group([chain, indentIfBreak(jsxPart, { groupId })]);
}

// For binary expressions to be consistent, we need to group
// subsequent operators with the same precedence level under a single
// group. Otherwise they will be nested such that some of them break
// onto new lines but not all. Operators with the same precedence
// level should either all break or not. Because we group them by
// precedence level and the AST is structured based on precedence
// level, things are naturally broken up correctly, i.e. `&&` is
// broken before `+`.
function printBinaryishExpressions(
  path,
  print,
  options,
  isNested,
  isInsideParenthesis
) {
  /** @type{Doc[]} */
  let parts = [];

  const node = path.getValue();

  // We treat BinaryExpression and LogicalExpression nodes the same.
  if (isBinaryish(node)) {
    // Put all operators with the same precedence level in the same
    // group. The reason we only need to do this with the `left`
    // expression is because given an expression like `1 + 2 - 3`, it
    // is always parsed like `((1 + 2) - 3)`, meaning the `left` side
    // is where the rest of the expression will exist. Binary
    // expressions on the right side mean they have a difference
    // precedence level and should be treated as a separate group, so
    // print them normally. (This doesn't hold for the `**` operator,
    // which is unique in that it is right-associative.)
    if (shouldFlatten(node.operator, node.left.operator)) {
      // Flatten them out by recursively calling this function.
      parts = [
        ...parts,
        ...path.call(
          (left) =>
            printBinaryishExpressions(
              left,
              print,
              options,
              /* isNested */ true,
              isInsideParenthesis
            ),
          "left"
        ),
      ];
    } else {
      parts.push(group(print("left")));
    }

    const shouldInline = shouldInlineLogicalExpression(node);
    const lineBeforeOperator =
      (node.operator === "|>" ||
        node.type === "NGPipeExpression" ||
        (node.operator === "|" && options.parser === "__vue_expression")) &&
      !hasLeadingOwnLineComment(options.originalText, node.right);

    const operator = node.type === "NGPipeExpression" ? "|" : node.operator;
    const rightSuffix =
      node.type === "NGPipeExpression" && node.arguments.length > 0
        ? group(
            indent([
              softline,
              ": ",
              join(
                [softline, ":", ifBreak(" ")],
                path.map(print, "arguments").map((arg) => align(2, group(arg)))
              ),
            ])
          )
        : "";

    const right = shouldInline
      ? [operator, " ", print("right"), rightSuffix]
      : [
          lineBeforeOperator ? line : "",
          operator,
          lineBeforeOperator ? " " : line,
          print("right"),
          rightSuffix,
        ];

    // If there's only a single binary expression, we want to create a group
    // in order to avoid having a small right part like -1 be on its own line.
    const parent = path.getParentNode();
    const shouldBreak = hasComment(
      node.left,
      CommentCheckFlags.Trailing | CommentCheckFlags.Line
    );
    const shouldGroup =
      shouldBreak ||
      (!(isInsideParenthesis && node.type === "LogicalExpression") &&
        parent.type !== node.type &&
        node.left.type !== node.type &&
        node.right.type !== node.type);

    parts.push(
      lineBeforeOperator ? "" : " ",
      shouldGroup ? group(right, { shouldBreak }) : right
    );

    // The root comments are already printed, but we need to manually print
    // the other ones since we don't call the normal print on BinaryExpression,
    // only for the left and right parts
    if (isNested && hasComment(node)) {
      const printed = cleanDoc(printComments(path, parts, options));
      /* istanbul ignore else */
      if (isConcat(printed) || printed.type === "fill") {
        parts = getDocParts(printed);
      } else {
        parts = [printed];
      }
    }
  } else {
    // Our stopping case. Simply print the node normally.
    parts.push(group(print()));
  }

  return parts;
}

function shouldInlineLogicalExpression(node) {
  if (node.type !== "LogicalExpression") {
    return false;
  }

  if (
    node.right.type === "ObjectExpression" &&
    node.right.properties.length > 0
  ) {
    return true;
  }

  if (node.right.type === "ArrayExpression" && node.right.elements.length > 0) {
    return true;
  }

  if (isJsxNode(node.right)) {
    return true;
  }

  return false;
}

module.exports = { printBinaryishExpression, shouldInlineLogicalExpression };

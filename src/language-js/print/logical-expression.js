import {
  DOC_TYPE_ARRAY,
  DOC_TYPE_LABEL,
  getDocType,
  group,
  indent,
  indentIfBreak,
  line,
  softline,
} from "../../document/index.js";
import {
  printLeadingComments,
  printTrailingComments,
} from "../../main/comments/print.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { hasLeadingOwnLineComment } from "../utilities/has-leading-own-line-comment.js";
import { isBooleanTypeCoercion } from "../utilities/is-boolean-type-coercion.js";
import { isObjectProperty } from "../utilities/is-object-property.js";
import { isTypeCastComment } from "../utilities/is-type-cast-comment.js";
import {
  isAbstractPropertyDefinition,
  isArrayExpression,
  isCallOrNewExpression,
  isJsxElement,
  isMemberExpression,
  isObjectExpression,
  isReturnOrThrowStatement,
  isUnaryLikeNode,
} from "../utilities/node-types.js";

let uid = 0;

function shouldInlineLogicalOperand(node) {
  return (
    (isObjectExpression(node) && node.properties.length > 0) ||
    (isArrayExpression(node) && node.elements.length > 0) ||
    isJsxElement(node)
  );
}

function shouldInlineLogicalExpression(node) {
  if (node.type !== "LogicalExpression") {
    return false;
  }

  let rightNode = node.right;
  while (
    rightNode.type === "LogicalExpression" &&
    rightNode.operator === node.operator
  ) {
    rightNode = rightNode.right;
  }

  return shouldInlineLogicalOperand(rightNode);
}

function getLogicalExpressionOperands(node) {
  const { operator } = node;
  const operands = [];

  function visit(current, currentPath, leadingNodes, trailingNodes) {
    if (current.type === "LogicalExpression" && current.operator === operator) {
      const entry = { node: current, path: currentPath };
      visit(
        current.left,
        [...currentPath, "left"],
        current === node ? leadingNodes : [...leadingNodes, entry],
        [],
      );
      visit(
        current.right,
        [...currentPath, "right"],
        [],
        current === node ? trailingNodes : [entry, ...trailingNodes],
      );
      return;
    }

    operands.push({
      node: current,
      path: currentPath,
      leadingNodes,
      trailingNodes,
    });
  }

  visit(node, [], [], []);
  return operands;
}

function printLogicalExpression(path, options, print) {
  const { node, parent, grandparent, key } = path;
  const isInsideParenthesis =
    key !== "body" &&
    (parent.type === "IfStatement" ||
      parent.type === "WhileStatement" ||
      parent.type === "SwitchStatement" ||
      parent.type === "DoWhileStatement" ||
      parent.type === "MatchStatement" ||
      parent.type === "MatchExpression");

  const operands = getLogicalExpressionOperands(node);
  const { operator } = node;

  const firstLeading = operands[0].leadingNodes
    .map(({ path: nodePath }) =>
      path.call(() => printLeadingComments(path, options), ...nodePath),
    )
    .filter(Boolean);
  const headParts = [...firstLeading, group(print(operands[0].path))];

  const tailParts = [];
  for (let index = 1; index < operands.length; index++) {
    const operand = operands[index];
    const previousOperand = operands[index - 1];
    const shouldInline = shouldInlineLogicalOperand(operand.node);
    const rightNodeToCheckComments =
      operand.node.type === "ChainExpression"
        ? operand.node.expression
        : operand.node;
    const nodesToCheckLeadingComments = [
      ...operand.leadingNodes.map((entry) => entry.node),
      rightNodeToCheckComments,
    ];
    const hasLeadingOwnLine = nodesToCheckLeadingComments.some((current) =>
      hasLeadingOwnLineComment(options.originalText, current),
    );
    const hasTypeCastComment = nodesToCheckLeadingComments.some((current) =>
      hasComment(current, CommentCheckFlags.Leading, isTypeCastComment),
    );
    const commentBeforeOperator = !hasTypeCastComment && hasLeadingOwnLine;

    const internalLeading = operand.leadingNodes
      .map(({ path: nodePath }) =>
        path.call(() => printLeadingComments(path, options), ...nodePath),
      )
      .filter(Boolean);
    const internalTrailing = operand.trailingNodes
      .map(({ path: nodePath }) =>
        path.call(() => printTrailingComments(path, options), ...nodePath),
      )
      .filter(Boolean);
    const printedOperand = print(operand.path);

    let right;
    if (shouldInline) {
      const rightContent = [
        ...internalLeading,
        printedOperand,
        ...internalTrailing,
      ];
      right = [
        operator,
        hasLeadingOwnLine ? indent([line, rightContent]) : [" ", rightContent],
      ];
    } else if (options.experimentalOperatorPosition === "start") {
      if (commentBeforeOperator) {
        const leadingComments = [...internalLeading];
        if (
          hasComment(operand.node, CommentCheckFlags.Leading) ||
          hasComment(rightNodeToCheckComments, CommentCheckFlags.Leading)
        ) {
          switch (getDocType(printedOperand)) {
            case DOC_TYPE_ARRAY:
              leadingComments.push(printedOperand.shift());
              break;
            case DOC_TYPE_LABEL:
              leadingComments.push(printedOperand.contents.shift());
              break;
          }
        }
        right = [
          line,
          leadingComments,
          operator,
          " ",
          [printedOperand, ...internalTrailing],
        ];
      } else {
        right = [
          line,
          operator,
          " ",
          [...internalLeading, printedOperand, ...internalTrailing],
        ];
      }
    } else {
      right = [
        operator,
        line,
        [...internalLeading, printedOperand, ...internalTrailing],
      ];
    }

    const previousNodeToCheckComments =
      previousOperand.node.type === "ChainExpression"
        ? previousOperand.node.expression
        : previousOperand.node;
    const shouldBreak = [
      previousNodeToCheckComments,
      previousOperand.node,
      ...previousOperand.trailingNodes.map((entry) => entry.node),
    ].some((current) =>
      hasComment(current, CommentCheckFlags.Trailing | CommentCheckFlags.Line),
    );
    const shouldGroup =
      shouldBreak ||
      (!isInsideParenthesis &&
        operands.length === 2 &&
        parent.type !== "LogicalExpression" &&
        operands[0].node.type !== "LogicalExpression" &&
        operands[1].node.type !== "LogicalExpression");
    if (shouldGroup) {
      right = group(right, { shouldBreak });
    }

    if (options.experimentalOperatorPosition === "start") {
      tailParts.push(shouldInline || commentBeforeOperator ? " " : "", right);
    } else {
      tailParts.push(" ", right);
    }
  }

  const parts = [...headParts, ...tailParts];

  if (isInsideParenthesis) {
    return parts;
  }

  if (
    (key === "callee" && isCallOrNewExpression(parent)) ||
    (parent.type === "UnaryExpression" && !hasComment(node)) ||
    (isMemberExpression(parent) && !parent.computed)
  ) {
    return group([indent([softline, ...parts]), softline]);
  }

  const shouldNotIndent =
    (key === "argument" && isUnaryLikeNode(parent)) ||
    (parent.type === "JSXExpressionContainer" &&
      grandparent.type === "JSXAttribute") ||
    parent.type === "JsExpressionRoot" ||
    (parent.type === "NGRoot" && options.parser === "__ng_binding") ||
    (parent.type === "NGMicrosyntaxExpression" &&
      grandparent.type === "NGMicrosyntax" &&
      grandparent.body.length === 1) ||
    (node === parent.body && parent.type === "ArrowFunctionExpression") ||
    (node !== parent.body && parent.type === "ForStatement") ||
    (parent.type === "ConditionalExpression" &&
      !isReturnOrThrowStatement(grandparent) &&
      !isCallOrNewExpression(grandparent)) ||
    parent.type === "TemplateLiteral" ||
    (key === "arguments" && isBooleanTypeCoercion(parent));

  const shouldIndentIfInlining =
    parent.type === "AssignmentExpression" ||
    parent.type === "VariableDeclarator" ||
    parent.type === "ClassProperty" ||
    parent.type === "PropertyDefinition" ||
    isAbstractPropertyDefinition(parent) ||
    parent.type === "ClassPrivateProperty" ||
    isObjectProperty(parent);

  const isLastOperandInlined = shouldInlineLogicalOperand(operands.at(-1).node);
  const isAllRightOperandsInlined = operands
    .slice(1)
    .every((operand) => shouldInlineLogicalOperand(operand.node));

  if (
    shouldNotIndent ||
    isAllRightOperandsInlined ||
    (!isLastOperandInlined && shouldIndentIfInlining)
  ) {
    return group(parts);
  }

  const hasJsx = isJsxElement(operands.at(-1).node);
  const rest = hasJsx ? tailParts.slice(0, -1) : tailParts;
  const groupId = Symbol("logicalChain-" + ++uid);

  const chain = group([...headParts, indent(rest)], { id: groupId });

  if (!hasJsx) {
    return chain;
  }

  const jsxPart = tailParts.at(-1);
  return group([chain, indentIfBreak(jsxPart, { groupId })]);
}

export { printLogicalExpression, shouldInlineLogicalExpression };

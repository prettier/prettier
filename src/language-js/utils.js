"use strict";

// We match any whitespace except line terminators because
// Flow annotation comments cannot be split across lines. For example:
//
// (this /*
// : any */).foo = 5;
//
// is not picked up by Flow (see https://github.com/facebook/flow/issues/7050), so
// removing the newline would create a type annotation that the user did not intend
// to create.
const NON_LINE_TERMINATING_WHITE_SPACE = "(?:(?=.)\\s)";
const FLOW_SHORTHAND_ANNOTATION = new RegExp(
  `^${NON_LINE_TERMINATING_WHITE_SPACE}*:`
);
const FLOW_ANNOTATION = new RegExp(`^${NON_LINE_TERMINATING_WHITE_SPACE}*::`);

function hasFlowShorthandAnnotationComment(node) {
  // https://flow.org/en/docs/types/comments/
  // Syntax example: const r = new (window.Request /*: Class<Request> */)("");

  return (
    node.extra &&
    node.extra.parenthesized &&
    node.trailingComments &&
    node.trailingComments[0].value.match(FLOW_SHORTHAND_ANNOTATION)
  );
}

function hasFlowAnnotationComment(comments) {
  return comments && comments[0].value.match(FLOW_ANNOTATION);
}

function hasNode(node, fn) {
  if (!node || typeof node !== "object") {
    return false;
  }
  if (Array.isArray(node)) {
    return node.some(value => hasNode(value, fn));
  }
  const result = fn(node);
  return typeof result === "boolean"
    ? result
    : Object.keys(node).some(key => hasNode(node[key], fn));
}

function hasNakedLeftSide(node) {
  return (
    node.type === "AssignmentExpression" ||
    node.type === "BinaryExpression" ||
    node.type === "LogicalExpression" ||
    node.type === "NGPipeExpression" ||
    node.type === "ConditionalExpression" ||
    node.type === "CallExpression" ||
    node.type === "OptionalCallExpression" ||
    node.type === "MemberExpression" ||
    node.type === "OptionalMemberExpression" ||
    node.type === "SequenceExpression" ||
    node.type === "TaggedTemplateExpression" ||
    node.type === "BindExpression" ||
    (node.type === "UpdateExpression" && !node.prefix) ||
    node.type === "TSAsExpression" ||
    node.type === "TSNonNullExpression"
  );
}

function getLeftSide(node) {
  if (node.expressions) {
    return node.expressions[0];
  }
  return (
    node.left ||
    node.test ||
    node.callee ||
    node.object ||
    node.tag ||
    node.argument ||
    node.expression
  );
}

function getLeftSidePathName(path, node) {
  if (node.expressions) {
    return ["expressions", 0];
  }
  if (node.left) {
    return ["left"];
  }
  if (node.test) {
    return ["test"];
  }
  if (node.object) {
    return ["object"];
  }
  if (node.callee) {
    return ["callee"];
  }
  if (node.tag) {
    return ["tag"];
  }
  if (node.argument) {
    return ["argument"];
  }
  if (node.expression) {
    return ["expression"];
  }
  throw new Error("Unexpected node has no left side", node);
}

module.exports = {
  getLeftSide,
  getLeftSidePathName,
  hasNakedLeftSide,
  hasNode,
  hasFlowShorthandAnnotationComment,
  hasFlowAnnotationComment
};

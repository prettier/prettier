"use strict";

const { printDanglingComments } = require("../../main/comments");
const { getLast, isNextLineEmpty } = require("../../common/util");
const {
  builders: { concat, hardline, indent },
} = require("../../document");
const { hasComment, CommentCheckFlags } = require("../utils");
const { locEnd } = require("../loc");

const { printBody } = require("./statement");
const { printDirectives, hasDirectives } = require("./directives");

/** @typedef {import("../../document").Doc} Doc */

function printBlock(path, options, print) {
  const n = path.getValue();
  const parts = [];
  const naked = printBody(path, options, print);

  if (n.type === "StaticBlock") {
    parts.push("static ");
  }

  const nodeHasDirectives = hasDirectives(n);
  const nodeHasBody = n.body.some((node) => node.type !== "EmptyStatement");
  const nodeHasComment = hasComment(n, CommentCheckFlags.Dangling);

  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  if (
    !nodeHasBody &&
    !nodeHasDirectives &&
    !nodeHasComment &&
    (parent.type === "ArrowFunctionExpression" ||
      parent.type === "FunctionExpression" ||
      parent.type === "FunctionDeclaration" ||
      parent.type === "ObjectMethod" ||
      parent.type === "ClassMethod" ||
      parent.type === "ClassPrivateMethod" ||
      parent.type === "ForStatement" ||
      parent.type === "WhileStatement" ||
      parent.type === "DoWhileStatement" ||
      parent.type === "DoExpression" ||
      (parent.type === "CatchClause" && !parentParent.finalizer) ||
      parent.type === "TSModuleDeclaration" ||
      parent.type === "TSDeclareFunction" ||
      n.type === "StaticBlock")
  ) {
    return concat([...parts, "{}"]);
  }

  parts.push("{");

  const bodyParts = [];
  // Babel 6
  if (nodeHasDirectives) {
    bodyParts.push(hardline, printDirectives(path, options, print));

    if (isNextLineEmpty(options.originalText, getLast(n.directives), locEnd)) {
      bodyParts.push(hardline);
    }
  }

  if (nodeHasBody) {
    bodyParts.push(hardline, naked);
  }
  bodyParts.push(printDanglingComments(path, options));

  parts.push(indent(concat(bodyParts)));
  parts.push(hardline, "}");

  return concat(parts);
}

module.exports = { printBlock };

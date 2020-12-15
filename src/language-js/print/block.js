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
  const node = path.getValue();
  const parts = [];

  if (node.type === "StaticBlock") {
    parts.push("static ");
  }

  parts.push("{");

  const printed = printBlockBody(path, options, print);
  if (printed) {
    parts.push(indent(concat([hardline, printed])), hardline);
  } else {
    const parent = path.getParentNode();
    const parentParent = path.getParentNode(1);
    if (
      !(
        parent.type === "ArrowFunctionExpression" ||
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
        node.type === "StaticBlock"
      )
    ) {
      parts.push(hardline);
    }
  }

  parts.push("}");

  return concat(parts);
}

function printBlockBody(path, options, print) {
  const parts = [];
  const node = path.getValue();

  const nodeHasDirectives = hasDirectives(node);
  const nodeHasBody = node.body.some((node) => node.type !== "EmptyStatement");
  const nodeHasComment = hasComment(node, CommentCheckFlags.Dangling);

  // Babel 6
  if (nodeHasDirectives) {
    parts.push(printDirectives(path, options, print));

    if (nodeHasBody || nodeHasComment) {
      parts.push(hardline);

      if (
        isNextLineEmpty(options.originalText, getLast(node.directives), locEnd)
      ) {
        parts.push(hardline);
      }
    }
  }

  if (nodeHasBody) {
    parts.push(printBody(path, options, print));
  }

  if (nodeHasComment) {
    parts.push(printDanglingComments(path, options, /* sameIndent */ true));
  }

  return parts.length === 0 ? "" : concat(parts);
}

module.exports = { printBlock };

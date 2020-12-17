"use strict";

const { printDanglingComments } = require("../../main/comments");
const { isNextLineEmpty, isNonEmptyArray } = require("../../common/util");
const {
  builders: { concat, hardline, indent },
} = require("../../document");
const { hasComment, CommentCheckFlags } = require("../utils");
const { locEnd } = require("../loc");

const { printBody } = require("./statement");

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
  const node = path.getValue();

  const nodeHasDirectives = isNonEmptyArray(node.directives);
  const nodeHasBody = node.body.some((node) => node.type !== "EmptyStatement");
  const nodeHasComment = hasComment(node, CommentCheckFlags.Dangling);

  if (!nodeHasDirectives && !nodeHasBody && !nodeHasComment) {
    return "";
  }

  const parts = [];
  // Babel 6
  if (nodeHasDirectives) {
    const lastDirectiveIndex = path.getValue().directives.length - 1;
    path.each((childPath, index) => {
      parts.push(print(childPath));
      if (index < lastDirectiveIndex || nodeHasBody || nodeHasComment) {
        parts.push(hardline);
        if (
          isNextLineEmpty(options.originalText, childPath.getValue(), locEnd)
        ) {
          parts.push(hardline);
        }
      }
    }, "directives");
  }

  if (nodeHasBody) {
    parts.push(printBody(path, options, print));
  }

  if (nodeHasComment) {
    parts.push(printDanglingComments(path, options, /* sameIndent */ true));
  }

  if (node.type === "Program") {
    parts.push(hardline);
  }

  return concat(parts);
}

module.exports = { printBlock, printBlockBody };

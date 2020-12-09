"use strict";

const { printDanglingComments } = require("../../main/comments");
const {
  builders: { concat, hardline, indent },
} = require("../../document");
const { hasComment, CommentCheckFlags } = require("../utils");

const { printStatementSequence } = require("./statement");
const { printBabelDirectives } = require("./misc");

/** @typedef {import("../../document").Doc} Doc */

function printBlock(path, options, print) {
  const n = path.getValue();
  const parts = [];

  if (n.type === "StaticBlock") {
    parts.push("static ");
  }

  const hasContent = n.body.some((node) => node.type !== "EmptyStatement");
  const hasDirectives = n.directives && n.directives.length > 0;

  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  if (
    !hasContent &&
    !hasDirectives &&
    !hasComment(n, CommentCheckFlags.Dangling) &&
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
  if (hasDirectives) {
    bodyParts.push(hardline, printBabelDirectives(path, options, print));
  }

  if (hasContent) {
    bodyParts.push(
      hardline,
      path.call(
        (bodyPath) => printStatementSequence(bodyPath, options, print),
        "body"
      )
    );
  }

  parts.push(indent(concat(bodyParts)));
  parts.push(printDanglingComments(path, options));
  parts.push(hardline, "}");

  return concat(parts);
}

module.exports = { printBlock };

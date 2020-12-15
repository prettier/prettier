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

  const hasContent = n.body.some((node) => node.type !== "EmptyStatement");
  const nodeHasDirectives = hasDirectives(n);

  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  if (
    !hasContent &&
    !nodeHasDirectives &&
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

  // Babel 6
  if (nodeHasDirectives) {
    parts.push(
      indent(concat([hardline, printDirectives(path, options, print)]))
    );

    const lastDirective = getLast(n.directives);
    if (isNextLineEmpty(options.originalText, lastDirective, locEnd)) {
      parts.push(hardline);
    }
  }

  if (hasContent) {
    parts.push(indent(concat([hardline, naked])));
  }

  parts.push(printDanglingComments(path, options));
  parts.push(hardline, "}");

  return concat(parts);
}

module.exports = { printBlock };

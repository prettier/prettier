"use strict";

const { printDanglingComments } = require("../../main/comments");
const { isNextLineEmpty } = require("../../common/util");
const {
  builders: { concat, hardline, indent },
} = require("../../document");
const { hasComment, CommentCheckFlags } = require("../utils");
const { locEnd } = require("../loc");

const { printStatementSequence } = require("./statement");

/** @typedef {import("../../document").Doc} Doc */

function printBlock(path, options, print) {
  const n = path.getValue();
  const parts = [];
  const semi = options.semi ? ";" : "";
  const naked = path.call((bodyPath) => {
    return printStatementSequence(bodyPath, options, print);
  }, "body");

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
    !hasComment(n, CommentCheckFlags.dangling) &&
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
  if (hasDirectives) {
    path.each((childPath) => {
      parts.push(indent(concat([hardline, print(childPath), semi])));
      if (isNextLineEmpty(options.originalText, childPath.getValue(), locEnd)) {
        parts.push(hardline);
      }
    }, "directives");
  }

  if (hasContent) {
    parts.push(indent(concat([hardline, naked])));
  }

  parts.push(printDanglingComments(path, options));
  parts.push(hardline, "}");

  return concat(parts);
}

module.exports = { printBlock };

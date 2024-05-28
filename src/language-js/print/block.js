import { hardline, indent } from "../../document/builders.js";
import { printDanglingComments } from "../../main/comments/print.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import {
  CommentCheckFlags,
  hasComment,
  isNextLineEmpty,
} from "../utils/index.js";
import { printStatementSequence } from "./statement.js";

/** @typedef {import("../../document/builders.js").Doc} Doc */

/*
- `Program`
- `BlockStatement`
- `StaticBlock`
- `TSModuleBlock` (TypeScript)
*/
function printBlock(path, options, print) {
  const bodyDoc = printBlockBody(path, options, print);
  const { node, parent } = path;

  if (node.type === "Program" && parent?.type !== "ModuleExpression") {
    return bodyDoc ? [bodyDoc, hardline] : "";
  }

  const parts = [];

  if (node.type === "StaticBlock") {
    parts.push("static ");
  }

  parts.push("{");
  if (bodyDoc) {
    parts.push(indent([hardline, bodyDoc]), hardline);
  } else {
    const parentParent = path.grandparent;
    if (
      !(
        parent.type === "ArrowFunctionExpression" ||
        parent.type === "FunctionExpression" ||
        parent.type === "FunctionDeclaration" ||
        parent.type === "ComponentDeclaration" ||
        parent.type === "HookDeclaration" ||
        parent.type === "ObjectMethod" ||
        parent.type === "ClassMethod" ||
        parent.type === "ClassPrivateMethod" ||
        parent.type === "ForStatement" ||
        parent.type === "WhileStatement" ||
        parent.type === "DoWhileStatement" ||
        parent.type === "DoExpression" ||
        parent.type === "ModuleExpression" ||
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

  return parts;
}

/*
- `Program`
- `BlockStatement`
- `StaticBlock`
- `TSModuleBlock` (TypeScript)
*/
function printBlockBody(path, options, print) {
  const { node } = path;

  const hasDirectives = isNonEmptyArray(node.directives);
  const hasBody = node.body.some((node) => node.type !== "EmptyStatement");
  const hasDanglingComments = hasComment(node, CommentCheckFlags.Dangling);

  if (!hasDirectives && !hasBody && !hasDanglingComments) {
    return "";
  }

  const parts = [];
  // Babel
  if (hasDirectives) {
    parts.push(printStatementSequence(path, options, print, "directives"));

    if (hasBody || hasDanglingComments) {
      parts.push(hardline);
      if (isNextLineEmpty(node.directives.at(-1), options)) {
        parts.push(hardline);
      }
    }
  }

  if (hasBody) {
    parts.push(printStatementSequence(path, options, print, "body"));
  }

  if (hasDanglingComments) {
    parts.push(printDanglingComments(path, options));
  }

  return parts;
}

export { printBlock };

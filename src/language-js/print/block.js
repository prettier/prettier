import { printDanglingComments } from "../../main/comments/print.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import { hardline, indent, line } from "../../document/builders.js";
import {
  hasComment,
  CommentCheckFlags,
  isNextLineEmpty,
  isGetterOrSetter,
} from "../utils/index.js";
import { printStatementSequence } from "./statement.js";

/** @typedef {import("../../document/builders.js").Doc} Doc */

/*
- `BlockStatement`
- `StaticBlock`
- `TSModuleBlock` (TypeScript)
*/
function printBlock(path, options, print) {
  const { node } = path;
  const parts = [];

  if (node.type === "StaticBlock") {
    parts.push("static ");
  }

  parts.push("{");
  const printed = printBlockBody(path, options, print);
  if (printed) {
    if (
      isGetterOrSetter(path.parent) ||
      // Flow nests the function inside a property
      (path.parent.type === "FunctionExpression" &&
        isGetterOrSetter(path.grandparent))
    ) {
      // Allow getters & setters to print on one line.
      parts.push(indent([line, printed]), line);
    } else {
      parts.push(indent([hardline, printed]), hardline);
    }
  } else {
    const { parent } = path;
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
        (parent.type === "CatchClause" && !path.grandparent.finalizer) ||
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

  if (node.type === "Program" && path.parent?.type !== "ModuleExpression") {
    parts.push(hardline);
  }

  return parts;
}

export { printBlock, printBlockBody };

import { printDanglingComments } from "../../main/comments.js";
import { isNonEmptyArray } from "../../common/util.js";
import doc from "../../document/index.js";
import {
  hasComment,
  CommentCheckFlags,
  isNextLineEmpty,
} from "../utils/index.js";
import { printHardlineAfterHeritage } from "./class.js";

import { printBody } from "./statement.js";

const {
  builders: { hardline, indent },
} = doc;

/** @typedef {import("../../document").Doc} Doc */

function printBlock(path, options, print) {
  const node = path.getValue();
  const parts = [];

  if (node.type === "StaticBlock") {
    parts.push("static ");
  }

  if (node.type === "ClassBody" && isNonEmptyArray(node.body)) {
    const parent = path.getParentNode();
    parts.push(printHardlineAfterHeritage(parent));
  }

  parts.push("{");
  const printed = printBlockBody(path, options, print);
  if (printed) {
    parts.push(indent([hardline, printed]), hardline);
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
        node.type === "StaticBlock" ||
        node.type === "ClassBody"
      )
    ) {
      parts.push(hardline);
    }
  }

  parts.push("}");

  return parts;
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
    path.each((childPath, index, directives) => {
      parts.push(print());
      if (index < directives.length - 1 || nodeHasBody || nodeHasComment) {
        parts.push(hardline);
        if (isNextLineEmpty(childPath.getValue(), options)) {
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
    const parent = path.getParentNode();
    if (!parent || parent.type !== "ModuleExpression") {
      parts.push(hardline);
    }
  }

  return parts;
}

export { printBlock, printBlockBody };

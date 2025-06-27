import { hardline, join } from "../../document/builders.js";
import { replaceEndOfLine } from "../../document/utils.js";
import { printComments } from "../../main/comments/print.js";
import { locEnd, locStart } from "../loc.js";
import { getComments } from "../utils/index.js";
import isBlockComment from "../utils/is-block-comment.js";
import isIndentableBlockComment from "../utils/is-indentable-block-comment.js";
import isJsdocParamComment from "../utils/is-jsdoc-param-comment.js";
import isLineComment from "../utils/is-line-comment.js";

/** @import AstPath from "../../common/ast-path.js" */
/** @import { Doc } from "../../index.js" */

function printComment(commentPath, options) {
  const comment = commentPath.node;

  if (isLineComment(comment)) {
    // Supports `//`, `#!`, `<!--`, and `-->`
    return options.originalText
      .slice(locStart(comment), locEnd(comment))
      .trimEnd();
  }

  if (isIndentableBlockComment(comment)) {
    return printIndentableBlockComment(comment);
  }

  if (isBlockComment(comment)) {
    return ["/*", replaceEndOfLine(comment.value), "*/"];
  }

  /* c8 ignore next */
  throw new Error("Not a comment: " + JSON.stringify(comment));
}

/**
 * Some comments need to stay attached to their original AST node, for
 * example JSDoc's `@param`. These comments are printed early, before
 * parentheses are inserted.
 * @param {AstPath} path
 * @param {Doc} doc
 * @param {*} options
 */
function printUnmovableComments(path, doc, options) {
  const comments = getComments(path.node);
  const hasUnmovableComments = comments.some(isJsdocParamComment);

  if (hasUnmovableComments) {
    doc = printComments(path, doc, options);
    for (const comment of comments) {
      options[Symbol.for("printedComments")].add(comment);
    }
  }

  return doc;
}

function printIndentableBlockComment(comment) {
  const lines = comment.value.split("\n");

  return [
    "/*",
    join(
      hardline,
      lines.map((line, index) =>
        index === 0
          ? line.trimEnd()
          : " " + (index < lines.length - 1 ? line.trim() : line.trimStart()),
      ),
    ),
    "*/",
  ];
}

export { printComment, printUnmovableComments };

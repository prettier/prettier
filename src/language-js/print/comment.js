import { hardline, join, replaceEndOfLine } from "../../document/index.js";
import { printComments } from "../../main/comments/print.js";
import { locEnd, locStart } from "../loc.js";
import isBlockComment from "../utilities/is-block-comment.js";
import isIndentableBlockComment from "../utilities/is-indentable-block-comment.js";
import isLineComment from "../utilities/is-line-comment.js";
import { getComments } from "../utilities/index.js";
import isJsdocParamComment from "../utilities/is-jsdoc-param-comment.js";

/** @import AstPath from "../../common/ast-path.js" */
/** @import { Doc } from "../../index.js" */

function printComment(path, options) {
  const comment = path.node;

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

import { hardline, join } from "../../document/builders.js";
import { replaceEndOfLine } from "../../document/utils.js";
import { locEnd, locStart } from "../loc.js";
import isBlockComment from "../utils/is-block-comment.js";
import isIndentableBlockComment from "../utils/is-indentable-block-comment.js";
import isLineComment from "../utils/is-line-comment.js";

function printComment(commentPath, options) {
  const comment = commentPath.node;

  if (isLineComment(comment)) {
    // Supports `//`, `#!`, `<!--`, and `-->`
    return options.originalText
      .slice(locStart(comment), locEnd(comment))
      .trimEnd();
  }

  if (isBlockComment(comment)) {
    if (isIndentableBlockComment(comment)) {
      return printIndentableBlockComment(comment);
    }

    return ["/*", replaceEndOfLine(comment.value), "*/"];
  }

  /* c8 ignore next */
  throw new Error("Not a comment: " + JSON.stringify(comment));
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

export { printComment };

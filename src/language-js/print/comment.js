import {
  hardline,
  literalline,
  markAsRoot,
  replaceEndOfLine,
} from "../../document/index.js";
import { locEnd, locStart } from "../loc.js";
import { isBlockComment } from "../utilities/is-block-comment.js";
import isIndentableBlockComment from "../utilities/is-indentable-block-comment.js";
import { isLineComment } from "../utilities/is-line-comment.js";

/**
@import {Doc} from "../../document/index.js"
@import {Comment} from "../types/estree.js"
*/

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
@param {Comment} comment
@returns {Doc}
*/
function printIndentableBlockComment(comment) {
  const lines = comment.value.split("\n");
  const isJsdoc = comment.value[0] === "*" && comment.value[1] !== "*";

  return [
    "/*",
    lines.map((line, index) => {
      if (index === 0) {
        return [line.trimEnd(), hardline];
      }

      if (index === lines.length - 1) {
        return [" ", line.trimStart()];
      }

      const trimmed = line.trim();
      const content = [" ", trimmed];
      if (isJsdoc && trimmed !== "*" && line.endsWith("  ")) {
        return [content, "  ", markAsRoot(literalline)];
      }

      return [content, hardline];
    }),
    "*/",
  ];
}

export { printComment };

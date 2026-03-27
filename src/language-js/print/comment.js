import {
  hardline,
  literalline,
  markAsRoot,
  replaceEndOfLine,
} from "../../document/index.js";
import { locEnd, locStart } from "../location/index.js";
import { isBlockComment, isLineComment } from "../utilities/comment-types.js";
import isIndentableBlockComment, {
  indentableLines,
} from "../utilities/is-indentable-block-comment.js";

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
  const lines = indentableLines(comment);
  const isJsdoc = comment.value[0] === "*" && comment.value[1] !== "*";

  return [
    "/",
    lines.map((line, index) => {
      if (index === 0) {
        return [line.trimEnd(), hardline];
      }

      if (index === lines.length - 1) {
        return [" ", line];
      }

      const trimmed = line.trimEnd();
      const content = [" ", trimmed];
      if (isJsdoc && trimmed !== "*" && line.endsWith("  ")) {
        return [content, "  ", markAsRoot(literalline)];
      }

      return [content, hardline];
    }),
    "/",
  ];
}

export { printComment };

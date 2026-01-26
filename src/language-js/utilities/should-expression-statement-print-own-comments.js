import { shouldPrintLeadingSemicolon } from "../semicolon/semicolon.js";
import { CommentCheckFlags, getComments } from "./index.js";
import isTypeCastComment from "./is-type-cast-comment.js";

function shouldExpressionStatementPrintOwnComments(path, options) {
  if (!shouldPrintLeadingSemicolon(path, options)) {
    return false;
  }

  // Note: this causes the following print differently
  // `;/** @type {string[]} */ ([]).forEach(foo)`
  // `;/* normal comment */ ([]).forEach(foo)`
  // We may want consider remove the `isTypeCastComment` check
  const comments = getComments(path.node, CommentCheckFlags.Leading);
  if (comments.length === 1 && isTypeCastComment(comments[0])) {
    return true;
  }

  return false;
}

export { shouldExpressionStatementPrintOwnComments };

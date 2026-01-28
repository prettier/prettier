import { shouldExpressionStatementPrintLeadingSemicolon } from "../semicolon/semicolon.js";
import { CommentCheckFlags, getComments } from "./comments.js";
import { isTypeCastComment } from "./is-type-cast-comment.js";

function shouldExpressionStatementPrintOwnComments(path, options) {
  if (!shouldExpressionStatementPrintLeadingSemicolon(path, options)) {
    return false;
  }

  // Note: this causes the following print differently
  // `;/** @type {string[]} */ ([]).forEach(foo)`
  // `;/* normal comment */ ([]).forEach(foo)`
  // We may want consider remove the `isTypeCastComment` check
  const lastComment = getComments(path.node, CommentCheckFlags.Leading).at(-1);
  if (lastComment && isTypeCastComment(lastComment)) {
    return true;
  }

  return false;
}

export { shouldExpressionStatementPrintOwnComments };

import { shouldPrintLeadingSemicolon } from "../semicolon/semicolon.js";
import { CommentCheckFlags, getComments } from "./index.js";
import isTypeCastComment from "./is-type-cast-comment.js";

function shouldExpressionStatementPrintOwnComments(path, options) {
  if (!shouldPrintLeadingSemicolon(path, options)) {
    return true;
  }

  const comments = getComments(path.node, CommentCheckFlags.Leading);
  if (comments.length === 1 && isTypeCastComment(comments[0])) {
    return true;
  }

  return false;
}

export { shouldExpressionStatementPrintOwnComments };

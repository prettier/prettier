import {
  shouldExpressionStatementPrintLeadingSemicolon,
  shouldIgnoredExpressionStatementPrintLeadingSemicolon,
} from "../semicolon/semicolon.js";
import { CommentCheckFlags, getComments } from "./comments.js";
import { isTypeCastComment } from "./is-type-cast-comment.js";

function shouldExpressionStatementPrintOwnComments(path, options) {
  if (!shouldExpressionStatementPrintLeadingSemicolon(path, options)) {
    return false;
  }

  return isLastLeadingCommentTypeCast(path.node);
}

// A `prettier-ignore`d statement prints `;` before its verbatim text,
// which would separate the type cast comment from the parenthesized expression
function shouldIgnoredExpressionStatementPrintOwnComments(path, options) {
  return (
    path.node.type === "ExpressionStatement" &&
    shouldIgnoredExpressionStatementPrintLeadingSemicolon(path, options) &&
    isLastLeadingCommentTypeCast(path.node)
  );
}

// Note: this causes the following print differently
// `;/** @type {string[]} */ ([]).forEach(foo)`
// `;/* normal comment */ ([]).forEach(foo)`
// We may want consider remove the `isTypeCastComment` check
function isLastLeadingCommentTypeCast(node) {
  const lastComment = getComments(node, CommentCheckFlags.Leading).at(-1);
  return Boolean(lastComment && isTypeCastComment(lastComment));
}

export {
  shouldExpressionStatementPrintOwnComments,
  shouldIgnoredExpressionStatementPrintOwnComments,
};

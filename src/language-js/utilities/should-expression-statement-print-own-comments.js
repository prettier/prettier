import {
  getTrailingTypeCastComment,
  shouldExpressionStatementPrintLeadingSemicolon,
} from "../semicolon/semicolon.js";

function shouldExpressionStatementPrintOwnComments(path, options) {
  if (!shouldExpressionStatementPrintLeadingSemicolon(path, options)) {
    return false;
  }

  // Note: this causes the following print differently
  // `;/** @type {string[]} */ ([]).forEach(foo)`
  // `;/* normal comment */ ([]).forEach(foo)`
  // We may want consider remove the `isTypeCastComment` check
  return Boolean(getTrailingTypeCastComment(path.node));
}

export { shouldExpressionStatementPrintOwnComments };

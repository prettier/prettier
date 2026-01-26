import {
  printComments,
  printCommentsSeparately,
} from "../../main/comments/print.js";
import {
  isSingleHtmlEventHandlerExpressionStatement,
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
  shouldExpressionStatementPrintLeadingSemicolon,
} from "../semicolon/semicolon.js";
import { CommentCheckFlags, getComments } from "../utilities/index.js";
import isTypeCastComment from "../utilities/is-type-cast-comment.js";
import {
  isVueEventBindingFunctionExpression,
  isVueEventBindingMemberExpression,
  unwrapVueEventBindingTsNode,
} from "../utilities/vue-event-binding.js";

/**
@import {Doc} from "../../document/index.js"
*/

function shouldPrintSemicolon(path, options) {
  if (isSingleVueEventBindingExpressionStatement(path, options)) {
    const expression = unwrapVueEventBindingTsNode(path.node.expression);
    return (
      isVueEventBindingFunctionExpression(expression) ||
      isVueEventBindingMemberExpression(expression)
    );
  }

  if (!options.semi) {
    return false;
  }

  if (
    // Do not append semicolon after the only JSX element in a program
    isSingleJsxExpressionStatementInMarkdown(path, options) ||
    // Do not append semicolon after the only HTML event binding expression in a program
    isSingleHtmlEventHandlerExpressionStatement(path, options)
  ) {
    return false;
  }

  return true;
}

function printExpressionStatement(path, options, print) {
  const expressionDoc = print("expression");

  if (!shouldExpressionStatementPrintLeadingSemicolon(path, options)) {
    return shouldPrintSemicolon(path, options)
      ? [expressionDoc, ";"]
      : expressionDoc;
  }

  /** @type {Doc[]} */
  const parts = [";"];
  const { node } = path;
  // Note: this causes the following print differently
  // `;/** @type {string[]} */ ([]).forEach(foo)`
  // `;/* normal comment */ ([]).forEach(foo)`
  // We may want consider just check it's a block comment on same line
  const lastComment = getComments(node, CommentCheckFlags.Leading).at(-1);
  if (lastComment && isTypeCastComment(lastComment)) {
    // We have to print the last comment separately

    // eslint-disable-next-line prettier-internal-rules/no-node-comments
    const { comments } = node;
    // eslint-disable-next-line prettier-internal-rules/no-node-comments
    node.comments = [lastComment];
    parts.push(printCommentsSeparately(path, options).leading);
    // eslint-disable-next-line prettier-internal-rules/no-node-comments
    node.comments = comments;

    // Make it printed, so `printComments` will ignore it
    options[Symbol.for("printedComments")].add(lastComment);
  }

  return printComments(path, [...parts, expressionDoc], options);
}

export { printExpressionStatement };

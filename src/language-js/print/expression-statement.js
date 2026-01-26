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
import { shouldExpressionStatementPrintOwnComments } from "../utilities/should-expression-statement-print-own-comments.js";
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
  /** @type {Doc[]} */
  const parts = [print("expression")];

  if (shouldExpressionStatementPrintLeadingSemicolon(path, options)) {
    if (shouldExpressionStatementPrintOwnComments(path, options)) {
      const { node } = path;
      const typeCastComment = getComments(node, CommentCheckFlags.Leading).at(
        -1,
      );

      // We have to print the last comment separately
      // eslint-disable-next-line prettier-internal-rules/no-node-comments
      const { comments } = node;
      // eslint-disable-next-line prettier-internal-rules/no-node-comments
      node.comments = [typeCastComment];
      const typeCastCommentDoc = printCommentsSeparately(path, options).leading;
      // eslint-disable-next-line prettier-internal-rules/no-node-comments
      node.comments = comments;

      // Make it printed, so `printComments` will ignore it
      options[Symbol.for("printedComments")].add(typeCastComment);
      return printComments(path, [";", typeCastCommentDoc, ...parts], options);
    }

    parts.unshift(";");
  } else if (shouldPrintSemicolon(path, options)) {
    parts.push(";");
  }

  return parts;
}

export { printExpressionStatement };

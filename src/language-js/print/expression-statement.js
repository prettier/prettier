import {
  printComments,
  printLeadingComments,
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

      // Print the type cast comment separately and print `;` before it
      const typeCastCommentDoc = printLeadingComments(path, options, {
        filter: (comment) => comment === typeCastComment,
      });

      return printComments(path, [";", typeCastCommentDoc, ...parts], options, {
        filter: (comment) => comment !== typeCastComment,
      });
    }

    parts.unshift(";");
  } else if (shouldPrintSemicolon(path, options)) {
    parts.push(";");
  }

  return parts;
}

export { printExpressionStatement };

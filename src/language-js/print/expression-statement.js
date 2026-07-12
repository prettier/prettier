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
import { CommentCheckFlags, getComments } from "../utilities/comments.js";
import { isTypeCastComment } from "../utilities/is-type-cast-comment.js";
import {
  getLeftSidePathName,
  hasNakedLeftSide,
} from "../utilities/left-side.js";
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
  const shouldPrintLeadingSemicolon =
    shouldExpressionStatementPrintLeadingSemicolon(path, options);
  const shouldPrintOwnComments = shouldExpressionStatementPrintOwnComments(
    path,
    options,
  );
  const leftSideComments =
    shouldPrintLeadingSemicolon && !shouldPrintOwnComments
      ? path.call(function printLeftSideComments() {
          if (hasNakedLeftSide(path.node)) {
            return path.call(
              printLeftSideComments,
              ...getLeftSidePathName(path.node),
            );
          }

          const comments = getComments(path.node, CommentCheckFlags.Leading);
          if (comments.length > 0 && isTypeCastComment(comments.at(-1))) {
            return "";
          }
          const doc = printLeadingComments(path, options);
          const printedComments = options[Symbol.for("printedComments")];
          for (const comment of comments) {
            printedComments.add(comment);
          }
          return doc;
        }, "expression")
      : "";
  /** @type {Doc[]} */
  const parts = [print("expression")];

  if (shouldPrintLeadingSemicolon) {
    if (shouldPrintOwnComments) {
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

    parts.unshift(leftSideComments, ";");
  } else if (shouldPrintSemicolon(path, options)) {
    parts.push(";");
  }

  return parts;
}

export { printExpressionStatement };

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
import {
  CommentCheckFlags,
  getComments,
  hasComment,
} from "../utilities/comments.js";
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

function printLeftSideLeadingComments(path, options) {
  const filter = (comment) => !isTypeCastComment(comment);

  if (hasComment(path.node, CommentCheckFlags.Leading, filter)) {
    const comments = getComments(path.node, CommentCheckFlags.Leading, filter);
    const doc = printLeadingComments(path, options, { filter });
    const printedComments = options[Symbol.for("printedComments")];
    for (const comment of comments) {
      printedComments.add(comment);
    }
    return doc;
  }

  if (hasNakedLeftSide(path.node)) {
    return path.call(
      () => printLeftSideLeadingComments(path, options),
      ...getLeftSidePathName(path.node),
    );
  }

  return "";
}

function printExpressionStatement(path, options, print) {
  if (shouldExpressionStatementPrintLeadingSemicolon(path, options)) {
    const leadingComments = path.call(
      () => printLeftSideLeadingComments(path, options),
      "expression",
    );
    if (leadingComments) {
      return [leadingComments, ";", print("expression")];
    }

    if (shouldExpressionStatementPrintOwnComments(path, options)) {
      const { node } = path;
      const typeCastComment = getComments(node, CommentCheckFlags.Leading).at(
        -1,
      );

      // Print the type cast comment separately and print `;` before it
      const typeCastCommentDoc = printLeadingComments(path, options, {
        filter: (comment) => comment === typeCastComment,
      });

      return printComments(
        path,
        [";", typeCastCommentDoc, print("expression")],
        options,
        {
          filter: (comment) => comment !== typeCastComment,
        },
      );
    }

    return [";", print("expression")];
  }

  return [print("expression"), shouldPrintSemicolon(path, options) ? ";" : ""];
}

export { printExpressionStatement };

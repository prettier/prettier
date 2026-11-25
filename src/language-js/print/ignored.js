import { indent, softline } from "../../document/index.js";
import {
  printComments,
  printLeadingComments,
} from "../../main/comments/print.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../location/index.js";
import { shouldIgnoredExpressionStatementPrintLeadingSemicolon } from "../semicolon/semicolon.js";
import { shouldIgnoredNodePrintSemicolon } from "../semicolon/should-ignored-node-print-semicolon.js";
import { CommentCheckFlags, getComments } from "../utilities/comments.js";
import { shouldIgnoredExpressionStatementPrintOwnComments } from "../utilities/should-expression-statement-print-own-comments.js";

function printIgnored(path, options /* , print*/) {
  const { node } = path;
  let text = options.originalText.slice(locStart(node), locEnd(node));

  if (options.semi) {
    if (shouldIgnoredNodePrintSemicolon(path)) {
      text += ";";
    }
  } else if (shouldIgnoredExpressionStatementPrintOwnComments(path, options)) {
    // Print `;` before the type cast comment, as `printExpressionStatement` does
    const typeCastComment = getComments(node, CommentCheckFlags.Leading).at(-1);
    const typeCastCommentDoc = printLeadingComments(path, options, {
      filter: (comment) => comment === typeCastComment,
    });

    return printComments(path, [";", typeCastCommentDoc, text], options, {
      filter: (comment) => comment !== typeCastComment,
    });
  } else if (
    shouldIgnoredExpressionStatementPrintLeadingSemicolon(path, options)
  ) {
    text = `;${text}`;
  }

  if (node.type === "ClassExpression" && isNonEmptyArray(node.decorators)) {
    return [indent([softline, text]), softline];
  }

  return text;
}

export { printIgnored };

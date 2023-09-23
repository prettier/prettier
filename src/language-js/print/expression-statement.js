import { printDanglingComments } from "../../main/comments/print.js";
import {
  markerForIfWithoutBlockAndSameLineComment,
  hasComment,
  CommentCheckFlags,
} from "../utils/index.js";
import {
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
  isVueEventBindingExpression,
} from "./semicolon.js";

function printExpressionStatement(path, options, print) {
  const parts = [print("expression")];

  if (isSingleVueEventBindingExpressionStatement(path, options)) {
    if (isVueEventBindingExpression(path.node.expression)) {
      parts.push(";");
    }
  } else if (isSingleJsxExpressionStatementInMarkdown(path, options)) {
    // Do not append semicolon after the only JSX element in a program
  } else if (options.semi) {
    parts.push(";");
  }

  if (
    hasComment(
      path.node,
      CommentCheckFlags.Dangling,
      ({ marker }) => marker === markerForIfWithoutBlockAndSameLineComment,
    )
  ) {
    parts.push(
      " ",
      printDanglingComments(path, options, {
        marker: markerForIfWithoutBlockAndSameLineComment,
      }),
    );
  }

  return parts;
}

export { printExpressionStatement };

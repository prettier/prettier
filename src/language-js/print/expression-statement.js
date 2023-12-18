import { printDanglingComments } from "../../main/comments/print.js";
import { CommentCheckFlags, hasComment } from "../utils/index.js";
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

  return parts;
}

export { printExpressionStatement };

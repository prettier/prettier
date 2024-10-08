import {
  isVueEventBindingFunctionExpression,
  isVueEventBindingMemberExpression,
} from "../utils/vue-event-binding.js";
import {
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
} from "./semicolon.js";

function printExpressionStatement(path, options, print) {
  const parts = [print("expression")];

  if (isSingleVueEventBindingExpressionStatement(path, options)) {
    const { expression } = path.node;
    if (
      isVueEventBindingFunctionExpression(expression) ||
      isVueEventBindingMemberExpression(expression)
    ) {
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

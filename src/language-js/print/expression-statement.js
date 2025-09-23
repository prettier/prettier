import {
  isVueEventBindingFunctionExpression,
  isVueEventBindingMemberExpression,
  unwrapVueEventBindingTsNode,
} from "../utils/vue-event-binding.js";
import {
  isSingleHtmlEventHandlerExpressionStatement,
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
} from "./semicolon.js";

function printExpressionStatement(path, options, print) {
  const parts = [print("expression")];

  if (isSingleVueEventBindingExpressionStatement(path, options)) {
    const expression = unwrapVueEventBindingTsNode(path.node.expression);
    if (
      isVueEventBindingFunctionExpression(expression) ||
      isVueEventBindingMemberExpression(expression)
    ) {
      parts.push(";");
    }
  } else if (
    options.semi &&
    !(
      //Do not append semicolon after the only JSX element in a program
      (
        isSingleJsxExpressionStatementInMarkdown(path, options) ||
        // Do not append semicolon after the only HTML event binding expression in a program
        isSingleHtmlEventHandlerExpressionStatement(path, options)
      )
    )
  ) {
    parts.push(";");
  }

  return parts;
}

export { printExpressionStatement };

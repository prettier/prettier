import {
  isVueEventBindingFunctionExpression,
  isVueEventBindingMemberExpression,
  unwrapVueEventBindingTsNode,
} from "../utils/vue-event-binding.js";
import {
  isSingleHTMLEventBindingExpressionStatement,
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
  } else if (isSingleJsxExpressionStatementInMarkdown(path, options)) {
    // Do not append semicolon after the only JSX element in a program
  } else if(isSingleHTMLEventBindingExpressionStatement(path, options)){
    // Do not append semicolon after the only HTML event binding expression in a program
  }
  else if (options.semi) {
    parts.push(";");
  }

  return parts;
}

export { printExpressionStatement };

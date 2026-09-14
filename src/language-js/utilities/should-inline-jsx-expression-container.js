import { hasComment } from "./comments.js";
import {
  isArrayExpression,
  isBinaryish,
  isCallExpression,
  isJsxElement,
  isObjectExpression,
} from "./node-types.js";
import { stripChainElementWrappers } from "./strip-chain-element-wrappers.js";

function shouldInlineJsxExpressionContainer(node, parent) {
  return (
    node.type === "JSXEmptyExpression" ||
    (!hasComment(node) &&
      (isArrayExpression(node) ||
        isObjectExpression(node) ||
        node.type === "ArrowFunctionExpression" ||
        (node.type === "AwaitExpression" &&
          (shouldInlineJsxExpressionContainer(node.argument, node) ||
            node.argument.type === "JSXElement")) ||
        isCallExpression(stripChainElementWrappers(node)) ||
        node.type === "FunctionExpression" ||
        node.type === "TemplateLiteral" ||
        node.type === "TaggedTemplateExpression" ||
        node.type === "DoExpression" ||
        (isJsxElement(parent) &&
          (node.type === "ConditionalExpression" || isBinaryish(node)))))
  );
}

export { shouldInlineJsxExpressionContainer };

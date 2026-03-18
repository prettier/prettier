import getStringWidth from "../../utilities/get-string-width.js";
import {
  isArrayExpression,
  isCallLikeExpression,
  isLiteral,
  isMemberExpression,
  isObjectExpression,
  isRegExpLiteral,
} from "./node-types.js";
import { stripChainElementWrappers } from "./strip-chain-element-wrappers.js";

const isSingleWordType = (node) =>
  node.type === "Identifier" ||
  node.type === "ThisExpression" ||
  node.type === "Super" ||
  node.type === "PrivateName" ||
  node.type === "PrivateIdentifier";

function isSimpleRhs(node) {
  node = stripChainElementWrappers(node);

  if (
    isLiteral(node) ||
    isSingleWordType(node) ||
    node.type === "ArgumentPlaceholder"
  ) {
    return true;
  }

  if (isRegExpLiteral(node)) {
    return (
      // @ts-expect-error -- safe
      getStringWidth(node.pattern ?? node.regex.pattern) <= 5
    );
  }

  if (node.type === "TemplateLiteral") {
    return (
      node.quasis.every((element) => !element.value.raw.includes("\n")) &&
      node.expressions.every(isSimpleRhs)
    );
  }

  if (isObjectExpression(node)) {
    return node.properties.every(
      (property) =>
        !property.computed &&
        (property.shorthand || (property.value && isSimpleRhs(property.value)))
    );
  }

  if (isArrayExpression(node)) {
    return node.elements.every((x) => x === null || isSimpleRhs(x));
  }

  if (isCallLikeExpression(node)) {
    return false;
  }

  if (isMemberExpression(node)) {
    return isSimpleRhs(node.object) && isSimpleRhs(node.property);
  }

  return false;
}

export { isSimpleRhs };

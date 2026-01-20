import { createTypeCheckFunction } from "../utilities/index.js";

/**
@import AstPath from "../../common/ast-path.js"
*/

function shouldAddParenthesesToChainExpression(path) {
  const { key, parent } = path;

  return (
    (key === "expression" && parent.type === "TSNonNullExpression") ||
    (key === "object" &&
      parent.type === "MemberExpression" &&
      !parent.optional) ||
    (key === "callee" &&
      parent.type === "CallExpression" &&
      !parent.optional) ||
    (key === "callee" && parent.type === "NewExpression") ||
    (key === "tag" && parent.type === "TaggedTemplateExpression")
  );
}

const isParenthesized = (node) => node.extra?.parenthesized;
const isBabelOptionalChainElement = createTypeCheckFunction([
  "OptionalCallExpression",
  "OptionalMemberExpression",
]);
const isInBabelOptionalChain = ({ key, parent }) =>
  (key === "object" && parent.type === "OptionalMemberExpression") ||
  (key === "callee" && parent.type === "OptionalCallExpression");

/**
@param {AstPath} path
*/
function isBabelChainExpressionRoot(path) {
  const { node } = path;

  const children = [node];
  let child = node;
  while (child.type === "TSNonNullExpression") {
    child = child.expression;
    children.unshift(child);
  }

  if (!isBabelOptionalChainElement(child)) {
    return false;
  }

  const firstParenthesized = children.find((node) => isParenthesized(node));

  if (firstParenthesized) {
    return firstParenthesized === node;
  }

  return !(
    isInBabelOptionalChain(path) ||
    (path.key === "expression" && path.parent.type === "TSNonNullExpression")
  );
}

/**
@param {AstPath} path
@returns {boolean}
*/
function shouldAddParenthesesToChainElement(path) {
  return (
    (path.node.type === "ChainExpression" ||
      isBabelChainExpressionRoot(path)) &&
    shouldAddParenthesesToChainExpression(path)
  );
}

export { shouldAddParenthesesToChainElement };

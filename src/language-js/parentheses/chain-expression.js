import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";

/**
@import AstPath from "../../common/ast-path.js"
*/

function shouldAddParenthesesToChainExpression(path) {
  const { key, parent } = path;

  return (
    (key === "expression" &&
      (parent.type === "TSNonNullExpression" ||
        parent.type === "TSInstantiationExpression")) ||
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

/**
@param {AstPath} path
*/
function isBabelOptionalChainRoot(path) {
  const { node } = path;

  let child = node;
  while (child.type === "TSNonNullExpression") {
    child = child.expression;

    if (isParenthesized(child)) {
      return false;
    }
  }

  if (!isBabelOptionalChainElement(child)) {
    return false;
  }

  if (isParenthesized(node)) {
    return true;
  }

  return !(
    path.key === "expression" && path.parent.type === "TSNonNullExpression"
    // We should exclude if it's in `OptionalCallExpression` or `OptionalMemberExpression`
    // But in these cases it should not matter, since we don't need parentheses anyway
  );
}

/**
@param {AstPath} path
@returns {boolean}
*/
function shouldAddParenthesesToChainElement(path) {
  return (
    isChainExpressionRoot(path) && shouldAddParenthesesToChainExpression(path)
  );
}

function isChainExpressionRoot(path) {
  return path.node.type === "ChainExpression" || isBabelOptionalChainRoot(path);
}

export { shouldAddParenthesesToChainElement };

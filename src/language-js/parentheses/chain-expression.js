import {
  createTypeCheckFunction,
  stripChainElementWrappers,
} from "../utilities/index.js";

/**
@import AstPath from "../../common/ast-path.js"
*/

function shouldAddParenthesesToChainExpression(path) {
  const { key, parent } = path;

  return (
    (key === "expression" && parent.type === "TSNonNullExpression") ||
    (key === "object" && parent.type === "MemberExpression") ||
    (key === "callee" && parent.type === "CallExpression") ||
    (key === "callee" && parent.type === "NewExpression") ||
    (key === "tag" && parent.type === "TaggedTemplateExpression")
  );
}

const isBabelOptionalChainElement = createTypeCheckFunction([
  "OptionalMemberExpression",
  "OptionalCallExpression",
]);

const isParenthesizedNonNullExpression = (node) =>
  node.type === "TSNonNullExpression" && node.extra?.parenthesized;

function shouldAddParenthesesToBebelOptionalChainElement(
  path,
  nonNullExpressions = [],
) {
  const { key, parent } = path;
  if (key === "expression" && parent.type === "TSNonNullExpression") {
    nonNullExpressions.push(parent);
    return path.callParent(() =>
      shouldAddParenthesesToBebelOptionalChainElement(path, nonNullExpressions),
    );
  }

  // If we need add parentheses, but parenthesized nonNullExpression will do it for us
  if (shouldAddParenthesesToChainExpression(path)) {
    if (nonNullExpressions.some((node) => node.extra?.parenthesized)) {
      return false;
    }

    return true;
  }

  return shouldAddParenthesesToChainExpression(path);
}

const isPossibleChainExpressionRoot = createTypeCheckFunction([
  "OptionalMemberExpression",
  "OptionalCallExpression",
  "TSNonNullExpression",
]);

/**
@param {AstPath} path
*/
function isChainExpressionRoot(path) {
  const { node } = path;

  // ESTree
  if (node.type === "ChainExpression") {
    return true;
  }

  // Babel
  if (!isBabelOptionalChainElement(stripChainElementWrappers(node))) {
    return false;
  }

  const { key, parent } = path;

  if (key === "object" && parent.type === "OptionalMemberExpression") {
    return false;
  }

  if (key === "callee" && parent.type === "OptionalCallExpression") {
    return false;
  }

  // if (
  //   key === "expression" &&
  //   node.type === "TSNonNullExpression" &&
  //   !node.extra?.parenthesized
  // ) {
  //   return false;
  // }

  return true;
}

/**
@param {AstPath} path
@returns {boolean}
*/
function shouldAddParenthesesToChainElement(path) {
  if (isChainExpressionRoot(path)) {
    return shouldAddParenthesesToChainExpression(path);
  }

  return false;

  // // Babel
  // if (isBabelOptionalChainElement(node)) {
  //   return shouldAddParenthesesToBebelOptionalChainElement(path);
  // }

  // // Babel, https://github.com/babel/babel/discussions/15077
  // if (
  //   isParenthesizedNonNullExpression(node) &&
  //   isBabelOptionalChainElement(node.expression)
  // ) {
  //   return shouldAddParenthesesToBebelOptionalChainElement(path);
  // }

  return false;
}

export { shouldAddParenthesesToChainElement };

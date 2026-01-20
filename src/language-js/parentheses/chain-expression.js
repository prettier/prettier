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

  if (
    !(
      child.type === "OptionalCallExpression" ||
      child.type === "OptionalMemberExpression"
    )
  ) {
    return false;
  }

  const firstParenthesized = children.find((node) => isParenthesized(node));

  if (firstParenthesized) {
    return firstParenthesized === node;
  }

  const { key, parent } = path;
  return !(
    (key === "expression" && parent.type === "TSNonNullExpression") ||
    (key === "object" && parent.type === "OptionalMemberExpression") ||
    (key === "callee" && parent.type === "OptionalCallExpression")
  );
}

function isFlowChainExpressionRoot(path) {
  const { key, node, parent } = path;

  return (
    (node.type === "OptionalCallExpression" ||
      node.type === "OptionalMemberExpression") &&
    !(
      (key === "object" && parent.type === "OptionalMemberExpression") ||
      (key === "callee" && parent.type === "OptionalCallExpression")
    )
  );
}

function isChainExpressionRoot(path, { parser }) {
  if (parser === "babel-ts" || parser === "babel") {
    return isBabelChainExpressionRoot(path);
  }

  if (parser === "flow") {
    return isFlowChainExpressionRoot(path);
  }

  return path.node.type === "ChainExpression";
}

/**
@param {AstPath} path
@returns {boolean}
*/
function shouldAddParenthesesToChainElement(path, options) {
  return (
    isChainExpressionRoot(path, options) &&
    shouldAddParenthesesToChainExpression(path)
  );
}

export { shouldAddParenthesesToChainElement };

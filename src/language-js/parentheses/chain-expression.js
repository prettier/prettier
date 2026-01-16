/**
@import AstPath from "../../common/ast-path.js"
*/

function shouldChainExpression(path) {
  const { key, parent } = path;

  return (
    (key === "expression" && parent.type === "TSNonNullExpression") ||
    (key === "object" && parent.type === "MemberExpression") ||
    (key === "callee" && parent.type === "CallExpression") ||
    (key === "callee" && parent.type === "NewExpression") ||
    (key === "tag" && parent.type === "TaggedTemplateExpression")
  );
}

/**
@param {AstPath} path
@returns {boolean}
*/
function shouldAddParenthesesToChainElement(path) {
  const { node } = path;

  // ESTree
  if (node.type === "ChainExpression") {
    return shouldChainExpression(path);
  }

  // Babel
  if (
    node.type === "OptionalMemberExpression" ||
    node.type === "OptionalCallExpression"
  ) {
    return shouldChainExpression(path);
  }

  // // Babel, https://github.com/babel/babel/discussions/15077
  // if (node.type === "TSNonNullExpression" && node.extra.parenthesized) {
  //   return true;
  // }

  return false;
}

export { shouldAddParenthesesToChainElement };

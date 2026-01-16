/**
@import AstPath from "../../common/ast-path.js"
*/

/**
@param {AstPath} path
@returns {boolean}
*/
function shouldAddParenthesesToChainElement(path) {
  const { node } = path;

  if (
    // ESTree
    node.type === "ChainExpression" ||
    // Babel
    node.type === "OptionalMemberExpression" ||
    node.type === "OptionalCallExpression"
  ) {
    const { key } = path;
    if (
      key === "object" &&
      path.findAncestor((node) => node.type !== "TSNonNullExpression").type ===
        "MemberExpression"
    ) {
      return true;
    }

    if (
      key === "callee" &&
      path.findAncestor((node) => node.type !== "TSNonNullExpression").type ===
        "CallExpression"
    ) {
      return true;
    }

    if (
      key === "callee" &&
      path.findAncestor((node) => node.type !== "TSNonNullExpression").type ===
        "NewExpression"
    ) {
      return true;
    }

    if (
      key === "tag" &&
      path.findAncestor((node) => node.type !== "TSNonNullExpression").type ===
        "TaggedTemplateExpression"
    ) {
      return true;
    }
  }

  // Babel, https://github.com/babel/babel/discussions/15077

  return false;
}

export { shouldAddParenthesesToChainElement };

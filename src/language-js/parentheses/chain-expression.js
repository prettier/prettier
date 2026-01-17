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

const isBabelOptionalChainElement = createTypeCheckFunction([
  "OptionalMemberExpression",
  "OptionalCallExpression",
]);

/**
@param {AstPath} path
*/
function isChainExpressionRoot(path) {
  const { node } = path;

  // ESTree
  if (node.type === "ChainExpression") {
    // console.log(node.expression);
    return true;
  }

  // Babel
  if (!isBabelOptionalChainElement(node)) {
    return false;
  }

  const { key, parent } = path;

  if (key === "object" && parent.type === "OptionalMemberExpression") {
    return false;
  }

  if (key === "callee" && parent.type === "OptionalCallExpression") {
    return false;
  }

  return true;
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

export { shouldAddParenthesesToChainElement };

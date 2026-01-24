import {
  isCallExpression,
  isChainElementWrapper,
  isMemberExpression,
} from "../utilities/index.js";

/**
@import {Node} from "../types/estree.js"
*/

/**
@param {Node} original
@param {any} cloned
*/
function cleanChainExpression(original, cloned) {
  // We don't add parentheses to `(a?.b)?.c`
  if (original.type === "ChainExpression") {
    cleanEstreeChainExpression(cloned);
  }

  if (
    original.type === "OptionalMemberExpression" ||
    original.type === "OptionalCallExpression"
  ) {
    cleanBabelChainExpression(cloned);
  }
}

/**
@param {Node} node
*/
function getChainElementProperty(node) {
  if (isMemberExpression(node)) {
    return "object";
  }

  if (isCallExpression(node)) {
    return "callee";
  }

  if (isChainElementWrapper(node)) {
    return "expression";
  }
}

/**
@param {Node} node
*/
function getChainElement(node) {
  const property = getChainElementProperty(node);
  if (property) {
    return node[property];
  }
}

/**
@param {Node} node
*/
function cleanEstreeChainExpression(node) {
  for (
    node = getChainElement(node);
    node.type === "MemberExpression" ||
    node.type === "CallExpression" ||
    node.type === "TSNonNullExpression";
    node = getChainElement(node)
  ) {
    const property = getChainElementProperty(node);
    const child = node[property];
    if (child.type === "ChainExpression") {
      node[property] = child.expression;
    }
  }
}

/**
@param {Node} node
*/
function cleanBabelChainExpression(node) {
  for (
    node = getChainElement(node);
    node.type === "MemberExpression" || node.type === "CallExpression";
    node = getChainElement(node)
  ) {
    node.type = `Optional${node.type}`;
  }
}

export { cleanChainExpression };

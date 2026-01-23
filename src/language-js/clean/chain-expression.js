import {
  isCallExpression,
  isChainElementWrapper,
  isMemberExpression,
} from "../utilities/index.js";

/**
@import {Node} from "../types/estree.js"
*/

function cleanChainExpression(cloned, original) {
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

function getChainElement(node) {
  const property = getChainElementProperty(node);
  if (property) {
    return node[property];
  }
}

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

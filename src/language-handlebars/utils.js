"use strict";

function isGlimmerComponent(node) {
  if (node.type !== "ElementNode") {
    return false;
  }

  const tagFirstChar = node.tag && node.tag[0];
  const isLocal = node.tag.includes(".");

  return tagFirstChar.toUpperCase() === tagFirstChar || isLocal;
}

function isWhitespaceNode(node) {
  return node.type === "TextNode" && !/\S/.test(node.chars);
}

function isNodeOfSomeType(node, types) {
  if (node) {
    return types.some(type => node.type === type);
  }
  return false;
}

function isParentOfSomeType(path, types) {
  const parentNode = path.getParentNode(0);
  return isNodeOfSomeType(parentNode, types);
}

function isPreviousNodeOfSomeType(path, types) {
  const previousNode = getPreviousNode(path);
  return isNodeOfSomeType(previousNode, types);
}

function isNextNodeOfSomeType(path, types) {
  const nextNode = getNextNode(path);
  return isNodeOfSomeType(nextNode, types);
}

function getPreviousNode(path, lookBack = 1) {
  const node = path.getValue();
  const parentNode = path.getParentNode(0);

  const children = parentNode && (parentNode.children || parentNode.body);
  if (children) {
    const nodeIndex = children.indexOf(node);
    if (nodeIndex > 0) {
      const previousNode = children[nodeIndex - lookBack];
      return previousNode;
    }
  }
}

function getNextNode(path) {
  const node = path.getValue();
  const parentNode = path.getParentNode(0);

  const children = parentNode.children || parentNode.body;
  if (children) {
    const nodeIndex = children.indexOf(node);
    if (nodeIndex < children.length) {
      const nextNode = children[nodeIndex + 1];
      return nextNode;
    }
  }
}

module.exports = {
  getPreviousNode,
  getNextNode,
  isNodeOfSomeType,
  isParentOfSomeType,
  isPreviousNodeOfSomeType,
  isNextNodeOfSomeType,
  isWhitespaceNode,
  isGlimmerComponent
};

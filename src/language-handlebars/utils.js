"use strict";

function getNextNode(path) {
  const node = path.getValue();
  const parentNode = path.getParentNode(0);
  const children = parentNode.children;

  if (children) {
    const nodeIndex = children.indexOf(node);
    if (nodeIndex < children.length) {
      const nextNode = children[nodeIndex + 1];
      return nextNode;
    }
  }
}

function getPreviousNode(path) {
  const node = path.getValue();
  const parentNode = path.getParentNode(0);
  const children = parentNode.children;

  if (children) {
    const nodeIndex = children.indexOf(node);
    if (nodeIndex > 0) {
      const previousNode = children[nodeIndex - 1];
      return previousNode;
    }
  }
}

function isPreviousNodeOfSomeType(path, types) {
  const previousNode = getPreviousNode(path);

  if (previousNode) {
    return types.some(type => previousNode.type === type);
  }
  return false;
}

function isPreviousNodeOfType(path, type) {
  return isPreviousNodeOfSomeType(path, [type]);
}

function isNextNodeOfType(path, type) {
  const nextNode = getNextNode(path);
  return nextNode && nextNode.type === type;
}

module.exports = {
  getNextNode,
  getPreviousNode,
  isPreviousNodeOfSomeType,
  isPreviousNodeOfType,
  isNextNodeOfType
};

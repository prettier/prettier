"use strict";

const htmlVoidElements = require("html-void-elements");

function isLastNodeOfSiblings(path) {
  const node = path.getValue();
  const parentNode = path.getParentNode(0);

  if (
    isParentOfSomeType(path, ["ElementNode"]) &&
    parentNode.children[parentNode.children.length - 1] === node
  ) {
    return true;
  }

  if (
    isParentOfSomeType(path, ["Block"]) &&
    parentNode.body[parentNode.body.length - 1] === node
  ) {
    return true;
  }

  return false;
}

function isUppercase(string) {
  return string.toUpperCase() === string;
}

function isGlimmerComponent(node) {
  return (
    isNodeOfSomeType(node, ["ElementNode"]) &&
    typeof node.tag === "string" &&
    (isUppercase(node.tag[0]) || node.tag.includes("."))
  );
}

const voidTags = new Set(htmlVoidElements);
function isVoid(node) {
  return (
    (isGlimmerComponent(node) &&
      node.children.every((n) => isWhitespaceNode(n))) ||
    voidTags.has(node.tag)
  );
}

function isWhitespaceNode(node) {
  return isNodeOfSomeType(node, ["TextNode"]) && !/\S/.test(node.chars);
}

function isNodeOfSomeType(node, types) {
  return node && types.some((type) => node.type === type);
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

function getSiblingNode(path, offset) {
  const node = path.getValue();
  const parentNode = path.getParentNode(0) || {};
  const children =
    parentNode.children || parentNode.body || parentNode.parts || [];
  const index = children.indexOf(node);
  return index !== -1 && children[index + offset];
}

function getPreviousNode(path, lookBack = 1) {
  return getSiblingNode(path, -lookBack);
}

function getNextNode(path) {
  return getSiblingNode(path, 1);
}

function isPrettierIgnoreNode(node) {
  return (
    isNodeOfSomeType(node, ["MustacheCommentStatement"]) &&
    typeof node.value === "string" &&
    node.value.trim() === "prettier-ignore"
  );
}

function hasPrettierIgnore(path) {
  const node = path.getValue();
  const previousPreviousNode = getPreviousNode(path, 2);
  return (
    isPrettierIgnoreNode(node) || isPrettierIgnoreNode(previousPreviousNode)
  );
}

module.exports = {
  getNextNode,
  getPreviousNode,
  hasPrettierIgnore,
  isLastNodeOfSiblings,
  isNextNodeOfSomeType,
  isNodeOfSomeType,
  isParentOfSomeType,
  isPreviousNodeOfSomeType,
  isVoid,
  isWhitespaceNode,
};

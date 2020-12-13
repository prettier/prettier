"use strict";

const htmlVoidElements = require("html-void-elements");

const isUppercase = (string) => string.toUpperCase() === string;

const isGlimmerComponent = (node) =>
  isNodeOfSomeType(node, ["ElementNode"]) &&
  typeof node.tag === "string" &&
  (isUppercase(node.tag[0]) || node.tag.includes("."));

const voidTags = new Set(htmlVoidElements);
const isVoid = (node) =>
  (isGlimmerComponent(node) &&
    node.children.every((n) => isWhitespaceNode(n))) ||
  voidTags.has(node.tag);

const isWhitespaceNode = (node) =>
  isNodeOfSomeType(node, ["TextNode"]) && !/\S/.test(node.chars);

const isNodeOfSomeType = (node, types) =>
  node && types.some((type) => node.type === type);

const isParentOfSomeType = (path, types) => {
  const parentNode = path.getParentNode(0);
  return isNodeOfSomeType(parentNode, types);
};

const isPreviousNodeOfSomeType = (path, types) => {
  const previousNode = getPreviousNode(path);
  return isNodeOfSomeType(previousNode, types);
};

const isNextNodeOfSomeType = (path, types) => {
  const nextNode = getNextNode(path);
  return isNodeOfSomeType(nextNode, types);
};

const getSiblingNode = (path, offset) => {
  const node = path.getValue();
  const parentNode = path.getParentNode(0) || {};
  const children =
    parentNode.children || parentNode.body || parentNode.parts || [];
  const index = children.indexOf(node);
  return index !== -1 && children[index + offset];
};

const getPreviousNode = (path, lookBack = 1) => getSiblingNode(path, -lookBack);

const getNextNode = (path) => getSiblingNode(path, 1);

const isPrettierIgnoreNode = (node) =>
  isNodeOfSomeType(node, ["MustacheCommentStatement"]) &&
  typeof node.value === "string" &&
  node.value.trim() === "prettier-ignore";

const hasPrettierIgnore = (path) => {
  const node = path.getValue();
  const previousPreviousNode = getPreviousNode(path, 2);
  return (
    isPrettierIgnoreNode(node) || isPrettierIgnoreNode(previousPreviousNode)
  );
};

module.exports = {
  getNextNode,
  getPreviousNode,
  hasPrettierIgnore,
  isNextNodeOfSomeType,
  isNodeOfSomeType,
  isParentOfSomeType,
  isPreviousNodeOfSomeType,
  isVoid,
  isWhitespaceNode,
};

"use strict";

function hasPrettierIgnore(path) {
  const node = path.getValue();

  if (isWhitespaceOnlyText(node) || node.type === "attribute") {
    return false;
  }

  const parentNode = path.getParentNode();

  if (!parentNode) {
    return false;
  }

  const index = path.getName();

  if (index === 0) {
    return false;
  }

  const prevNode = parentNode.children[index - 1];

  if (isPrettierIgnore(prevNode)) {
    return true;
  }

  if (!isWhitespaceOnlyText(prevNode)) {
    return false;
  }

  const prevPrevNode = parentNode.children[index - 2];
  return prevPrevNode && isPrettierIgnore(prevPrevNode);
}

function isPrettierIgnore(node) {
  return node.type === "comment" && node.data.trim() === "prettier-ignore";
}

function isWhitespaceOnlyText(node) {
  return node.type === "text" && node.data.trim().length === 0;
}

module.exports = {
  hasPrettierIgnore
};

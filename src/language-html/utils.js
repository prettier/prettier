"use strict";

// https://html.spec.whatwg.org/multipage/indices.html#attributes-3
const BOOLEAN_ATTRIBUTES = [
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "readonly",
  "required",
  "reversed",
  "selected",
  "typemustmatch"
];

// http://w3c.github.io/html/single-page.html#void-elements
const VOID_TAGS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];

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

  if (typeof index !== "number" || index === 0) {
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

function isBooleanAttributeNode(node) {
  return (
    node.type === "attribute" && BOOLEAN_ATTRIBUTES.indexOf(node.key) !== -1
  );
}

function isVoidTagNode(node) {
  return node.type === "tag" && VOID_TAGS.indexOf(node.name) !== -1;
}

function isPreTagNode(node) {
  return node.type === "tag" && node.name === "pre";
}

function isTextAreaTagNode(node) {
  return node.type === "tag" && node.name === "textarea";
}

function isScriptTagNode(node) {
  return node.type === "script" || node.type === "style";
}

module.exports = {
  hasPrettierIgnore,
  isBooleanAttributeNode,
  isWhitespaceOnlyText,
  isPreTagNode,
  isScriptTagNode,
  isTextAreaTagNode,
  isVoidTagNode
};

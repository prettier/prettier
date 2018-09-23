"use strict";

const htmlTagNames = require("html-tag-names");

const HTML_TAGS = arrayToMap(htmlTagNames);

// NOTE: must be same as the one in htmlparser2 so that the parsing won't be inconsistent
//       https://github.com/fb55/htmlparser2/blob/v3.9.2/lib/Parser.js#L59-L91
const VOID_TAGS = arrayToMap([
  "area",
  "base",
  "basefont",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",

  "path",
  "circle",
  "ellipse",
  "line",
  "rect",
  "use",
  "stop",
  "polyline",
  "polygon"
]);

function arrayToMap(array) {
  const map = Object.create(null);
  for (const value of array) {
    map[value] = true;
  }
  return map;
}

function hasPrettierIgnore(path) {
  const node = path.getValue();
  if (node.type === "attribute") {
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
  return isPrettierIgnore(prevNode);
}

function isPrettierIgnore(node) {
  return node.type === "comment" && node.data.trim() === "prettier-ignore";
}

function isWhitespaceOnlyText(node) {
  return node.type === "text" && node.data.trim().length === 0;
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

function isWhitespaceSensitiveTagNode(node) {
  return isPreTagNode(node) || isTextAreaTagNode(node) || isScriptTagNode(node);
}

module.exports = {
  HTML_TAGS,
  VOID_TAGS,
  hasPrettierIgnore,
  isScriptTagNode,
  isWhitespaceOnlyText,
  isWhitespaceSensitiveTagNode
};

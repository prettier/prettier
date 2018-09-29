"use strict";

const htmlTagNames = require("html-tag-names");
const htmlElementAttributes = require("html-element-attributes");

const HTML_TAGS = arrayToMap(htmlTagNames);
const HTML_ELEMENT_ATTRIBUTES = mapObject(htmlElementAttributes, arrayToMap);

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

function mapObject(object, fn) {
  const newObject = Object.create(null);
  for (const key of Object.keys(object)) {
    newObject[key] = fn(object[key], key);
  }
  return newObject;
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

function isWhitespaceSensitiveTagNode(node) {
  // TODO
  return false;
}

/**
 * @param {unknown} node
 * @param {(node: unknown, index: number, parent: unknown | null)} fn
 * @param {unknown=} parent
 */
function mapNode(node, fn, parent = null, index = -1) {
  const newNode = Object.assign({}, node);

  if (newNode.children) {
    newNode.children = newNode.children.map((child, childIndex) =>
      mapNode(child, fn, node, childIndex)
    );
  }

  return fn(newNode, index, parent);
}

function replaceNewlines(text, replacement) {
  return text
    .split(/(\n)/g)
    .map((data, index) => (index % 2 === 1 ? replacement : data));
}

module.exports = {
  HTML_ELEMENT_ATTRIBUTES,
  HTML_TAGS,
  VOID_TAGS,
  hasPrettierIgnore,
  isWhitespaceSensitiveTagNode,
  mapNode,
  replaceNewlines
};

"use strict";

const { isFrontMatterNode } = require("../common/util");
const { startWithPragma } = require("./pragma");

const ignoredProperties = new Set([
  "position",
  "raw", // front-matter
]);
function clean(node, parent) {
  // for codeblock
  if (
    node.type === "front-matter" ||
    node.type === "code" ||
    node.type === "yaml" ||
    node.type === "import" ||
    node.type === "export" ||
    node.type === "jsx"
  ) {
    delete node.value;
  }

  if (node.type === "list") {
    delete node.isAligned;
  }

  if (node.type === "list" || node.type === "listItem") {
    delete node.spread;
    delete node.loose;
  }

  // texts can be splitted or merged
  if (node.type === "text") {
    return null;
  }

  if (node.type === "inlineCode") {
    node.value = node.value.replace(/[\t\n ]+/g, " ");
  }

  if (node.type === "wikiLink") {
    node.value = node.value.trim().replace(/[\t\n]+/g, " ");
  }

  if (node.type === "definition" || node.type === "linkReference") {
    node.label = node.label
      .trim()
      .replace(/[\t\n ]+/g, " ")
      .toLowerCase();
  }

  if (
    (node.type === "definition" ||
      node.type === "link" ||
      node.type === "image") &&
    node.title
  ) {
    node.title = node.title.replace(/\\(["')])/g, "$1");
  }

  // for insert pragma
  if (
    parent &&
    parent.type === "root" &&
    parent.children.length > 0 &&
    (parent.children[0] === node ||
      (isFrontMatterNode(parent.children[0]) && parent.children[1] === node)) &&
    node.type === "html" &&
    startWithPragma(node.value)
  ) {
    return null;
  }
}

clean.ignoredProperties = ignoredProperties;

module.exports = clean;

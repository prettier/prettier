"use strict";

const { isFrontMatterNode } = require("../common/util");
const { startWithPragma } = require("./pragma");

const ignoredProperties = new Set([
  "position",
  "raw", // front-matter
]);
function clean(node) {
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
  if (node.type === "root") {
    const commentIndex = isFrontMatterNode(node.children[0]) ? 1 : 0;
    const comment = node.children[commentIndex];
    if (comment && comment.type === "html" && startWithPragma(comment.value)) {
      node.children.splice(commentIndex, 1);
    }
  }
}

clean.ignoredProperties = ignoredProperties;

module.exports = clean;

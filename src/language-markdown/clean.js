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
  if (node.type === "root") {
    const [firstChild, secondChild] = node.children;
    if (
      firstChild &&
      firstChild.type === "html" &&
      startWithPragma(firstChild.value)
    ) {
      node.children.shift();
    }

    if (
      isFrontMatterNode(firstChild) &&
      secondChild &&
      secondChild.type === "html" &&
      startWithPragma(secondChild.value)
    ) {
      node.children.splice(1, 1);
    }
  }
}

clean.ignoredProperties = ignoredProperties;

module.exports = clean;

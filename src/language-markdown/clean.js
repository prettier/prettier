"use strict";

const { isFrontMatterNode } = require("../common/util");
const { startWithPragma } = require("./pragma");

const ignoredProperties = new Set([
  "position",
  "raw", // front-matter
]);
function clean(ast, newObj, parent) {
  // for codeblock
  if (
    ast.type === "front-matter" ||
    ast.type === "code" ||
    ast.type === "yaml" ||
    ast.type === "import" ||
    ast.type === "export" ||
    ast.type === "jsx"
  ) {
    delete newObj.value;
  }

  if (ast.type === "list") {
    delete newObj.isAligned;
  }

  if (ast.type === "list" || ast.type === "listItem") {
    delete newObj.spread;
    delete newObj.loose;
  }

  // texts can be splitted or merged
  if (ast.type === "text") {
    return null;
  }

  if (ast.type === "inlineCode") {
    newObj.value = ast.value.replace(/[\t\n ]+/g, " ");
  }

  if (ast.type === "wikiLink") {
    newObj.value = ast.value.trim().replace(/[\t\n]+/g, " ");
  }

  if (ast.type === "definition" || ast.type === "linkReference") {
    newObj.label = ast.label
      .trim()
      .replace(/[\t\n ]+/g, " ")
      .toLowerCase();
  }

  if (
    (ast.type === "definition" ||
      ast.type === "link" ||
      ast.type === "image") &&
    ast.title
  ) {
    newObj.title = ast.title.replace(/\\(["')])/g, "$1");
  }

  // for insert pragma
  if (
    parent &&
    parent.type === "root" &&
    parent.children.length > 0 &&
    (parent.children[0] === ast ||
      (isFrontMatterNode(parent.children[0]) && parent.children[1] === ast)) &&
    ast.type === "html" &&
    startWithPragma(ast.value)
  ) {
    return null;
  }
}

clean.ignoredProperties = ignoredProperties;

module.exports = clean;

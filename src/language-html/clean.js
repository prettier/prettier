"use strict";

const { isFrontMatterNode } = require("../common/util");

const ignoredProperties = new Set([
  "sourceSpan",
  "startSourceSpan",
  "endSourceSpan",
  "nameSpan",
  "valueSpan",
]);

function clean(node) {
  if (node.type === "text" || node.type === "comment") {
    return null;
  }

  // may be formatted by multiparser
  if (isFrontMatterNode(node) || node.type === "yaml" || node.type === "toml") {
    return null;
  }

  if (node.type === "attribute") {
    delete node.value;
  }

  if (node.type === "docType") {
    delete node.value;
  }
}

clean.ignoredProperties = ignoredProperties;

module.exports = clean;

"use strict";

const { isFrontMatterNode } = require("../common/util");
const getLast = require("../utils/get-last");

const ignoredProperties = new Set([
  "raw", // front-matter
  "raws",
  "sourceIndex",
  "source",
  "before",
  "after",
  "trailingComma",
]);

function clean(node) {
  if (isFrontMatterNode(node) && node.lang === "yaml") {
    delete node.value;
  }

  if (node.type === "css-root") {
    // --insert-pragma
    // first non-front-matter comment
    const commentIndex = isFrontMatterNode(node.nodes[0]) ? 1 : 0;
    const comment = node.nodes[commentIndex];
    if (comment && comment.type === "css-comment") {
      // standalone pragma
      if (/^\*\s*@(format|prettier)\s*$/.test(comment.text)) {
        node.nodes.splice(commentIndex, 1);
      } else {
        /**
         * something
         *
         * @format
         */
        comment.text = "";
      }
    }

    // Last comment is not parsed, when omitting semicolon, #8675
    const lastNode = getLast(node.nodes);
    if (lastNode && lastNode.type === "css-comment") {
      node.nodes.pop();
    }
  }

  if (node.type === "value-root") {
    delete node.text;
  }

  if (
    node.type === "media-query" ||
    node.type === "media-query-list" ||
    node.type === "media-feature-expression"
  ) {
    delete node.value;
  }

  if (node.type === "css-rule") {
    delete node.params;
  }

  if (node.type === "selector-combinator") {
    node.value = node.value.replace(/\s+/g, " ");
  }

  if (node.type === "media-feature") {
    node.value = node.value.replace(/ /g, "");
  }

  if (
    (node.type === "value-word" &&
      ((node.isColor && node.isHex) ||
        ["initial", "inherit", "unset", "revert"].includes(
          node.value.replace().toLowerCase()
        ))) ||
    node.type === "media-feature" ||
    node.type === "selector-root-invalid" ||
    node.type === "selector-pseudo"
  ) {
    node.value = node.value.toLowerCase();
  }
  if (node.type === "css-decl") {
    node.prop = node.prop.toLowerCase();
  }
  if (node.type === "css-atrule" || node.type === "css-import") {
    node.name = node.name.toLowerCase();
  }
  if (node.type === "value-number") {
    node.unit = node.unit.toLowerCase();
  }

  if (
    (node.type === "media-feature" ||
      node.type === "media-keyword" ||
      node.type === "media-type" ||
      node.type === "media-unknown" ||
      node.type === "media-url" ||
      node.type === "media-value" ||
      node.type === "selector-attribute" ||
      node.type === "selector-string" ||
      node.type === "selector-class" ||
      node.type === "selector-combinator" ||
      node.type === "value-string") &&
    node.value
  ) {
    node.value = cleanCSSStrings(node.value);
  }

  if (node.type === "selector-attribute") {
    node.attribute = node.attribute.trim();

    if (node.namespace) {
      if (typeof node.namespace === "string") {
        node.namespace = node.namespace.trim();

        if (node.namespace.length === 0) {
          node.namespace = true;
        }
      }
    }

    if (node.value) {
      node.value = node.value.trim().replace(/^["']|["']$/g, "");
      delete node.quoted;
    }
  }

  if (
    (node.type === "media-value" ||
      node.type === "media-type" ||
      node.type === "value-number" ||
      node.type === "selector-root-invalid" ||
      node.type === "selector-class" ||
      node.type === "selector-combinator" ||
      node.type === "selector-tag") &&
    node.value
  ) {
    node.value = node.value.replace(
      /([\d+.Ee-]+)([A-Za-z]*)/g,
      (match, numStr, unit) => {
        const num = Number(numStr);
        return isNaN(num) ? match : num + unit.toLowerCase();
      }
    );
  }

  if (node.type === "selector-tag") {
    const lowercasedValue = node.value.toLowerCase();

    if (["from", "to"].includes(lowercasedValue)) {
      node.value = lowercasedValue;
    }
  }

  // Workaround when `postcss-values-parser` parse `not`, `and` or `or` keywords as `value-func`
  if (node.type === "css-atrule" && node.name.toLowerCase() === "supports") {
    delete node.value;
  }

  // Workaround for SCSS nested properties
  if (node.type === "selector-unknown") {
    delete node.value;
  }
}

clean.ignoredProperties = ignoredProperties;

function cleanCSSStrings(value) {
  return value.replace(/'/g, '"').replace(/\\([^\dA-Fa-f])/g, "$1");
}

module.exports = clean;

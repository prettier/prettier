"use strict";

function clean(ast, newObj) {
  if (
    ast.type === "media-query" ||
    ast.type === "media-query-list" ||
    ast.type === "media-feature-expression"
  ) {
    delete newObj.value;
  }

  if (ast.type === "css-rule") {
    delete newObj.params;
  }

  if (ast.type === "selector-combinator") {
    newObj.value = newObj.value.replace(/\s+/g, " ");
  }

  if (ast.type === "media-feature") {
    newObj.value = newObj.value.replace(/ /g, "");
  }

  if (
    (ast.type === "value-word" &&
      ((ast.isColor && ast.isHex) ||
        ["initial", "inherit", "unset", "revert"].indexOf(
          newObj.value.replace().toLowerCase()
        ) !== -1)) ||
    ast.type === "media-feature" ||
    ast.type === "selector-root-invalid" ||
    ast.type === "selector-pseudo"
  ) {
    newObj.value = newObj.value.toLowerCase();
  }
  if (ast.type === "css-decl") {
    newObj.prop = newObj.prop.toLowerCase();
  }
  if (ast.type === "css-atrule" || ast.type === "css-import") {
    newObj.name = newObj.name.toLowerCase();
  }
  if (ast.type === "value-number") {
    newObj.unit = newObj.unit.toLowerCase();
  }

  if (
    (ast.type === "media-feature" ||
      ast.type === "media-keyword" ||
      ast.type === "media-type" ||
      ast.type === "media-unknown" ||
      ast.type === "media-url" ||
      ast.type === "media-value" ||
      ast.type === "selector-root-invalid" ||
      ast.type === "selector-attribute" ||
      ast.type === "selector-string" ||
      ast.type === "selector-class" ||
      ast.type === "selector-combinator" ||
      ast.type === "value-string") &&
    newObj.value
  ) {
    newObj.value = cleanCSSStrings(newObj.value);
  }

  if (ast.type === "css-import" && newObj.importPath) {
    newObj.importPath = cleanCSSStrings(newObj.importPath);
  }

  if (ast.type === "selector-attribute") {
    newObj.attribute = newObj.attribute.trim();

    if (newObj.namespace) {
      if (typeof newObj.namespace === "string") {
        newObj.namespace = newObj.namespace.trim();

        if (newObj.namespace.length === 0) {
          newObj.namespace = true;
        }
      }
    }

    if (newObj.value) {
      newObj.value = newObj.value.trim().replace(/^['"]|['"]$/g, "");
      delete newObj.quoted;
    }
  }

  if (
    (ast.type === "media-value" ||
      ast.type === "media-type" ||
      ast.type === "value-number" ||
      ast.type === "selector-root-invalid" ||
      ast.type === "selector-class" ||
      ast.type === "selector-combinator" ||
      ast.type === "selector-tag") &&
    newObj.value
  ) {
    newObj.value = newObj.value.replace(
      /([\d.eE+-]+)([a-zA-Z]*)/g,
      (match, numStr, unit) => {
        const num = Number(numStr);
        return isNaN(num) ? match : num + unit.toLowerCase();
      }
    );
  }

  if (ast.type === "media-url") {
    newObj.value = newObj.value
      .replace(/^url\(\s+/gi, "url(")
      .replace(/\s+\)$/gi, ")");
  }
}

function cleanCSSStrings(value) {
  return value.replace(/'/g, '"').replace(/\\([^a-fA-F\d])/g, "$1");
}

module.exports = clean;

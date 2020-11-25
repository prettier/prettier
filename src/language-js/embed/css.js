"use strict";

const {
  builders: { indent, hardline, softline, concat },
  utils: { mapDoc, replaceNewlinesWithLiterallines, getDocParts },
} = require("../../document");
const { printTemplateExpressions } = require("../print/template-literal");

function format(path, print, textToDoc) {
  const node = path.getValue();

  // Get full template literal with expressions replaced by placeholders
  const rawQuasis = node.quasis.map((q) => q.value.raw);
  let placeholderID = 0;
  const text = rawQuasis.reduce((prevVal, currVal, idx) => {
    return idx === 0
      ? currVal
      : prevVal + "@prettier-placeholder-" + placeholderID++ + "-id" + currVal;
  }, "");
  const doc = textToDoc(
    text,
    { parser: "scss" },
    { stripTrailingHardline: true }
  );
  const expressionDocs = printTemplateExpressions(path, print);
  return transformCssDoc(doc, node, expressionDocs);
}

function transformCssDoc(quasisDoc, parentNode, expressionDocs) {
  const isEmpty =
    parentNode.quasis.length === 1 && !parentNode.quasis[0].value.raw.trim();
  if (isEmpty) {
    return "``";
  }

  const newDoc = replacePlaceholders(quasisDoc, expressionDocs);
  /* istanbul ignore if */
  if (!newDoc) {
    throw new Error("Couldn't insert all the expressions");
  }
  return concat(["`", indent(concat([hardline, newDoc])), softline, "`"]);
}

// Search all the placeholders in the quasisDoc tree
// and replace them with the expression docs one by one
// returns a new doc with all the placeholders replaced,
// or null if it couldn't replace any expression
function replacePlaceholders(quasisDoc, expressionDocs) {
  if (!expressionDocs || !expressionDocs.length) {
    return quasisDoc;
  }

  let replaceCounter = 0;
  const newDoc = mapDoc(quasisDoc, (doc) => {
    if (!doc) {
      return doc;
    }
    let parts = getDocParts(doc);
    if (!parts || !parts.length) {
      return doc;
    }

    const atIndex = parts.indexOf("@");
    const placeholderIndex = atIndex + 1;
    if (
      atIndex > -1 &&
      typeof parts[placeholderIndex] === "string" &&
      parts[placeholderIndex].startsWith("prettier-placeholder")
    ) {
      // If placeholder is split, join it
      const at = parts[atIndex];
      const placeholder = parts[placeholderIndex];
      const rest = parts.slice(placeholderIndex + 1);
      parts = parts
        .slice(0, atIndex)
        .concat([at + placeholder])
        .concat(rest);
    }

    const replacedParts = [];
    parts.forEach((part) => {
      if (typeof part !== "string" || !part.includes("@prettier-placeholder")) {
        replacedParts.push(part);
        return;
      }

      // When we have multiple placeholders in one line, like:
      // ${Child}${Child2}:not(:first-child)
      part.split(/@prettier-placeholder-(\d+)-id/).forEach((component, idx) => {
        // The placeholder is always at odd indices
        if (idx % 2 === 0) {
          replacedParts.push(replaceNewlinesWithLiterallines(component));
          return;
        }

        // The component will always be a number at odd index
        replacedParts.push(expressionDocs[component]);
        replaceCounter++;
      });
    });
    return {
      ...(Array.isArray(doc) ? { type: "concat" } : doc),
      parts: replacedParts,
    };
  });
  return expressionDocs.length === replaceCounter ? newDoc : null;
}

module.exports = format;

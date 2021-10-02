"use strict";

const {
  builders: { indent, softline, literalline, dedentToRoot },
  utils: { mapDoc },
} = require("../../document/index.js");
const { printTemplateExpressions } = require("../print/template-literal.js");

// The counter is needed to distinguish nested embeds.
let counter = 0;
function format(path, print, textToDoc) {
  const node = path.getValue();
  const placeholder = `PRETTIER_MARKDOWN_PLACEHOLDER_${counter}_IN_JS`;
  counter = (counter + 1) >>> 0;
  let text = node.quasis
    .map((quasi) => quasi.value.raw)
    .join(placeholder)
    .replace(
      /((?:\\\\)*)\\`/g,
      (_, backslashes) => "\\".repeat(backslashes.length / 2) + "`"
    );
  const indentation = getIndentation(text);
  const hasIndent = indentation !== "";
  if (hasIndent) {
    text = text.replace(new RegExp(`^${indentation}`, "gm"), "");
  }
  const expressionDocs = printTemplateExpressions(path, print);
  const doc = mapDoc(
    textToDoc(
      text,
      { parser: "markdown", __inJsTemplate: true },
      { stripTrailingHardline: true }
    ),
    (currentDoc) =>
      typeof currentDoc !== "string"
        ? currentDoc
        : currentDoc.split(placeholder).flatMap((unescaped, index, splits) => {
            const escaped = unescaped.replace(/(\\*)`/g, "$1$1\\`");
            return index === splits.length - 1
              ? escaped
              : [escaped, expressionDocs.shift()];
          })
  );
  return [
    "`",
    hasIndent ? indent([softline, doc]) : [literalline, dedentToRoot(doc)],
    softline,
    "`",
  ];
}

function getIndentation(str) {
  const firstMatchedIndent = str.match(/^([^\S\n]*)\S/m);
  return firstMatchedIndent === null ? "" : firstMatchedIndent[1];
}

module.exports = format;

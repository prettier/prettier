"use strict";

const {
  builders: { indent, softline, literalline, concat, dedentToRoot },
} = require("../../document");
const { escapeTemplateCharacters } = require("../print/template-literal");

function format(path, print, textToDoc) {
  const node = path.getValue();
  let text = node.quasis[0].value.raw.replace(
    /((?:\\\\)*)\\`/g,
    (_, backslashes) => "\\".repeat(backslashes.length / 2) + "`"
  );
  const indentation = getIndentation(text);
  const hasIndent = indentation !== "";
  if (hasIndent) {
    text = text.replace(new RegExp(`^${indentation}`, "gm"), "");
  }
  const doc = printMarkdown(text, textToDoc);
  return concat([
    "`",
    hasIndent
      ? indent(concat([softline, doc]))
      : concat([literalline, dedentToRoot(doc)]),
    softline,
    "`",
  ]);
}

function printMarkdown(text, textToDoc) {
  const doc = textToDoc(
    text,
    { parser: "markdown", __inJsTemplate: true },
    { stripTrailingHardline: true }
  );
  return escapeTemplateCharacters(doc, true);
}

function getIndentation(str) {
  const firstMatchedIndent = str.match(/^([^\S\n]*)\S/m);
  return firstMatchedIndent === null ? "" : firstMatchedIndent[1];
}

module.exports = format;

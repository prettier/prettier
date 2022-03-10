"use strict";

const {
  builders: { indent, softline, literalline, dedentToRoot },
} = require("../../document/index.js");
const { escapeTemplateCharacters } = require("../print/template-literal.js");
const { unescape, dedent } = require("./utils.js");

function format(path, print, textToDoc) {
  const node = path.getValue();
  const { text, hasIndent } = dedent(unescape(node.quasis[0].value.raw));
  const doc = escapeTemplateCharacters(
    textToDoc(
      text,
      { parser: "markdown", __inJsTemplate: true },
      { stripTrailingHardline: true }
    ),
    true
  );
  return [
    "`",
    hasIndent ? indent([softline, doc]) : [literalline, dedentToRoot(doc)],
    softline,
    "`",
  ];
}

module.exports = format;

"use strict";

const {
  builders: { indent, softline, literalline, dedentToRoot },
  utils: { mapDoc },
} = require("../../document/index.js");
const { printTemplateExpressions } = require("../print/template-literal.js");

function format(path, print, textToDoc) {
  const node = path.getValue();
  const placeholder = createPlaceholder();
  let text = unescapeBackticks(
    node.quasis
      .flatMap((quasi, index) => [quasi.value.raw, placeholder(index)])
      .slice(0, -1)
      .join("")
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
    (currentDoc) => {
      if (typeof currentDoc === "string") {
        currentDoc = currentDoc
          .split(new RegExp(placeholder(".*?"), "g"))
          .flatMap((string) => [
            escapeBackticks(string),
            expressionDocs.shift(),
          ]);
        expressionDocs.unshift(currentDoc.pop());
      }
      return currentDoc;
    }
  );
  return [
    "`",
    hasIndent ? indent([softline, doc]) : [literalline, dedentToRoot(doc)],
    softline,
    "`",
  ];
}

// The counter is needed to distinguish nested embeds.
let counter = 0;
function createPlaceholder() {
  const i = counter;
  counter = (counter + 1) >>> 0;
  // mapDoc() caches the placeholders so they have to all be distinct.
  return (j) => `PRETTIER_MARKDOWN_PLACEHOLDER_${i}_${j}_IN_JS`;
}

// 1. Backticks are significant in Markdown, otherwise we wouldn't
//    bother: Just format the raw template value like we do \$ and other
//    escape sequences.
// 2. Backticks can't exist in raw template values, so
//    escapeBackticks(unescapeBackticks(text)) is non-destructive.
function unescapeBackticks(escaped) {
  return escaped.replace(/\\*(?=`)/g, (backslashes) =>
    "\\".repeat(backslashes.length / 2)
  );
}

function escapeBackticks(unescaped) {
  return unescaped.replace(/(\\*)`/g, "$1$1\\`");
}

function getIndentation(str) {
  const firstMatchedIndent = str.match(/^([^\S\n]*)\S/m);
  return firstMatchedIndent === null ? "" : firstMatchedIndent[1];
}

module.exports = format;

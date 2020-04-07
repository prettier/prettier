"use strict";

const util = require("../common/util");
const support = require("../main/support");
const {
  builders: { hardline, literalline, concat, markAsRoot },
  utils: { mapDoc },
} = require("../document");
const { getFencedCodeBlockValue } = require("./utils");

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  if (node.type === "code" && node.lang !== null) {
    // only look for the first string so as to support [markdown-preview-enhanced](https://shd101wyy.github.io/markdown-preview-enhanced/#/code-chunk)
    const langMatch = node.lang.match(/^[A-Za-z0-9_-]+/);
    const lang = langMatch ? langMatch[0] : "";
    const parser = getParserName(lang);
    if (parser) {
      const styleUnit = options.__inJsTemplate ? "~" : "`";
      const style = styleUnit.repeat(
        Math.max(3, util.getMaxContinuousCount(node.value, styleUnit) + 1)
      );
      const doc = textToDoc(
        getFencedCodeBlockValue(node, options.originalText),
        { parser }
      );
      return markAsRoot(
        concat([
          style,
          node.lang,
          hardline,
          replaceNewlinesWithLiterallines(doc),
          style,
        ])
      );
    }
  }

  if (node.type === "yaml") {
    return markAsRoot(
      concat([
        "---",
        hardline,
        node.value && node.value.trim()
          ? replaceNewlinesWithLiterallines(
              textToDoc(node.value, { parser: "yaml" })
            )
          : "",
        "---",
      ])
    );
  }

  // MDX
  switch (node.type) {
    case "importExport":
      return textToDoc(node.value, { parser: "babel" });
    case "jsx":
      return textToDoc(`<$>${node.value}</$>`, {
        parser: "__js_expression",
        rootMarker: "mdx",
      });
  }

  return null;

  function getParserName(lang) {
    const supportInfo = support.getSupportInfo({ plugins: options.plugins });
    const language = supportInfo.languages.find(
      (language) =>
        language.name.toLowerCase() === lang ||
        (language.aliases && language.aliases.includes(lang)) ||
        (language.extensions &&
          language.extensions.find((ext) => ext === `.${lang}`))
    );
    if (language) {
      return language.parsers[0];
    }

    return null;
  }

  function replaceNewlinesWithLiterallines(doc) {
    return mapDoc(doc, (currentDoc) =>
      typeof currentDoc === "string" && currentDoc.includes("\n")
        ? concat(
            currentDoc
              .split(/(\n)/g)
              .map((v, i) => (i % 2 === 0 ? v : literalline))
          )
        : currentDoc
    );
  }
}

module.exports = embed;

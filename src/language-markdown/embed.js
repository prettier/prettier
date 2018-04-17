"use strict";

const docUtils = require("../doc/doc-utils");
const util = require("../common/util");
const support = require("../common/support");
const doc = require("../doc");
const docBuilders = doc.builders;
const hardline = docBuilders.hardline;
const literalline = docBuilders.literalline;
const concat = docBuilders.concat;
const markAsRoot = docBuilders.markAsRoot;

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  if (node.type === "code" && node.lang !== null) {
    // only look for the first string so as to support [markdown-preview-enhanced](https://shd101wyy.github.io/markdown-preview-enhanced/#/code-chunk)
    const lang = node.lang.split(/\s/, 1)[0];
    const parser = getParserName(lang);
    if (parser) {
      const styleUnit = options.__inJsTemplate ? "~" : "`";
      const style = styleUnit.repeat(
        Math.max(3, util.getMaxContinuousCount(node.value, styleUnit) + 1)
      );
      const doc = textToDoc(node.value, { parser });
      return markAsRoot(
        concat([
          style,
          node.lang,
          hardline,
          replaceNewlinesWithLiterallines(doc),
          style
        ])
      );
    }
  }

  return null;

  function getParserName(lang) {
    const supportInfo = support.getSupportInfo(null, {
      plugins: options.plugins,
      pluginsLoaded: true
    });
    const language = supportInfo.languages.find(
      language =>
        language.name.toLowerCase() === lang ||
        (language.extensions &&
          language.extensions.find(ext => ext.substring(1) === lang))
    );
    if (language) {
      return language.parsers[0];
    }

    return null;
  }

  function replaceNewlinesWithLiterallines(doc) {
    return docUtils.mapDoc(
      doc,
      currentDoc =>
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

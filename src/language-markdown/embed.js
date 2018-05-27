"use strict";

const util = require("../common/util");
const support = require("../main/support");
const {
  builders: { hardline, literalline, concat, markAsRoot },
  utils: { mapDoc }
} = require("../doc");

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
      plugins: options.plugins
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
    return mapDoc(
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

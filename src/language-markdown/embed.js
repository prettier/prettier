"use strict";

const util = require("../common/util");
const support = require("../common/support");
const doc = require("../doc");
const docBuilders = doc.builders;
const hardline = docBuilders.hardline;
const concat = docBuilders.concat;

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  if (node.type === "code") {
    const parser = getParserName(node.lang);
    if (parser) {
      const styleUnit = options.__inJsTemplate ? "~" : "`";
      const style = styleUnit.repeat(
        Math.max(3, util.getMaxContinuousCount(node.value, styleUnit) + 1)
      );
      const doc = textToDoc(node.value, { parser });
      return concat([
        style,
        node.lang,
        hardline,
        replaceNewlinesWithHardlines(doc),
        style
      ]);
    }
  }

  return null;

  function getParserName(lang) {
    const supportInfo = support.getSupportInfo(undefined, {
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

  function replaceNewlinesWithHardlines(doc) {
    return util.mapDoc(
      doc,
      currentDoc =>
        typeof currentDoc === "string" && currentDoc.includes("\n")
          ? concat(
              currentDoc
                .split(/(\n)/g)
                .map((v, i) => (i % 2 === 0 ? v : hardline))
            )
          : currentDoc
    );
  }
}

module.exports = embed;

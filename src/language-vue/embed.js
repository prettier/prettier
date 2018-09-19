"use strict";

const { concat, hardline } = require("../doc").builders;

function embed(path, print, textToDoc, options) {
  const node = path.getValue();
  const parent = path.getParentNode();
  if (!parent || parent.tag !== "root" || node.unary) {
    return null;
  }

  let parser;

  if (node.tag === "style") {
    const langAttr = node.attrs.find(attr => attr.name === "lang");
    if (!langAttr || langAttr.value === "postcss") {
      parser = "css";
    } else if (langAttr.value === "scss") {
      parser = "scss";
    } else if (langAttr.value === "less") {
      parser = "less";
    }
  }

  if (node.tag === "script" && !node.attrs.some(attr => attr.name === "src")) {
    const langAttr = node.attrs.find(attr => attr.name === "lang");
    if (!langAttr) {
      parser = "babylon";
    } else if (langAttr.value === "ts" || langAttr.value === "tsx") {
      parser = "typescript";
    }
  }

  if (!parser) {
    return null;
  }

  return concat([
    options.originalText.slice(node.start, node.contentStart),
    hardline,
    textToDoc(options.originalText.slice(node.contentStart, node.contentEnd), {
      parser
    }),
    options.originalText.slice(node.contentEnd, node.end)
  ]);
}

module.exports = embed;

"use strict";

const {
  builders: { hardline, markAsRoot },
} = require("../../document");

function print(node, textToDoc) {
  if (node.lang === "yaml") {
    const value = node.value.trim();
    const doc = value
      ? textToDoc(value, { parser: "yaml" }, { stripTrailingHardline: true })
      : "";
    return markAsRoot([
      node.startDelimiter,
      hardline,
      doc,
      doc ? hardline : "",
      node.endDelimiter,
    ]);
  }
}

module.exports = print;

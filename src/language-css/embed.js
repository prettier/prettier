"use strict";
const {
  builders: { hardline },
} = require("../document");
const printFrontMatter = require("../utils/front-matter/print");

function embed(path, print, textToDoc /*, options */) {
  const node = path.getValue();

  if (node.type === "front-matter") {
    const doc = printFrontMatter(node, textToDoc);
    return doc ? [doc, hardline] : "";
  }
}

module.exports = embed;

"use strict";
const {
  builders: { hardline },
} = require("../document/index.js");
const printFrontMatter = require("../utils/front-matter/print.js");

function embed(path, print, textToDoc /*, options */) {
  const node = path.getValue();

  if (node.type === "front-matter") {
    const doc = printFrontMatter(node, textToDoc);
    return doc ? [doc, hardline] : "";
  }
}

module.exports = embed;

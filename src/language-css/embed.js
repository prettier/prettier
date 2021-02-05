"use strict";
const {
  builders: { hardline },
} = require("../document");
const { print: printFrontMatter } = require("../utils/front-matter");

function embed(path, print, textToDoc /*, options */) {
  const node = path.getValue();

  if (node.type === "front-matter") {
    const doc = printFrontMatter(node, textToDoc);
    return doc ? [doc, hardline] : "";
  }
}

module.exports = embed;

"use strict";
const {
  builders: { hardline, concat },
} = require("../document");
const { print: printFrontMatter } = require("../utils/front-matter");

function embed(path, print, textToDoc /*, options */) {
  const node = path.getValue();

  if (node.type === "front-matter") {
    const doc = printFrontMatter(node, textToDoc);
    return doc ? concat([doc, hardline]) : "";
  }
}

module.exports = embed;

"use strict";

const { print: printFrontMatter } = require("../utils/front-matter");

function embed(path, print, textToDoc /*, options */) {
  const node = path.getValue();

  if (node.type === "front-matter") {
    return printFrontMatter(node, textToDoc);
  }
}

module.exports = embed;

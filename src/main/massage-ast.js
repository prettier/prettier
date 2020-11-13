"use strict";

const traverse = require("../utils/traverse");

function massageAST(ast, options) {
  const cleanFunction = options.printer.massageAstNode;
  let ignoredProperties;
  if (cleanFunction && cleanFunction.ignoredProperties) {
    ignoredProperties = cleanFunction.ignoredProperties;
  } else {
    ignoredProperties = new Set();
  }
  const cleaned = traverse(ast, (node) => {
    for (const key of ignoredProperties) {
      delete node[key];
    }

    return cleanFunction(node, options);
  });
  return cleaned;
}

module.exports = massageAST;

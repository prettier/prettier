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
  return traverse(ast, (node, key, parent) => {
    if (ignoredProperties.has(key)) {
      return null;
    }

    return cleanFunction(node, parent, options);
  });
}

module.exports = massageAST;

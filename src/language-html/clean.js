"use strict";

module.exports = function(ast, newNode) {
  delete newNode.sourceCodeLocation;

  if (ast.type === "text") {
    delete newNode.data;
  }
};

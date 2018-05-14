"use strict";

module.exports = function(ast, newNode) {
  delete newNode.__location;

  if (ast.type === "text") {
    return null;
  }
};

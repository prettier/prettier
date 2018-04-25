"use strict";

module.exports = function(ast) {
  if (ast.type === "text") {
    return null;
  }
};

"use strict";

module.exports = function(text, parsers) {
  const ast = parsers.babylon(text);
  ast.program.body[0].expression.callee.name = "bar";
  return ast;
};

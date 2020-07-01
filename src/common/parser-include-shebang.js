"use strict";

const { getShebang } = require("./util");

function includeShebang(text, ast) {
  const shebang = getShebang(text);

  if (!shebang) {
    return;
  }
  const index = shebang.length;

  const comment = {
    type: "Line",
    value: shebang.slice(2),
    range: [0, index],
  };

  ast.comments = [comment].concat(ast.comments);
}

module.exports = includeShebang;

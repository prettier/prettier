"use strict";

const embed = require("./embed");
const docBuilders = require("../doc").builders;
const concat = docBuilders.concat;
const hardline = docBuilders.hardline;

function genericPrint(path, options, print) {
  const n = path.getValue();
  const res = [];
  let index = n.start;

  if (n.unary) {
    res.push(options.originalText.slice(n.start, n.end));
  } else {
    path.each(childPath => {
      const child = childPath.getValue();
      res.push(options.originalText.slice(index, child.start));
      res.push(childPath.call(print));
      index = child.end;
    }, "children");

    if (index < n.end) {
      res.push(options.originalText.slice(index, n.end));
    }
  }

  // Only force a trailing newline if there were any contents.
  if (n.tag === "root" && n.children.length) {
    res.push(hardline);
  }

  return concat(res);
}

const clean = (ast, newObj) => {
  delete newObj.contentStart;
  delete newObj.contentEnd;
};

module.exports = {
  print: genericPrint,
  embed,
  massageAstNode: clean
};

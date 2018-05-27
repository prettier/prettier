"use strict";

const embed = require("./embed");
const { concat, hardline } = require("../doc").builders;

function genericPrint(path, options, print) {
  const n = path.getValue();
  const res = [];
  let index = n.start;

  path.each(childPath => {
    const child = childPath.getValue();
    res.push(options.originalText.slice(index, child.start));
    res.push(childPath.call(print));
    index = child.end;
  }, "children");

  // If there are no children, we just print the node from start to end.
  // Otherwise, index should point to the end of the last child, and we
  // need to print the closing tag.
  res.push(options.originalText.slice(index, n.end));

  // Only force a trailing newline if there were any contents.
  if (n.tag === "root" && n.children.length) {
    res.push(hardline);
  }

  return concat(res);
}

const clean = (ast, newObj) => {
  delete newObj.start;
  delete newObj.end;
  delete newObj.contentStart;
  delete newObj.contentEnd;
};

module.exports = {
  print: genericPrint,
  embed,
  massageAstNode: clean
};

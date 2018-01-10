"use strict";

const embed = require("./embed");
const docBuilders = require("../doc").builders;
const concat = docBuilders.concat;
const hardline = docBuilders.hardline;

function genericPrint(path, options, print) {
  const n = path.getValue();
  const res = [];
  let index = n.start;
  let printParent = typeof n.end === "number";

  path.each(childPath => {
    const child = childPath.getValue();
    res.push(options.originalText.slice(index, child.start));
    res.push(childPath.call(print));
    if (typeof child.end === "number") {
      index = child.end;
    } else {
      printParent = false;
    }
  }, "children");

  if (printParent) {
    res.push(options.originalText.slice(index, n.end));
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

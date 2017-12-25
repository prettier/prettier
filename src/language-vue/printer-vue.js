"use strict";

const embed = require("./embed");
const docBuilders = require("../doc").builders;
const concat = docBuilders.concat;

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
  res.push(options.originalText.slice(index, n.end));

  return concat(res);
}

module.exports = {
  print: genericPrint,
  embed
};

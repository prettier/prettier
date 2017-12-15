"use strict";

const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const hardline = docBuilders.hardline;
const group = docBuilders.group;
const line = docBuilders.line;

function genericPrint(path, options, print) {
  const n = path.getValue();
  if (!n) {
    return "";
  } else if (typeof n === "string") {
    return n;
  }
  return handleNode(n);
}

function handleNode(node) {
  switch (node.kind) {
    case "program":
      return concat([
        "<?php",
        line,
        concat(node.children.map(child => handleNode(child)))
      ]);
    case "assign":
      return concat([
        join(" = ", [handleNode(node.left), handleNode(node.right)]),
        ";"
      ]);
    case "variable":
      return "$" + node.name;
    case "string":
      return "'" + node.value + "'";
    default:
      return concat(["whoops this hasn't been implemented yet"]);
  }
}

module.exports = genericPrint;

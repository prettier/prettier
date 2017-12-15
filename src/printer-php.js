"use strict";

const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const line = docBuilders.line;

function genericPrint(path) {
  const n = path.getValue();
  if (!n) {
    return "";
  } else if (typeof n === "string") {
    return n;
  }
  return handleNode(n);
}

function handleLiteral(node) {
  switch (node.kind) {
    case "boolean":
      return node.value ? "true" : "false";
    case "string":
      return "'" + node.value + "'";
    case "number":
      return node.value;
    case "inline":
    case "magic":
    case "nowdoc":
    case "encapsed":
    default:
      return "Not yet accounted for";
  }
}

function handleNode(node) {
  switch (node.kind) {
    case "program":
      return concat([
        "<?php",
        line,
        concat(node.children.map(child => concat([line, handleNode(child)])))
      ]);
    case "assign":
      return concat([
        join(" = ", [handleNode(node.left), handleNode(node.right)]),
        ";"
      ]);
    case "variable":
      return "$" + node.name;

    // literals
    case "boolean":
    case "string":
    case "number":
    case "inline":
    case "magic":
    case "nowdoc":
    case "encapsed":
      return handleLiteral(node);

    // we haven't implemented this type of node yet
    default:
      return concat(["whoops this hasn't been implemented yet"]);
  }
}

module.exports = genericPrint;

"use strict";

const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const line = docBuilders.line;
const group = docBuilders.group;
const indent = docBuilders.indent;

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

    // operation
    case "pre":
      return concat([node.type + node.type, handleNode(node.what), ";"]);
    case "post":
      return concat([handleNode(node.what), node.type + node.type, ";"]);
    case "bin":
      return concat([
        handleNode(node.left),
        " ",
        node.type,
        " ",
        handleNode(node.right)
      ]);
    case "parenthesis":
      return "parenthesis needs to be implemented";
    case "unary":
      return "unary needs to be implemented";
    case "cast":
      return "cast needs to be implemented";

    // statements
    case "do":
      return concat([
        "do {",
        indent(concat([line, handleNode(node.body)])),
        line,
        group(concat(["} while (", handleNode(node.test), ");"]))
      ]);
    case "for":
      return concat([
        "for (",
        concat(node.init.map(init => handleNode(init))),
        concat(node.test.map(test => handleNode(test))),
        ";",
        concat(node.increment.map(increment => handleNode(increment))),
        ") {",
        indent(concat([line, handleNode(node.body)])),
        line,
        "}"
      ]);
    case "block":
      return concat(node.children.map(child => handleNode(child)));

    // we haven't implemented this type of node yet
    default:
      return concat(["whoops this hasn't been implemented yet"]);
  }
}

module.exports = genericPrint;

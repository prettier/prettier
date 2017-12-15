"use strict";

const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const line = docBuilders.line;
const group = docBuilders.group;
const indent = docBuilders.indent;
const hardline = docBuilders.hardline;
const softline = docBuilders.softline;

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

function handleArugments(args) {
  return group(
    join(", ",
        args.map((param) => {
          return group(concat([
            line,
            "$",
            param.name
          ]));
      }))
  );
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
    case "foreach":
      return concat([
        "foreach (",
        handleNode(node.source),
        " as ",
        node.key
          ? join(" => ", [handleNode(node.key), handleNode(node.value)])
          : handleNode(node.value),
        ") {",
        indent(concat([line, handleNode(node.body)])),
        line,
        "}"
      ]);
    case "if":
      const handleIfAlternate = alternate => {
        if (!alternate) {
          return "}";
        }
        if (alternate.kind === "if") {
          return concat(["} else", handleNode(alternate)]);
        }
        return concat([
          "} else {",
          indent(concat([line, handleNode(alternate)])),
          line,
          "}"
        ]);
      };
      return concat([
        "if (",
        handleNode(node.test),
        ") {",
        indent(concat([line, handleNode(node.body)])),
        line,
        handleIfAlternate(node.alternate)
      ]);
    case "switch":
      return concat([
        "switch (",
        handleNode(node.test),
        ") {",
        indent(
          concat(
            node.body.children.map(caseChild =>
              concat([line, handleNode(caseChild)])
            )
          )
        ),
        line,
        "}"
      ]);
    case "case":
      return concat([
        node.test
          ? concat(["case (", handleNode(node.test), "):"])
          : "default:",
        indent(concat([line, handleNode(node.body)]))
      ]);
    case "break":
      return "break;";
    case "while":
      return concat([
        "while (",
        handleNode(node.test),
        ") {",
        indent(concat([line, handleNode(node.body)])),
        line,
        "}"
      ]);
    case "block":
      return concat(
        node.children.map((child, i) => {
          if (i === 0) {
            return handleNode(child);
          }
          return concat([line, handleNode(child)]);
        })
      );
    case "return":
      if (node.expr) {
        concat(["return", handleNode(node.expr), ";"]);
      } else {
        return "return;";
      }
      return concat(["return ", handleNode(node.expr), ";"]);
    // functions
    case "function":
      return concat([
        "function ",
        node.name,
        "(",
        indent(handleArugments(node.arguments)),
        ") {",
        indent(concat([hardline, handleNode(node.body)])),
        concat([hardline, "}"])
      ]);
    // we haven't implemented this type of node yet
    default:
      return concat(["whoops " + node.kind + " hasn't been implemented yet"]);
  }
}




module.exports = genericPrint;

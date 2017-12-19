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
  return printNode(n);
}

function printLiteral(node) {
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

function printNode(node) {
  switch (node.kind) {
    case "program":
      return concat([
        "<?php",
        concat(node.children.map(child => concat([line, printNode(child)])))
      ]);
    case "assign":
      return concat([
        join(" = ", [printNode(node.left), printNode(node.right)]),
        ";"
      ]);
    case "variable":
      return "$" + node.name;
    case "identifier":
      // @TODO: do we need to conider node.resolution?
      return node.name;

    // literals
    case "boolean":
    case "string":
    case "number":
    case "inline":
    case "magic":
    case "nowdoc":
    case "encapsed":
      return printLiteral(node);

    // operation
    case "pre":
      return concat([node.type + node.type, printNode(node.what), ";"]);
    case "post":
      return concat([printNode(node.what), node.type + node.type, ";"]);
    case "bin":
      return concat([
        printNode(node.left),
        " ",
        node.type,
        " ",
        printNode(node.right)
      ]);
    case "parenthesis":
      return concat(["(", printNode(node.inner), ")"]);
    case "unary":
      return "unary needs to be implemented";
    case "cast":
      return "cast needs to be implemented";

    // statements
    case "do":
      return concat([
        "do {",
        indent(concat([line, printNode(node.body)])),
        line,
        group(
          concat([
            "} while (",
            group(
              concat([
                indent(concat([softline, printNode(node.test)])),
                softline
              ])
            ),
            ");"
          ])
        )
      ]);
    case "for":
      return concat([
        "for (",
        group(
          concat([
            indent(
              concat([
                softline,
                group(concat(node.init.map(init => printNode(init)))),
                softline,
                group(
                  concat([concat(node.test.map(test => printNode(test))), ";"])
                ),
                softline,
                group(
                  concat(node.increment.map(increment => printNode(increment)))
                )
              ])
            ),
            softline,
            ") {"
          ])
        ),
        indent(concat([line, printNode(node.body)])),
        line,
        "}"
      ]);
    case "foreach":
      return concat([
        "foreach (",
        group(
          concat([
            indent(
              concat([
                softline,
                printNode(node.source),
                " as",
                line,
                node.key
                  ? join(" => ", [printNode(node.key), printNode(node.value)])
                  : printNode(node.value)
              ])
            ),
            softline,
            ") {"
          ])
        ),
        indent(concat([line, printNode(node.body)])),
        line,
        "}"
      ]);
    case "if": {
      const handleIfAlternate = alternate => {
        if (!alternate) {
          return "}";
        }
        if (alternate.kind === "if") {
          return concat(["} else", printNode(alternate)]);
        }
        return concat([
          "} else {",
          indent(concat([line, printNode(alternate)])),
          line,
          "}"
        ]);
      };
      return concat([
        "if (",
        printNode(node.test),
        ") {",
        indent(concat([line, printNode(node.body)])),
        line,
        handleIfAlternate(node.alternate)
      ]);
    }
    case "switch":
      return concat([
        "switch (",
        printNode(node.test),
        ") {",
        indent(
          concat(
            node.body.children.map(caseChild =>
              concat([line, printNode(caseChild)])
            )
          )
        ),
        line,
        "}"
      ]);
    case "case":
      return concat([
        node.test ? concat(["case ", printNode(node.test), ":"]) : "default:",
        indent(concat([line, printNode(node.body)]))
      ]);
    case "break":
      return "break;";
    case "while":
      return concat([
        "while (",
        printNode(node.test),
        ") {",
        indent(concat([line, printNode(node.body)])),
        line,
        "}"
      ]);
    case "block":
      return concat(
        node.children.map((child, i) => {
          if (i === 0) {
            return printNode(child);
          }
          return concat([line, printNode(child)]);
        })
      );
    case "return":
      if (node.expr) {
        concat(["return", printNode(node.expr), ";"]);
      } else {
        return "return;";
      }
      return concat(["return ", printNode(node.expr), ";"]);
    // functions
    case "function":
      return concat([
        group(concat(["function ", node.name, "("])),
        group(
          concat([
            indent(
              join(
                ", ",
                node.arguments.map(argument =>
                  concat([softline, printNode(argument)])
                )
              )
            ),
            softline
          ])
        ),
        group(") {"),
        indent(concat([hardline, printNode(node.body)])),
        concat([hardline, "}"])
      ]);
    case "parameter":
      if (node.value) {
        return group(
          join(" = ", [concat(["$", node.name]), printNode(node.value)])
        );
      }
      return concat(["$", node.name]);
    case "call":
      return concat([
        printNode(node.what),
        "(",
        join(", ", node.arguments.map(argument => printNode(argument))),
        ");"
      ]);
    case "class":
      return concat([
        group(concat(["class ", node.name, " {"])),
        hardline,
        indent(
          concat(node.body.map(child => concat([hardline, printNode(child)])))
        ),
        hardline,
        "}"
      ]);
    case "doc":
      return node.isDoc
        ? concat([
            "/**",
            concat(
              node.lines.map(comment => concat([hardline, " * ", comment]))
            ),
            hardline,
            " */"
          ])
        : concat(node.lines.map(comment => concat(["// ", comment])));
    case "property":
      return concat([
        node.visibility,
        " $",
        node.name,
        node.value ? concat([" = ", printNode(node.value)]) : "",
        ";"
      ]);
    case "method":
      return concat([
        group(concat([node.visibility, " function ", node.name, "("])),
        group(
          concat([
            indent(
              join(
                ", ",
                node.arguments.map(argument =>
                  concat([softline, printNode(argument)])
                )
              )
            ),
            softline
          ])
        ),
        group(") {"),
        indent(concat([hardline, printNode(node.body)])),
        hardline,
        "}"
      ]);
    case "propertylookup":
      return concat([printNode(node.what), "->", printNode(node.offset)]);
    case "constref":
      return node.name;
    // we haven't implemented this type of node yet
    default:
      return concat(["whoops " + node.kind + " hasn't been implemented yet"]);
  }
}

module.exports = genericPrint;

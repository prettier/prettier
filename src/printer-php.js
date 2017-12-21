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

function lineShouldEndWithSemicolon(node) {
  const semiColonWhitelist = [
    "assign",
    "return",
    "break",
    "call",
    "pre",
    "post"
  ];
  return semiColonWhitelist.includes(node.kind);
}

const expressionKinds = [
  "array",
  "variable",
  "constref",
  "yield",
  "yieldfrom",
  "lookup",
  "variable",
  "propertylookup",
  "staticlookup",
  "offsetlookup",
  "pre",
  "post",
  "bin",
  "parenthesis",
  "unary",
  "cast",
  "boolean",
  "string",
  "number",
  "inline",
  "magic",
  "nowdoc",
  "encapsed"
];
function printExpression(node) {
  const lookupKinds = ["propertylookup", "staticlookup", "offsetlookup"];
  function printLookup(node) {
    switch (node.kind) {
      case "propertylookup":
        return concat([printNode(node.what), "->", printNode(node.offset)]);
      case "staticlookup":
        return concat([printNode(node.what), "::", printNode(node.offset)]);
      case "offsetlookup":
        return concat([
          printNode(node.what),
          "[",
          node.offset ? printNode(node.offset) : "",
          "]"
        ]);
      default:
        return "Have not implemented lookup kind " + node.kind + " yet.";
    }
  }
  if (lookupKinds.includes(node.kind)) {
    return printLookup(node);
  }

  const operationKinds = ["pre", "post", "bin", "parenthesis", "unary", "cast"];
  function printOperation(node) {
    switch (node.kind) {
      case "pre":
        return concat([node.type + node.type, printNode(node.what)]);
      case "post":
        return concat([printNode(node.what), node.type + node.type]);
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
      case "cast":
      default:
        return "Have not implemented operation kind " + node.kind + " yet.";
    }
  }
  if (operationKinds.includes(node.kind)) {
    return printOperation(node);
  }

  const literalKinds = [
    "boolean",
    "string",
    "number",
    "inline",
    "magic",
    "nowdoc",
    "encapsed"
  ];
  function printLiteral(node) {
    switch (node.kind) {
      case "boolean":
        return node.value ? "true" : "false";
      case "string": {
        // @TODO: for now just reusing double/single quote preference from doc. could eventually
        // use setting from options. need to figure out how this works w/ complex strings and interpolation
        const quote = node.isDoubleQuote ? '"' : "'";
        return quote + node.value + quote;
      }
      case "number":
        return node.value;
      case "inline":
      case "magic":
      case "nowdoc":
      case "encapsed":
      default:
        return "Have not implemented literal kind " + node.kind + " yet.";
    }
  }
  if (literalKinds.includes(node.kind)) {
    return printLiteral(node);
  }

  switch (node.kind) {
    case "variable":
      return "$" + node.name;
    case "constref":
      if (typeof node.name === "object") {
        return printNode(node.name);
      }
      return node.name;
    case "array":
      return group(
        concat([
          node.shortForm ? "[" : "array(",
          indent(
            join(
              ", ",
              node.items.map(item => concat([softline, printNode(item)]))
            )
          ),
          softline,
          node.shortForm ? "]" : ")"
        ])
      );
    case "yield":
    case "yieldfrom":
    case "lookup":
    default:
      return "Have not implemented expression kind " + node.kind + " yet.";
  }
}

const statementKinds = [
  "eval",
  "exit",
  "halt",
  "clone",
  "declare",
  "global",
  "static",
  "include",
  "assign",
  "retif",
  "if",
  "do",
  "while",
  "for",
  "foreach",
  "switch",
  "goto",
  "silent",
  "try",
  "catch",
  "throw",
  "call",
  "closure",
  "new",
  "usegroup",
  "useitem",
  "block",
  "program",
  "namespace",
  "sys",
  "echo",
  "list",
  "print",
  "isset",
  "unset",
  "empty",
  "declaration",
  "class",
  "interface",
  "trait",
  "constant",
  "classconstant",
  "function",
  "method",
  "parameter",
  "property"
];
function printStatement(node) {
  const blockKinds = ["block", "program", "namespace"];
  function printBlock(node) {
    switch (node.kind) {
      case "block":
        return concat(
          node.children.map((child, i) => {
            if (i === 0) {
              return concat([
                printNode(child),
                lineShouldEndWithSemicolon(child) ? ";" : ""
              ]);
            }
            return concat([
              line,
              concat([
                printNode(child),
                lineShouldEndWithSemicolon(child) ? ";" : ""
              ])
            ]);
          })
        );
      case "program":
        return concat([
          "<?php",
          concat(
            node.children.map(child =>
              concat([
                line,
                printNode(child),
                lineShouldEndWithSemicolon(child) ? ";" : ""
              ])
            )
          )
        ]);
      case "namespace":
        return concat([
          "namespace ",
          node.name,
          ";",
          concat(
            node.children.map(usegroup =>
              concat([hardline, printNode(usegroup), ";"])
            )
          )
        ]);
      default:
        return "Have not implemented block kind " + node.kind + " yet.";
    }
  }
  if (blockKinds.includes(node.kind)) {
    return printBlock(node);
  }

  const sysKinds = ["sys", "echo", "list", "print", "isset", "unset", "empty"];
  function printSys(node) {
    switch (node.kind) {
      case "sys":
      case "echo":
      case "list":
      case "print":
      case "isset":
      case "unset":
      case "empty":
      default:
        return "Have not implemented sys kind " + node.kind + " yet.";
    }
  }
  if (sysKinds.includes(node.kind)) {
    return printSys(node);
  }

  const declarationKinds = [
    "class",
    "interface",
    "trait",
    "constant",
    "classconstant",
    "function",
    "method",
    "parameter",
    "property"
  ];
  function printDeclaration(node) {
    switch (node.kind) {
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
      case "method":
        return concat([
          group(
            concat([
              node.visibility,
              node.isStatic ? " static" : "",
              " function ",
              node.name,
              "("
            ])
          ),
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
      case "parameter":
        if (node.value) {
          return group(
            join(" = ", [concat(["$", node.name]), printNode(node.value)])
          );
        }
        return concat([node.variadic ? "..." : "", "$", node.name]);
      case "property":
        return concat([
          node.visibility,
          node.isStatic ? " static " : "",
          " $",
          node.name,
          node.value ? concat([" = ", printNode(node.value)]) : "",
          ";"
        ]);
      case "interface":
      case "trait":
      case "constant":
      case "classconstant":
      default:
        return "Have not implmented declaration kind " + node.kind + " yet.";
    }
  }
  if (declarationKinds.includes(node.kind)) {
    return printDeclaration(node);
  }

  switch (node.kind) {
    case "assign":
      return join(" = ", [printNode(node.left), printNode(node.right)]);
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
    case "while":
      return concat([
        "while (",
        printNode(node.test),
        ") {",
        indent(concat([line, printNode(node.body)])),
        line,
        "}"
      ]);
    case "for":
      return concat([
        "for (",
        group(
          concat([
            indent(
              concat([
                softline,
                group(
                  concat([concat(node.init.map(init => printNode(init))), ";"])
                ),
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
    case "call":
      return concat([
        printNode(node.what),
        "(",
        join(", ", node.arguments.map(argument => printNode(argument))),
        ")"
      ]);
    case "usegroup":
      return concat([
        "use ",
        join(", ", node.items.map(item => concat([printNode(item)])))
      ]);
    case "useitem":
      return node.name;
    case "retif":
    case "eval":
    case "exit":
    case "halt":
    case "clone":
    case "declare":
    case "global":
    case "static":
    case "include":
    case "goto":
    case "silent":
    case "try":
    case "catch":
    case "throw":
    case "closure":
    case "new":
    default:
      return "Have not implemented statement kind " + node.kind + " yet.";
  }
}

function printNode(node) {
  if (expressionKinds.includes(node.kind)) {
    return printExpression(node);
  }
  if (statementKinds.includes(node.kind)) {
    return printStatement(node);
  }
  switch (node.kind) {
    case "identifier":
      // @TODO: do we need to conider node.resolution?
      return node.name;
    case "case":
      return concat([
        node.test ? concat(["case ", printNode(node.test), ":"]) : "default:",
        indent(concat([line, printNode(node.body)]))
      ]);
    case "break":
      return "break";
    case "return":
      if (node.expr) {
        return concat(["return ", printNode(node.expr)]);
      }
      return "return";
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
    case "entry":
      return concat([
        node.key ? concat([printNode(node.key), " => "]) : "",
        printNode(node.value)
      ]);
    case "label":
    case "traituse":
    case "traitalias":
    case "traitprecedence":
    case "error":
    default:
      return "Have not implemented kind " + node.kind + " yet.";
  }
}

module.exports = genericPrint;

"use strict";

const {
  builders: { hardline, indent, join },
} = require("../document/index.js");
const preprocess = require("./print-preprocess.js");

function genericPrint(path, options, print) {
  const node = path.getValue();
  switch (node.type) {
    case "JsonRoot":
      return [print("node"), hardline];
    case "ArrayExpression": {
      if (node.elements.length === 0) {
        return "[]";
      }

      const printed = path.map(
        () => (path.getValue() === null ? "null" : print()),
        "elements"
      );

      return [
        "[",
        indent([hardline, join([",", hardline], printed)]),
        hardline,
        "]",
      ];
    }
    case "ObjectExpression":
      return node.properties.length === 0
        ? "{}"
        : [
            "{",
            indent([
              hardline,
              join([",", hardline], path.map(print, "properties")),
            ]),
            hardline,
            "}",
          ];
    case "ObjectProperty":
      return [print("key"), ": ", print("value")];
    case "UnaryExpression":
      return [node.operator === "+" ? "" : node.operator, print("argument")];
    case "NullLiteral":
      return "null";
    case "BooleanLiteral":
      return node.value ? "true" : "false";
    case "StringLiteral":
      return JSON.stringify(node.value);
    case "NumericLiteral":
      return isObjectKey(path)
        ? JSON.stringify(String(node.value))
        : JSON.stringify(node.value);
    case "Identifier":
      return isObjectKey(path) ? JSON.stringify(node.name) : node.name;
    case "TemplateLiteral":
      // There is only one `TemplateElement`
      return print(["quasis", 0]);
    case "TemplateElement":
      return JSON.stringify(node.value.cooked);
    default:
      /* istanbul ignore next */
      throw new Error("unknown type: " + JSON.stringify(node.type));
  }
}

function isObjectKey(path) {
  return (
    path.getName() === "key" && path.getParentNode().type === "ObjectProperty"
  );
}

const ignoredProperties = new Set([
  "start",
  "end",
  "extra",
  "loc",
  "comments",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "errors",
  "range",
  "tokens",
]);

function clean(node, newNode /*, parent*/) {
  const { type } = node;
  // We print quoted key
  if (type === "ObjectProperty") {
    const { key } = node;
    if (key.type === "Identifier") {
      newNode.key = { type: "StringLiteral", value: key.name };
    } else if (key.type === "NumericLiteral") {
      newNode.key = { type: "StringLiteral", value: String(key.value) };
    }
    return;
  }
  if (type === "UnaryExpression" && node.operator === "+") {
    return newNode.argument;
  }
  // We print holes in array as `null`
  if (type === "ArrayExpression") {
    for (const [index, element] of node.elements.entries()) {
      if (element === null) {
        newNode.elements.splice(index, 0, { type: "NullLiteral" });
      }
    }
    return;
  }
  // We print `TemplateLiteral` as string
  if (type === "TemplateLiteral") {
    return { type: "StringLiteral", value: node.quasis[0].value.cooked };
  }
}

clean.ignoredProperties = ignoredProperties;

module.exports = {
  preprocess,
  print: genericPrint,
  massageAstNode: clean,
};

"use strict";

const {
  printer: { printDocToString },
  builders: { hardline, indent, join },
} = require("../document");
const preprocess = require("./print-preprocess");

const isCspellJsonFile = (options) =>
  options.filepath && /(?:[/\\]|^)cspell\.json$/.test(options.filepath);

function genericPrint(path, options, print) {
  const node = path.getValue();
  switch (node.type) {
    case "JsonRoot": {
      const printed = print("node");

      // `cspell.json` file can't has final new line, and has to be indent with 4 space
      // https://github.com/streetsidesoftware/vscode-spell-checker/issues/391
      if (isCspellJsonFile(options)) {
        return printDocToString(printed, {
          ...options,
          tabWidth: 4,
          useTabs: false,
        }).formatted;
      }

      return [printed, hardline];
    }
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
    case "NumericLiteral":
      return JSON.stringify(node.value);
    case "Identifier": {
      const parent = path.getParentNode();
      if (parent && parent.type === "ObjectProperty" && parent.key === node) {
        return JSON.stringify(node.name);
      }
      return node.name;
    }
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
  if (type === "ObjectProperty" && node.key.type === "Identifier") {
    newNode.key = { type: "StringLiteral", value: node.key.name };
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

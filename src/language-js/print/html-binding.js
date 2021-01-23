"use strict";

const {
  builders: { join, line, group, softline, indent },
} = require("../../document");

function printHtmlBinding(path, options, print) {
  const node = path.getValue();

  if (options.__onHtmlBindingRoot && path.getName() === null) {
    options.__onHtmlBindingRoot(node, options);
  }

  if (node.type !== "File") {
    return;
  }

  if (options.__isVueForBindingLeft) {
    return path.call(
      (functionDeclarationPath) => {
        const printed = join(
          [",", line],
          functionDeclarationPath.map(print, "params")
        );

        const { params } = functionDeclarationPath.getValue();
        if (params.length === 1) {
          return printed;
        }

        return ["(", indent([softline, group(printed)]), softline, ")"];
      },
      "program",
      "body",
      0
    );
  }

  if (options.__isVueBindings) {
    return path.call(
      (functionDeclarationPath) =>
        join([",", line], functionDeclarationPath.map(print, "params")),
      "program",
      "body",
      0
    );
  }
}

// based on https://github.com/prettier/prettier/blob/main/src/language-html/syntax-vue.js isVueEventBindingExpression()
function isVueEventBindingExpression(node) {
  switch (node.type) {
    case "MemberExpression":
      switch (node.property.type) {
        case "Identifier":
        case "NumericLiteral":
        case "StringLiteral":
          return isVueEventBindingExpression(node.object);
      }
      return false;
    case "Identifier":
      return true;
    default:
      return false;
  }
}

module.exports = {
  isVueEventBindingExpression,
  printHtmlBinding,
};

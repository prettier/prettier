"use strict";

const {
  builders: { concat, join, line }
} = require("../doc");

function printHtmlBinding(path, options, print) {
  const node = path.getValue();

  if (options.__onHtmlBindingRoot && path.getName() === null) {
    options.__onHtmlBindingRoot(node);
  }

  if (node.type !== "File") {
    return;
  }

  if (options.__isVueForBindingLeft) {
    return path.call(
      functionDeclarationPath => {
        const { params } = functionDeclarationPath.getValue();
        return concat([
          params.length > 1 ? "(" : "",
          join(
            concat([",", line]),
            functionDeclarationPath.map(print, "params")
          ),
          params.length > 1 ? ")" : ""
        ]);
      },
      "program",
      "body",
      0
    );
  }

  if (options.__isVueSlotScope) {
    return path.call(
      functionDeclarationPath =>
        join(concat([",", line]), functionDeclarationPath.map(print, "params")),
      "program",
      "body",
      0
    );
  }
}

module.exports = {
  printHtmlBinding
};

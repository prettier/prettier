"use strict";
const path = require("path");

const selector = [
  ":matches(ImportDeclaration, ExportNamedDeclaration, ImportExpression)",
  " > ",
  "Literal.source",
].join("");

const messageId = "no-doc-index-import";
const docIndexFile = path.join(__dirname, "../../../src/document/index.js");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/no-doc-index-import.js",
    },
    messages: {
      [messageId]: "Do not {{type}} document/index.js file",
    },
  },
  create(context) {
    const dir = path.dirname(context.getPhysicalFilename());

    return {
      [selector](node) {
        const { value } = node;

        if (!value.startsWith(".") || path.join(dir, value) !== docIndexFile) {
          return;
        }

        context.report({
          node,
          messageId,
          data: {
            type: node.parent.type.slice(0, 6).toLowerCase(),
          },
        });
      },
    };
  },
};

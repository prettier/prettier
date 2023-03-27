"use strict";

const selector = [
  "ImportDeclaration",
  "[specifiers.length=1]",
  '[source.value="node:fs"]',
  ">",
  "ImportSpecifier:first-child",
  '[imported.name="promises"]',
].join("");

const messageId = "prefer-fs-promises-submodule";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/prefer-fs-promises-submodule.js",
    },
    messages: {
      [messageId]:
        'Prefer `import fs from "node:fs/promises"` instead of `import { promises as fs } from "fs";`',
    },
  },
  create(context) {
    return {
      [selector](node) {
        context.report({
          node,
          messageId,
        });
      },
    };
  },
};

const selector = [
  "ImportDeclaration",
  "[specifiers.length=1]",
  '[source.value="node:fs"]',
  ">",
  "ImportSpecifier:first-child",
  '[imported.name="promises"]',
].join("");

const messageId = "prefer-fs-promises-submodule";

export default {
  meta: {
    type: "suggestion",
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

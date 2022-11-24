"use strict";

const selector = [
  "CallExpression",
  ">",
  "Identifier.callee",
  '[name="concat"]',
].join("");

const messageId = "no-doc-builder-concat";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/no-doc-builder-concat.js",
    },
    messages: {
      [messageId]: "Use array directly instead of `concat([])`",
    },
    fixable: "code",
  },
  create(context) {
    return {
      [selector](node) {
        context.report({
          node,
          messageId,
          fix: (fixer) => fixer.replaceText(node, ""),
        });
      },
    };
  },
};

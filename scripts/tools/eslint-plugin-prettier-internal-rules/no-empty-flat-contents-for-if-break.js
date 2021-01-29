"use strict";

const selector = [
  "CallExpression",
  '[callee.name="ifBreak"]',
  "[arguments.length=2]",
  ':not([arguments.0.type="SpreadElement"])',
  ">",
  ":last-child",
  '[value=""]',
].join("");

const messageId = "no-empty-flat-contents-for-if-break";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url:
        "https://github.com/prettier/prettier/blob/main/scripts/eslint-plugin-prettier-internal-rules/no-empty-flat-contents-for-if-break.js",
    },
    messages: {
      [messageId]:
        "Please don't pass an empty string to second parameter of ifBreak.",
    },
    fixable: "code",
  },
  create(context) {
    return {
      [selector](node) {
        const { parent } = node;
        const firstArg = parent.arguments[0];
        context.report({
          node,
          messageId,
          fix: (fixer) =>
            fixer.removeRange([firstArg.range[1], parent.range[1] - 1]),
        });
      },
    };
  },
};

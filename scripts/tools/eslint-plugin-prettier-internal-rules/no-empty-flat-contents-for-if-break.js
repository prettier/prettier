"use strict";

const selector = [
  "CallExpression",
  "[optional=false]",
  '[callee.type="Identifier"]',
  '[callee.name="ifBreak"]',
  "[arguments.length=2]",
  '[arguments.1.type="Literal"]',
  '[arguments.1.value=""]',
  ':not([arguments.0.type="SpreadElement"])',
].join("");

const messageId = "no-empty-flat-contents-for-if-break";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/no-empty-flat-contents-for-if-break.js",
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
        const [breakContents] = node.arguments;
        context.report({
          node,
          messageId,
          fix: (fixer) =>
            fixer.removeRange([breakContents.range[1], node.range[1] - 1]),
        });
      },
    };
  },
};

"use strict";

const selector = [
  "MemberExpression",
  "[computed=false]",
  '[property.type="Identifier"]',
  ':matches([property.name="locStart"], [property.name="locEnd"])',
].join("");

const MESSAGE_ID = "directly-loc-start-end";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/directly-loc-start-end.js",
    },
    messages: {
      [MESSAGE_ID]:
        "Please import `{{function}}` function and use it directly.",
    },
    fixable: "code",
  },
  create(context) {
    return {
      [selector](node) {
        context.report({
          node,
          messageId: MESSAGE_ID,
          data: { function: node.property.name },
          fix: (fixer) =>
            fixer.replaceTextRange([node.range[0], node.property.range[0]], ""),
        });
      },
    };
  },
};

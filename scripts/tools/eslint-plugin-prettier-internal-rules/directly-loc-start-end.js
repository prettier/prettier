"use strict";

const selector = [
  "MemberExpression",
  "[computed=false]",
  '[property.type="Identifier"]',
  ':matches([property.name="locStart"], [property.name="locEnd"])',
].join("");

const MESSAGE_ID = "direct-loc-start-end";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url:
        "https://github.com/prettier/prettier/blob/master/scripts/eslint-plugin-prettier-internal-rules/direct-loc-start-end.js",
    },
    messages: {
      [MESSAGE_ID]:
        "Call `{{function}}` directly from `src/language-js/loc.js`.",
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

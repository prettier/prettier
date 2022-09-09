"use strict";

const selector = [
  "CallExpression[arguments.length=0]",
  "> MemberExpression[object.name='path'][property.name='getNode']",
].join("");

const messageId = "prefer-path-get-value";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/prefer-path-get-value.js",
    },
    messages: {
      [messageId]: "Prefer `path.getValue()` instead of `path.getNode()`",
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

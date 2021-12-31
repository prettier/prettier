"use strict";

const selector = [
  "CallExpression",
  '[callee.type="Identifier"]',
  '[callee.name="runPrettier"]',
  `:not(${[
    "AwaitExpression > .argument",
    'CallExpression > MemberExpression.callee[property.type="Identifier"][property.name="test"] > .object',
  ].join(", ")})`,
].join("");

const MESSAGE_ID = "no-multiple-cli-tests";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/no-identifier-n.js",
    },
    messages: {
      [MESSAGE_ID]: "'runPrettier()' should be awaited or calling `.test()`.",
    },
  },
  create(context) {
    return {
      [selector](node) {
        context.report({ node, messageId: MESSAGE_ID });
      },
    };
  },
};

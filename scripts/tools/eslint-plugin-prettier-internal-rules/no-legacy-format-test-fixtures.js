"use strict";

const dirnameArgumentSelector = [
  "CallExpression",
  '[callee.type="Identifier"]',
  '[callee.name="run_spec"]',
  " > ",
  "Identifier.arguments:first-child",
  '[name="__dirname"]',
].join("");

const dirnamePropertySelector = [
  "CallExpression",
  '[callee.type="Identifier"]',
  '[callee.name="run_spec"]',
  " > ",
  "ObjectExpression.arguments:first-child",
  " > ",
  "Property.properties",
  '[key.type="Identifier"]',
  '[key.name="dirname"]',
  '[value.type="Identifier"]',
  '[value.name="__dirname"]',
].join("");

const MESSAGE_ID_ARGUMENT = "dirname-argument";
const MESSAGE_ID_PROPERTY = "dirname-property";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/no-legacy-format-test-fixtures.js",
    },
    messages: {
      [MESSAGE_ID_ARGUMENT]: "Use `import.meta` instead of `__dirname`.",
      [MESSAGE_ID_PROPERTY]:
        "Use `importMeta: import.meta` instead of `dirname: __dirname`.",
    },
    fixable: "code",
    hasSuggestions: true,
  },
  create(context) {
    return {
      [dirnameArgumentSelector](node) {
        context.report({
          node,
          messageId: MESSAGE_ID_ARGUMENT,
          fix: (fixer) => fixer.replaceText(node, "import.meta"),
        });
      },
      [dirnamePropertySelector](node) {
        context.report({
          node,
          messageId: MESSAGE_ID_PROPERTY,
          fix: (fixer) => [
            fixer.replaceText(node.key, "importMeta"),
            fixer.replaceText(node.value, "import.meta"),
          ],
        });
      },
    };
  },
};

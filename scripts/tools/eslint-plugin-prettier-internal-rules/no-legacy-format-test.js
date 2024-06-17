"use strict";

const path = require("path");

const legacyRunFormatTestCall = [
  "CallExpression",
  '[callee.type="Identifier"]',
  '[callee.name="run_spec"]',
].join("");

const runFormatTestCall = [
  "CallExpression",
  '[callee.type="Identifier"]',
  '[callee.name="runFormatTest"]',
].join("");

const dirnameArgumentSelector = [
  runFormatTestCall,
  " > ",
  "Identifier.arguments:first-child",
  '[name="__dirname"]',
].join("");

const dirnamePropertySelector = [
  runFormatTestCall,
  " > ",
  "ObjectExpression.arguments:first-child",
  " > ",
  "Property.properties",
  '[key.type="Identifier"]',
  '[key.name="dirname"]',
  '[value.type="Identifier"]',
  '[value.name="__dirname"]',
].join("");

const MESSAGE_ID_LEGACY_FUNCTION_NAME = "legacy-function-name";
const MESSAGE_ID_ARGUMENT = "dirname-argument";
const MESSAGE_ID_PROPERTY = "dirname-property";
const MESSAGE_ID_LEGACY_FILENAME = "legacy-filename";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/no-legacy-format-test.js",
    },
    messages: {
      [MESSAGE_ID_LEGACY_FUNCTION_NAME]:
        "Use `runFormatTest(…)` instead of `run_spec(…)`.",
      [MESSAGE_ID_ARGUMENT]: "Use `import.meta` instead of `__dirname`.",
      [MESSAGE_ID_PROPERTY]:
        "Use `importMeta: import.meta` instead of `dirname: __dirname`.",
      [MESSAGE_ID_LEGACY_FILENAME]: "File should be named as 'format.test.js'.",
    },
    fixable: "code",
    hasSuggestions: true,
  },
  create(context) {
    return {
      [legacyRunFormatTestCall](callExpression) {
        context.report({
          node: callExpression.callee,
          messageId: MESSAGE_ID_LEGACY_FUNCTION_NAME,
          fix: (fixer) =>
            fixer.replaceText(callExpression.callee, "runFormatTest"),
        });
      },
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
      Program(node) {
        const filename = path.basename(context.physicalFilename);
        if (filename !== "jsfmt.spec.js") {
          return;
        }

        context.report({
          node,
          messageId: MESSAGE_ID_LEGACY_FILENAME,
        });
      },
    };
  },
};

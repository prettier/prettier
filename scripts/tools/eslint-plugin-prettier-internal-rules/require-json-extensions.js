"use strict";

const path = require("path");

const SELECTOR = [
  "CallExpression",
  '[callee.type="Identifier"]',
  '[callee.name="require"]',
  "[arguments.length=1]",
  '[arguments.0.type="Literal"]',
  ">",
  "Literal.arguments",
].join("");

const MESSAGE_ID = "require-json-extensions";

const resolveModuleInDirectory = (directory, id) => {
  try {
    return require.resolve(id, { paths: [directory] });
  } catch {
    // noop
  }
};

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/require-json-extensions.js",
    },
    messages: {
      [MESSAGE_ID]: 'Missing file extension ".json" for "{{id}}".',
    },
    fixable: "code",
  },
  create(context) {
    const filename = context.getFilename();
    const directory = path.dirname(filename);
    const resolve = (id) => resolveModuleInDirectory(directory, id);

    return {
      [SELECTOR](node) {
        const id = node.value;

        if (id.endsWith(".json") || !id.includes("/")) {
          return;
        }

        const file = resolve(id);

        if (!file) {
          return;
        }

        const extension = path.extname(file);
        if (extension !== ".json") {
          return;
        }

        let fix;
        if (resolve(`${id}.json`) === file) {
          fix = (fixer) => {
            const [start, end] = node.range;
            return fixer.replaceTextRange([start + 1, end - 1], `${id}.json`);
          };
        }

        context.report({
          node,
          messageId: MESSAGE_ID,
          data: { id },
          fix,
        });
      },
    };
  },
};

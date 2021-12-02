"use strict";

const MESSAGE_ID = "jsx-identifier-case";

// To ignore variables, config eslint like this
// {'prettier-internal-rules/jsx-identifier-case': ['error', 'name1', ... 'nameN']}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/jsx-identifier-case.js",
    },
    messages: {
      [MESSAGE_ID]: "Please rename '{{name}}' to '{{fixed}}'.",
    },
    fixable: "code",
  },
  create(context) {
    const ignored = new Set(context.options);
    return {
      "Identifier[name=/JSX/]:not(ObjectExpression > Property.properties > .key)"(
        node
      ) {
        const { name } = node;

        if (ignored.has(name)) {
          return;
        }

        const fixed = name.replace(/JSX/g, "Jsx");
        context.report({
          node,
          messageId: MESSAGE_ID,
          data: { name, fixed },
          fix: (fixer) => fixer.replaceText(node, fixed),
        });
      },
    };
  },
  schema: {
    type: "array",
    uniqueItems: true,
  },
};

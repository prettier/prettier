const MESSAGE_ID = "jsx-identifier-case";

// To ignore variables, config eslint like this
// {'prettier-internal-rules/jsx-identifier-case': ['error', 'name1', ... 'nameN']}

export default {
  meta: {
    type: "suggestion",
    messages: {
      [MESSAGE_ID]: "Please rename '{{name}}' to '{{fixed}}'.",
    },
    fixable: "code",
    schema: {
      type: "array",
      uniqueItems: true,
    },
  },
  create(context) {
    const ignored = new Set(context.options);
    return {
      "Identifier[name=/JSX/]:not(ObjectExpression > Property.properties > .key)"(
        node,
      ) {
        const { name } = node;

        if (ignored.has(name)) {
          return;
        }

        const fixed = name.replaceAll("JSX", "Jsx");
        context.report({
          node,
          messageId: MESSAGE_ID,
          data: { name, fixed },
          fix: (fixer) => fixer.replaceText(node, fixed),
        });
      },
    };
  },
};

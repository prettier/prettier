const selector = [
  "MemberExpression",
  "[computed=false]",
  '[property.type="Identifier"]',
  ':matches([property.name="locStart"], [property.name="locEnd"])',
].join("");

const MESSAGE_ID = "directly-loc-start-end";

export default {
  meta: {
    type: "suggestion",
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

const selector = [
  "ExpressionStatement",
  ">",
  "CallExpression.expression",
  "[optional=false]",
  ">",
  "MemberExpression.callee",
  "[computed=false]",
  "[optional=false]",
  ">",
  "Identifier.property",
  '[name="map"]',
].join("");

const messageId = "prefer-ast-path-each";

export default {
  meta: {
    type: "suggestion",
    messages: {
      [messageId]: "Prefer `AstPath#each()` over `AstPath#map()`.",
    },
    fixable: "code",
  },
  create(context) {
    return {
      [selector](node) {
        context.report({
          node,
          messageId,
          fix: (fixer) => fixer.replaceText(node, "each"),
        });
      },
    };
  },
};

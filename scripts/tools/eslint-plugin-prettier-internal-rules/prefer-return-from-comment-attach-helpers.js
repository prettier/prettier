const callExpressionSelector = [
  "ExpressionStatement",
  '[expression.type="CallExpression"]',
  "[expression.optional!=true]",
  '[expression.callee.type="Identifier"]',
  "[expression.callee.name=/^add(?:Trailing|Leading|Dangling)Comment$/]",
].join("");
const returnStatementSelector = [
  "ReturnStatement",
  '[argument.type="Literal"]',
  '[argument.raw="true"]',
].join("");

const selector = `${callExpressionSelector} + ${returnStatementSelector}`;
const messageId = "prefer-return-from-comment-attach-helpers";

function getPreviousNode(node, context) {
  const { parent } = node;
  const visitorKeys =
    context.sourceCode.visitorKeys[parent.type] || Object.keys(parent);

  for (const property of visitorKeys) {
    const value = parent[property];

    if (value !== node && Array.isArray(value)) {
      const index = value.indexOf(node);

      if (index !== -1) {
        return value[index - 1];
      }
    }
  }
}

export default {
  meta: {
    type: "suggestion",
    messages: {
      [messageId]: "Prefer return from `{{functionName}}(…)`.",
    },
    fixable: "code",
  },
  create(context) {
    return {
      [selector](node) {
        context.report({
          node,
          messageId,
          *fix(fixer) {
            const expressionStatement = getPreviousNode(node, context);
            const callExpression = expressionStatement.expression;
            yield fixer.remove(node);
            yield fixer.insertTextBefore(callExpression, "return ");
          },
        });
      },
    };
  },
};

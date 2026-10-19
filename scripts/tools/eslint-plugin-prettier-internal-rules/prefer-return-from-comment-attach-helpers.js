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
      [selector](returnStatement) {
        context.report({
          node: returnStatement,
          messageId,
          *fix(fixer) {
            // Remove `return true;`
            yield fixer.remove(returnStatement);

            const expressionStatement = getPreviousNode(
              returnStatement,
              context,
            );
            const callExpression = expressionStatement.expression;
            yield fixer.insertTextBefore(callExpression, "return ");

            // Remove indention of the `ReturnStatement`
            const start = expressionStatement.range[1];
            const end = returnStatement.range[0];
            if (!context.sourceCode.text.slice(start, end).trim()) {
              yield fixer.removeRange([start, end]);
            }
          },
        });
      },
    };
  },
};

"use strict";

const messageId = "print-function-parameter-order";
const parameters = ["path", "options", "print"];

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url:
        "https://github.com/prettier/prettier/blob/main/scripts/eslint-plugin-prettier-internal-rules/print-function-parameter-order.js",
    },
    messages: {
      [messageId]:
        "`{{functionName}}` function parameters should in order of `path`, `options` and `print`.",
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      "FunctionDeclaration[id.name=/^print/]"(node) {
        let shouldReport = false;

        for (const [index, parameter] of node.params.entries()) {
          const { type, name } = parameter;
          if (type !== "Identifier") {
            return;
          }
          const correctIndex = parameters.indexOf(name);
          if (correctIndex === -1) {
            return;
          }

          if (correctIndex !== index) {
            shouldReport = true;
          }

          if (index === parameters.length - 1) {
            break;
          }
        }

        if (!shouldReport) {
          return;
        }

        const firstToken = sourceCode.getFirstToken(node);
        const tokenBeforeBody = sourceCode.getTokenBefore(node.body);
        context.report({
          node,
          loc: {
            start: firstToken.loc.start,
            end: tokenBeforeBody.loc.end,
          },
          messageId,
          data: { functionName: node.id.name },
        });
      },
    };
  },
};

const messageId = "print-function-parameter-order";
const expectedParameters = ["path", "options", "print"];

export default {
  meta: {
    type: "suggestion",
    messages: {
      [messageId]:
        "`{{functionName}}` function parameters should in order of `path`, `options` and `print`.",
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      ":function[params.length>=3]"(node) {
        const parameterNames = node.params.map((node) =>
          node.type === "Identifier" ? node.name : "",
        );

        // `embed` function order is `textToDoc, print, path, options`
        if (parameterNames.includes("textToDoc")) {
          return;
        }

        // Only if all three parameters exists
        if (expectedParameters.some((name) => !parameterNames.includes(name))) {
          return;
        }

        // In correct order
        if (
          expectedParameters.every(
            (name, index) => name === parameterNames[index],
          )
        ) {
          return;
        }

        const firstToken = sourceCode.getFirstToken(node);
        const tokenBeforeBody = sourceCode.getTokenBefore(node.body);
        const functionName = node.id ? node.id.name : "print*";
        context.report({
          node,
          loc: {
            start: firstToken.loc.start,
            end: tokenBeforeBody.loc.end,
          },
          messageId,
          data: { functionName },
        });
      },
    };
  },
};

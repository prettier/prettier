const messageId = "no-useless-path-callback-parameter";

export default {
  meta: {
    type: "suggestion",
    messages: {
      [messageId]: "Use `{{name}}` directly.",
    },
    fixable: "code",
  },
  create(context) {
    return {
      CallExpression(callExpression) {
        const { callee } = callExpression;

        if (
          !(
            !callExpression.optional &&
            callExpression.arguments.length > 0 &&
            callee.type === "MemberExpression" &&
            !callee.optional &&
            !callee.computed &&
            callee.object.type === "Identifier" &&
            callee.property.type === "Identifier" &&
            (callee.property.name === "call" ||
              callee.property.name === "callParent" ||
              callee.property.name === "each" ||
              callee.property.name === "map")
          )
        ) {
          return;
        }

        const objectName = callee.object.name;
        if (!(objectName === "path" || objectName.endsWith("Path"))) {
          return;
        }

        const [callback] = callExpression.arguments;
        if (
          !(
            callback.type === "FunctionExpression" ||
            callback.type === "ArrowFunctionExpression"
          )
        ) {
          return;
        }

        const [parameter] = callback.params;
        if (!(parameter?.type === "Identifier")) {
          return;
        }

        const problem = {
          node: parameter,
          messageId,
          data: { name: objectName },
        };

        if (callback.params.length === 1) {
          const { sourceCode } = context;
          const variable =
            parameter.name === objectName
              ? undefined
              : sourceCode
                  .getDeclaredVariables(callback)
                  .find((variable) => variable.defs[0]?.name === parameter);

          if (variable || parameter.name === objectName) {
            problem.fix = function* (fixer) {
              yield fixer.remove(parameter);

              const tokenAfter = sourceCode.getTokenAfter(parameter);

              if (tokenAfter.value === ",") {
                yield fixer.remove(tokenAfter);
              }

              if (parameter.name !== objectName) {
                for (const reference of variable.references) {
                  yield fixer.replaceText(reference.identifier, objectName);
                }
              }
            };
          }
        }

        context.report(problem);
      },
    };
  },
};

const MESSAGE_ID_PATH = "error/path";

function checkPathParameter(context, callExpression) {
  const [callback] = callExpression.arguments;
  const objectName = callExpression.callee.object.name;
  const pathParameter = callback.params[0];
  if (!(pathParameter?.type === "Identifier")) {
    return;
  }

  const problem = {
    node: pathParameter,
    messageId: MESSAGE_ID_PATH,
    data: { name: objectName },
  };

  if (callback.params.length === 1) {
    const { sourceCode } = context;
    const variable =
      pathParameter.name === objectName
        ? undefined
        : sourceCode
            .getDeclaredVariables(callback)
            .find((variable) => variable.defs[0]?.name === pathParameter);

    if (variable || pathParameter.name === objectName) {
      problem.fix = function* (fixer) {
        yield fixer.remove(pathParameter);

        const tokenAfter = sourceCode.getTokenAfter(pathParameter);

        if (tokenAfter.value === ",") {
          yield fixer.remove(tokenAfter);
        }

        if (pathParameter.name !== objectName) {
          for (const reference of variable.references) {
            yield fixer.replaceText(reference.identifier, objectName);
          }
        }
      };
    }
  }

  context.report(problem);
}

export default {
  meta: {
    type: "suggestion",
    messages: {
      [MESSAGE_ID_PATH]:
        "Use `{{name}}` instead of the first parameter directly.",
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

        checkPathParameter(context, callExpression);
      },
    };
  },
};

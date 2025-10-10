const MESSAGE_ID_PATH = "error/path";
const MESSAGE_ID_INDEX = "error/index";
const MESSAGE_ID_VALUE = "error/value";
const messages = {
  [MESSAGE_ID_PATH]: "Use `{{name}}` directly instead of the first parameter.",
  [MESSAGE_ID_INDEX]:
    "Use `{{name}}.{{property}}` instead of the second parameter.",
  [MESSAGE_ID_VALUE]:
    "Use `{{name}}.{{property}}` instead of the third parameter.",
};

function checkPathParameter(context, callExpression) {
  const [callback] = callExpression.arguments;
  if (callback.params.length === 0) {
    return;
  }

  const parameter = callback.params[0];
  if (parameter.type !== "Identifier") {
    return;
  }

  const objectName = callExpression.callee.object.name;

  const problem = {
    node: parameter,
    messageId: MESSAGE_ID_PATH,
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
}

function createIndexOrValueParameterChecker(parameterIndex) {
  const settings =
    parameterIndex === 1
      ? {
          parameterName: "index",
          messageId: MESSAGE_ID_INDEX,
          property: "index",
        }
      : {
          parameterName: "value",
          messageId: MESSAGE_ID_VALUE,
          property: "siblings",
        };

  return (context, callExpression) => {
    const methodName = callExpression.callee.property.name;
    if (methodName !== "each" && methodName !== "map") {
      return;
    }

    const [callback] = callExpression.arguments;
    if (callback.params.length < parameterIndex + 1) {
      return;
    }

    const parameter = callback.params[parameterIndex];
    const objectName = callExpression.callee.object.name;

    const problem = {
      node: parameter,
      messageId: settings.messageId,
      data: { name: objectName, property: settings.property },
    };

    context.report(problem);
  };
}

const checkIndexParameter = createIndexOrValueParameterChecker(1);
const checkValueParameter = createIndexOrValueParameterChecker(2);

export default {
  meta: {
    type: "suggestion",
    messages,
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
        checkIndexParameter(context, callExpression);
        checkValueParameter(context, callExpression);
      },
    };
  },
};

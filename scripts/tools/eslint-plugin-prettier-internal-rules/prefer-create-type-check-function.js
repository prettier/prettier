const MESSAGE_ID = "prefer-create-type-check-function";

const isTypeAccess = (node, parameterName) => {
  if (node.type === "ChainExpression") {
    node = node.expression;
  }

  return (
    node.type === "MemberExpression" &&
    !node.computed &&
    node.object.type === "Identifier" &&
    node.object.name === parameterName &&
    node.property.type === "Identifier" &&
    node.property.name === "type"
  );
};

const isEqualCheck = (node) =>
  node.type === "BinaryExpression" && node.operator === "===";

const isTypeIdentifier = (node) =>
  node.type === "Identifier" && node.name === "type";

const isTypeIdentifierCheck = (node) =>
  isEqualCheck(node) && isTypeIdentifier(node.left);
const isTypeAccessCheck = (node, parameterName) =>
  isEqualCheck(node) && isTypeAccess(node.left, parameterName);

const isSetHasOrArrayIncludesCall = (node) =>
  node.type === "CallExpression" &&
  node.arguments.length === 1 &&
  node.callee.type === "MemberExpression" &&
  node.callee.property.type === "Identifier" &&
  (node.callee.property.name === "has" ||
    node.callee.property.name === "includes");

const isMultipleTypeAccessCheck = (node, parameterName) =>
  isSetHasOrArrayIncludesCall(node) &&
  isTypeAccess(node.arguments[0], parameterName);

const isMultipleTypeIdentifierCheck = (node) =>
  isSetHasOrArrayIncludesCall(node) && isTypeIdentifier(node.arguments[0]);

function getTypesFromNodeParameter(node, parameterName) {
  if (isTypeAccessCheck(node, parameterName)) {
    return [{ type: "single", node: node.right }];
  }
  if (isMultipleTypeAccessCheck(node, parameterName)) {
    return [{ type: "multiple", node: node.callee.object }];
  }

  if (node.type === "LogicalExpression" && node.operator === "||") {
    const left = getTypesFromNodeParameter(node.left, parameterName);

    if (!left) {
      return;
    }
    const right = getTypesFromNodeParameter(node.right, parameterName);

    if (!right) {
      return;
    }

    return [...left, ...right];
  }
}

function getTypesFromTypeParameter(node) {
  if (isTypeIdentifierCheck(node)) {
    return [{ type: "single", node: node.right }];
  }
  if (isMultipleTypeIdentifierCheck(node)) {
    return [{ type: "multiple", node: node.callee.object }];
  }

  if (node.type === "LogicalExpression" && node.operator === "||") {
    const left = getTypesFromTypeParameter(node.left);

    if (!left) {
      return;
    }
    const right = getTypesFromTypeParameter(node.right);

    if (!right) {
      return;
    }

    return [...left, ...right];
  }
}

function getTypes(node, parameter) {
  // `function(node) {}`
  if (parameter.type === "Identifier") {
    return getTypesFromNodeParameter(node, parameter.name);
  }

  // `function({type}) {}`
  if (
    parameter.type === "ObjectPattern" &&
    parameter.properties.length === 1 &&
    parameter.properties[0].type === "Property"
  ) {
    const [{ shorthand, computed, key, value }] = parameter.properties;

    if (
      shorthand &&
      !computed &&
      key.type === "Identifier" &&
      key.name === "type" &&
      value.type === "Identifier" &&
      value.name === "type"
    ) {
      return getTypesFromTypeParameter(node);
    }
  }
}

function isTopLevelFunction(node) {
  return (
    node.parent.type === "Program" ||
    (node.parent.type === "VariableDeclarator" &&
      node.parent.parent.type === "VariableDeclaration" &&
      node.parent.parent.parent.type === "Program") ||
    node.parent.type === "ExportDefaultDeclaration"
  );
}

const selector = [
  ":function",
  "[params.length=1]",
  "[async!=true]",
  "[generator!=true]",
].join("");

export default {
  meta: {
    type: "suggestion",
    messages: {
      [MESSAGE_ID]:
        "Prefer use `createTypeCheckFunction` to create this function",
    },
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          ignoreSingleType: {
            type: "boolean",
            default: false,
          },
          onlyTopLevelFunctions: {
            type: "boolean",
            default: false,
          },
        },
      },
    ],
    fixable: "code",
  },
  create(context) {
    const { ignoreSingleType = false, onlyTopLevelFunctions = false } = {
      ...context.options[0],
    };
    const sourceCode = context.getSourceCode();

    return {
      [selector](functionNode) {
        if (onlyTopLevelFunctions && !isTopLevelFunction(functionNode)) {
          return;
        }

        let returnStatementArgument = functionNode.body;
        if (functionNode.body.type === "BlockStatement") {
          const { body } = functionNode;
          if (
            body.body.length !== 1 ||
            body.body[0].type !== "ReturnStatement" ||
            !body.body[0].argument
          ) {
            return;
          }
          returnStatementArgument = body.body[0].argument;
        }

        const [parameter] = functionNode.params;
        const types = getTypes(returnStatementArgument, parameter);

        if (!types) {
          return;
        }

        if (
          ignoreSingleType &&
          types.length === 1 &&
          types[0].type === "single"
        ) {
          return;
        }

        const problem = {
          node: functionNode,
          messageId: MESSAGE_ID,
        };

        const commentsInFunction =
          sourceCode.getCommentsInside(functionNode).length;
        const commentsInTypes =
          commentsInFunction === 0
            ? 0
            : types.reduce(
                (count, { node }) =>
                  count + sourceCode.getCommentsInside(node).length,
                0,
              );

        if (commentsInFunction === commentsInTypes) {
          problem.fix = (fixer) => {
            const typesText =
              types.length === 1 && types[0].type === "multiple"
                ? sourceCode.getText(types[0].node)
                : `[${types
                    .map(
                      ({ type, node }) =>
                        `${type === "single" ? "" : "..."}${sourceCode.getText(
                          node,
                        )}`,
                    )
                    .join(", ")}]`;

            let text = `createTypeCheckFunction(${typesText})`;

            if (functionNode.type === "FunctionDeclaration") {
              const functionName =
                functionNode.id?.name ?? "__please_name_this_function";
              text = `const ${functionName} = ${text};`;

              if (
                functionNode.parent.type === "ExportDefaultDeclaration" &&
                functionNode.parent.declaration === functionNode
              ) {
                return fixer.replaceText(
                  functionNode.parent,
                  `${text}\nexport default ${functionName};`,
                );
              }
            }

            return fixer.replaceText(functionNode, text);
          };
        }

        context.report(problem);
      },
    };
  },
};

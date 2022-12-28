"use strict";

/*
- `function foo() {return node.type === 'Identifier'}`
- `() => {return node.type === 'Identifier'}`
- `() => node.type === 'Identifier'`
*/

const MESSAGE_ID = "prefer-create-type-check-function";

const isTypeAccess = (node, parameterName) => {
  if (node.type === "ChainExpression") {
    node = node.expression;
  }

  return (
    node.type === "MemberExpression" &&
    !node.computed &&
    node.object.type === "Identifier" &&
    node.object.name === parameterName
  );
};

const isTypeCheck = (node, parameterName) =>
  node.type === "BinaryExpression" &&
  node.operator === "===" &&
  isTypeAccess(node.left, parameterName) &&
  node.right.type === "Literal" &&
  typeof node.right.value === "string";
function getTypes(node, parameterName) {
  if (isTypeCheck(node, parameterName)) {
    return [node.right.value];
  }

  if (node.type === "LogicalExpression" && node.operator === "||") {
    const left = getTypes(node.left, parameterName);

    if (!left) {
      return;
    }
    const right = getTypes(node.right, parameterName);

    if (!right) {
      return;
    }

    return [...left, ...right];
  }
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/prefer-create-type-check-function.js",
    },
    messages: {
      [MESSAGE_ID]:
        "Prefer use `createTypeCheckFunction` to create this function",
    },
    fixable: "code",
  },
  create(context) {
    return {
      ':function[params.length=1][params.0.type="Identifier"][async!=true][generator!=true]'(
        functionNode
      ) {
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

        const parameterName = functionNode.params[0].name;
        const types = getTypes(returnStatementArgument, parameterName);
        if (!types) {
          return;
        }

        context.report({
          node: functionNode,
          messageId: MESSAGE_ID,
          fix(fixer) {
            let text = `createTypeCheckFunction(${JSON.stringify(
              types,
              undefined,
              2
            )})`;
            if (functionNode.type === "FunctionDeclaration") {
              text = `${text};`;

              if (
                !(
                  functionNode.parent.type === "ExportDefaultDeclaration" &&
                  functionNode.parent.declaration === functionNode
                )
              ) {
                text = `const ${functionNode.id.name} = ${text}`;
              }
            }

            return fixer.replaceText(functionNode, text);
          },
        });
      },
    };
  },
};

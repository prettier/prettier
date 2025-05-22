const MESSAGE_ID = "massage-ast-parameter-names";

const massageAstFunctionSelector = [
  "FunctionDeclaration",
  "[async!=true]",
  "[generator!=true]",
  '[id.type="Identifier"]',
  '[id.name="clean"]',
].join("");

const getVariableIdentifiers = ({ identifiers, references }) => [
  ...new Set([
    ...identifiers,
    ...references.map(({ identifier }) => identifier),
  ]),
];

export default {
  meta: {
    type: "suggestion",
    messages: {
      [MESSAGE_ID]:
        "The {{name}} node parameter '{{original}}' should be named '{{name}}'.",
    },
    fixable: "code",
    schema: {
      type: "array",
      uniqueItems: true,
    },
  },
  create: (context) =>
    Object.fromEntries(
      ["original", "cloned"].map((name, index) => [
        `${massageAstFunctionSelector} > Identifier[name!="${name}"].params:nth-child(${index + 1})`,
        (parameter) => {
          const variables = context.sourceCode.getDeclaredVariables(
            parameter.parent,
          );
          const variable = variables.find(
            (variable) => variable.name === parameter.name,
          );
          if (!variable) {
            throw new Error("Unexpected error.");
          }

          context.report({
            node: parameter,
            messageId: MESSAGE_ID,
            data: { original: parameter.name, name },
            // Good enough for our use case
            // A prefect fix should be https://github.com/sindresorhus/eslint-plugin-unicorn/blob/702d51bed176a9c2c93bc4a2ca52e700dd0c2339/rules/fix/rename-variable.js#L5
            fix: (fixer) =>
              getVariableIdentifiers(variable).map((node) =>
                fixer.replaceText(node, name),
              ),
          });
        },
      ]),
    ),
};

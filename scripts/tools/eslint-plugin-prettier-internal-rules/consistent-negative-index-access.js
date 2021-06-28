"use strict";

const selector = [
  "MemberExpression",
  "[computed=true]",
  "[optional=false]",
  '[property.type="BinaryExpression"]',
  '[property.operator="-"]',
  '[property.left.type="MemberExpression"]',
  "[property.left.optional=false]",
  "[property.left.computed=false]",
  '[property.left.property.type="Identifier"]',
  '[property.left.property.name="length"]',
  '[property.right.type="Literal"]',
  `:not(${[
    "AssignmentExpression > .left",
    "UpdateExpression > .argument",
    // Ignore `getPenultimate` and `getLast` function self
    'VariableDeclarator[id.name="getPenultimate"] > ArrowFunctionExpression.init *',
    'VariableDeclarator[id.name="getLast"] > ArrowFunctionExpression.init *',
  ].join(", ")})`,
].join("");

const messageId = "consistent-negative-index-access";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/consistent-negative-index-access.js",
    },
    messages: {
      [messageId]: "Prefer `{{method}}(…)` over `…[….length - {{index}}]`.",
    },
    fixable: "code",
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      [selector](node) {
        const { value: index } = node.property.right;

        if (index !== 1 && index !== 2) {
          return;
        }

        const { object } = node;
        const lengthObject = node.property.left.object;

        const objectText = sourceCode.getText(object);
        // Simply use text to compare object
        if (sourceCode.getText(lengthObject) !== objectText) {
          return;
        }

        const method = ["getLast", "getPenultimate"][index - 1];

        context.report({
          node,
          messageId,
          data: {
            index,
            method,
          },
          fix: (fixer) => fixer.replaceText(node, `${method}(${objectText})`),
        });
      },
    };
  },
};

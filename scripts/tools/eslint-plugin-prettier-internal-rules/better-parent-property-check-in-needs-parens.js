"use strict";

const path = require("path");

const parentPropertyCheckSelector = [
  "FunctionDeclaration",
  '[id.name="needsParens"]',
  " ",
  "BinaryExpression",
  ":matches(",
  [
    [
      '[left.type="MemberExpression"]',
      '[left.object.type="Identifier"]',
      '[left.object.name="parent"]',
      '[right.type="Identifier"]',
      '[right.name="node"]',
    ],
    [
      '[right.type="MemberExpression"]',
      '[right.object.type="Identifier"]',
      '[right.object.name="parent"]',
      '[left.type="Identifier"]',
      '[left.name="node"]',
    ],
  ]
    .map((parts) => parts.join(""))
    .join(", "),
  ")",
].join("");

const nameCheckSelector = [
  "LogicalExpression",
  '[right.type="BinaryExpression"]',
  '[right.left.type="Identifier"]',
  '[right.left.name="name"]',
  ":not(",
  '[left.type="BinaryExpression"]',
  '[left.left.type="Identifier"]',
  '[left.left.name="name"]',
  ")",
].join("");

const MESSAGE_ID_PREFER_NAME_CHECK = "prefer-name-check";
const MESSAGE_ID_NAME_CHECK_FIRST = "name-check-on-left";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/better-parent-property-check-in-needs-parens.js",
    },
    messages: {
      [MESSAGE_ID_PREFER_NAME_CHECK]:
        "Prefer `name {{operator}} {{propertyText}}` over `parent.{{property}} {{operator}} node`.",
      [MESSAGE_ID_NAME_CHECK_FIRST]:
        "`name` comparison should be on left side.",
    },
    fixable: "code",
  },
  create(context) {
    if (path.basename(context.getFilename()) !== "needs-parens.js") {
      return {};
    }
    const sourceCode = context.getSourceCode();

    return {
      [parentPropertyCheckSelector](node) {
        const { operator, left, right } = node;
        const { property } = [left, right].find(
          ({ type }) => type === "MemberExpression"
        );
        const propertyText =
          property.type === "Identifier"
            ? `"${property.name}"`
            : sourceCode.getText(property);

        context.report({
          node,
          messageId: MESSAGE_ID_PREFER_NAME_CHECK,
          data: {
            property: sourceCode.getText(property),
            propertyText,
            operator,
          },
          fix: (fixer) =>
            fixer.replaceText(node, `name ${operator} ${propertyText}`),
        });
      },
      [nameCheckSelector](node) {
        context.report({
          node,
          messageId: MESSAGE_ID_NAME_CHECK_FIRST,
        });
      },
    };
  },
};

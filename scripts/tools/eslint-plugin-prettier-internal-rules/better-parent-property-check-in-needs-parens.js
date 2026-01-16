import path from "node:path";

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

const keyCheckSelector = [
  "LogicalExpression",
  '[right.type="BinaryExpression"]',
  '[right.left.type="Identifier"]',
  '[right.left.name="key"]',
  ":not(",
  '[left.type="BinaryExpression"]',
  '[left.left.type="Identifier"]',
  '[left.left.name="key"]',
  ")",
].join("");

const MESSAGE_ID_PREFER_KEY_CHECK = "prefer-key-check";
const MESSAGE_ID_KEY_CHECK_FIRST = "key-check-on-left";

export default {
  meta: {
    type: "suggestion",
    messages: {
      [MESSAGE_ID_PREFER_KEY_CHECK]:
        "Prefer `key {{operator}} {{propertyText}}` over `parent.{{property}} {{operator}} node`.",
      [MESSAGE_ID_KEY_CHECK_FIRST]: "`key` comparison should be on left side.",
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
          ({ type }) => type === "MemberExpression",
        );
        const propertyText =
          property.type === "Identifier"
            ? `"${property.name}"`
            : sourceCode.getText(property);

        context.report({
          node,
          messageId: MESSAGE_ID_PREFER_KEY_CHECK,
          data: {
            property: sourceCode.getText(property),
            propertyText,
            operator,
          },
          fix: (fixer) =>
            fixer.replaceText(node, `key ${operator} ${propertyText}`),
        });
      },
      [keyCheckSelector](node) {
        context.report({
          node,
          messageId: MESSAGE_ID_KEY_CHECK_FIRST,
        });
      },
    };
  },
};

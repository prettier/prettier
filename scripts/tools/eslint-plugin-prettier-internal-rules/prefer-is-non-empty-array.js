"use strict";

const getLengthSelector = (path) =>
  `[${path}.type="MemberExpression"][${path}.property.type="Identifier"][${path}.property.name="length"]`;
const selector = [
  "LogicalExpression",
  '[operator="&&"]',
  `:matches(${[
    // `&& foo.length`
    getLengthSelector("right"),
    // `&& foo.length !== 0`
    // `&& foo.length > 0`
    [
      '[right.type="BinaryExpression"]',
      ':matches([right.operator="!=="], [right.operator=">"])',
      getLengthSelector("right.left"),
      '[right.right.type="Literal"]',
      '[right.right.raw="0"]',
    ].join(""),
  ].join(", ")})`,
].join("");

const isArrayIsArrayCall = (node) =>
  node.type === "CallExpression" &&
  node.callee.type === "MemberExpression" &&
  node.callee.object.type === "Identifier" &&
  node.callee.object.name === "Array" &&
  node.callee.property.type === "Identifier" &&
  node.callee.property.name === "isArray";

const MESSAGE_ID = "prefer-is-non-empty-array";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url:
        "https://github.com/prettier/prettier/blob/master/scripts/eslint-plugin-prettier-internal-rules/prefer-is-non-empty-array.js",
    },
    messages: {
      [MESSAGE_ID]: "Please use `isNonEmptyArray()`.",
    },
    fixable: "code",
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      [selector](node) {
        let { left, right } = node;
        // `Array.isArray(foo)`
        if (isArrayIsArrayCall(left)) {
          left = left.arguments[0];
        }

        if (right.type === "BinaryExpression") {
          right = right.left.object;
        }

        const objectText = sourceCode.getText(right);

        // Simple compare with code
        if (sourceCode.getText(left) === objectText) {
          context.report({
            node,
            messageId: MESSAGE_ID,
            fix(fixer) {
              return fixer.replaceText(node, `isNonEmptyArray(${objectText})`);
            },
          });
        }
      },
    };
  },
};

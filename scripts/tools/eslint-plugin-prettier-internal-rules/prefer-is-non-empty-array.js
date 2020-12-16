"use strict";

const getLengthSelector = (path) =>
  `[${path}.type="MemberExpression"][${path}.property.type="Identifier"][${path}.property.name="length"]`;
const selector = [
  "LogicalExpression",
  ':not(FunctionDeclaration[id.name="isNonEmptyArray"] *)',
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

        while (left.type === "LogicalExpression" && left.operator === "&&") {
          left = left.right;
        }

        let leftObject = left;
        let rightObject = right;
        // `Array.isArray(foo)`
        if (isArrayIsArrayCall(leftObject)) {
          leftObject = leftObject.arguments[0];
        }

        if (rightObject.type === "BinaryExpression") {
          rightObject = rightObject.left.object;
        }

        const objectText = sourceCode.getText(rightObject);
        // Simple compare with code
        if (sourceCode.getText(leftObject) !== objectText) {
          return;
        }

        const [start] = left.range;
        const [, end] = node.range;
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId: MESSAGE_ID,
          fix(fixer) {
            return fixer.replaceTextRange(
              [start, end],
              `isNonEmptyArray(${objectText})`
            );
          },
        });
      },
    };
  },
};

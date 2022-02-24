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

const negativeSelector = [
  "LogicalExpression",
  '[operator="||"]',
  `:matches(${[
    // `|| !foo.length`
    [
      '[right.type="UnaryExpression"]',
      '[right.operator="!"]',
      getLengthSelector("right.argument"),
    ].join(""),
    // `|| foo.length === 0`
    [
      '[right.type="BinaryExpression"]',
      '[right.operator="==="]',
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
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/prefer-is-non-empty-array.js",
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
        // `Array.isArray(foo)`
        if (isArrayIsArrayCall(leftObject)) {
          leftObject = leftObject.arguments[0];
        }

        const rightObject =
          right.type === "BinaryExpression" ? right.left.object : right.object;
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
      [negativeSelector](node) {
        let { left, right } = node;

        while (left.type === "LogicalExpression" && left.operator === "||") {
          left = left.right;
        }

        if (left.type !== "UnaryExpression" || left.operator !== "!") {
          return;
        }

        const rightObject =
          right.type === "UnaryExpression"
            ? right.argument.object
            : right.left.object;
        let leftObject = left.argument;
        if (isArrayIsArrayCall(leftObject)) {
          leftObject = leftObject.arguments[0];
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
              `!isNonEmptyArray(${objectText})`
            );
          },
        });
      },
    };
  },
};

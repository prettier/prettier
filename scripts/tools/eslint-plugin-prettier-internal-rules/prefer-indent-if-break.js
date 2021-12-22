"use strict";

const selector = [
  "CallExpression",
  "[optional=false]",
  '[callee.type="Identifier"]',
  '[callee.name="ifBreak"]',
  "[arguments.length=3]",
  '[arguments.0.type="CallExpression"]',
  "[arguments.0.optional=false]",
  '[arguments.0.callee.type="Identifier"]',
  '[arguments.0.callee.name="indent"]',
  "[arguments.0.arguments.length=1]",
  '[arguments.0.arguments.0.type!="SpreadElement"]',
  '[arguments.1.type!="SpreadElement"]',
  '[arguments.2.type!="SpreadElement"]',
].join("");

const messageId = "prefer-indent-if-break";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/prefer-indent-if-break.js",
    },
    messages: {
      [messageId]: "Prefer `indentIfBreak(…)` over `ifBreak(indent(…), …)`.",
    },
    fixable: "code",
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      [selector](node) {
        const indentDoc = node.arguments[0].arguments[0];
        const doc = node.arguments[1];

        // Use text to compare same `doc`
        if (sourceCode.getText(indentDoc) !== sourceCode.getText(doc)) {
          return;
        }

        context.report({
          node,
          messageId,
          *fix(fixer) {
            yield fixer.replaceText(node.callee, "indentIfBreak");
            const openingParenthesisToken = sourceCode.getTokenAfter(
              node.callee
            );
            const commaToken = sourceCode.getTokenBefore(
              doc,
              ({ type, value }) => type === "Punctuator" && value === ","
            );
            yield fixer.replaceTextRange(
              [openingParenthesisToken.range[1], commaToken.range[1]],
              ""
            );
          },
        });
      },
    };
  },
};

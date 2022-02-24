"use strict";

const selector = [
  "CallExpression",
  "[optional=false]",
  '[callee.type="MemberExpression"]',
  "[callee.computed=false]",
  "[callee.optional=false]",
  '[callee.property.type="Identifier"]',
  '[callee.property.name="call"]',
  "[arguments.length=1]",
  '[arguments.0.type!="SpreadElement"]',
].join("");

const messageId = "no-unnecessary-ast-path-call";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/no-unnecessary-ast-path-call.js",
    },
    messages: {
      [messageId]: "Do not use `AstPath.call()` with one argument.",
    },
    fixable: "code",
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      [selector](node) {
        const problem = {
          node,
          messageId,
        };

        const [callback] = node.arguments;

        // Don't fix to IIFE
        if (
          callback.type !== "ArrowFunctionExpression" &&
          callback.type !== "FunctionExpression"
        ) {
          problem.fix = function (fixer) {
            const callbackText = sourceCode.getText(callback);
            const astPathText = sourceCode.getText(node.callee.object);
            return fixer.replaceText(node, `${callbackText}(${astPathText})`);
          };
        }

        context.report(problem);
      },
    };
  },
};

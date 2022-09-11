"use strict";

const selector = [
  "CallExpression[arguments.length=0]",
  "> MemberExpression",
].join("");

const messageId = "prefer-ast-path-node";

const getNodeFunctionNames = new Set(["getValue", "getNode"]);

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/prefer-ast-path-node.js",
    },
    fixable: "code",
    messages: {
      [messageId]:
        "Prefer `path.node` instead of `path.getValue()` and `path.getNode()`",
    },
  },
  create(context) {
    return {
      [selector](node) {
        if (!node.object?.name?.toLowerCase().endsWith("path")) {
          return;
        }
        if (!getNodeFunctionNames.has(node.property?.name)) {
          return;
        }
        context.report({
          node,
          messageId,
          fix: (fixer) => [
            fixer.replaceTextRange(
              [
                node.property.range[0],
                // remove `()` for CallExpression
                node.property.range[1] + 2,
              ],
              "node"
            ),
          ],
        });
      },
    };
  },
};

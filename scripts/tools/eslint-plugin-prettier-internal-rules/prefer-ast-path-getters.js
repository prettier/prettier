"use strict";

const selector = [
  "CallExpression[arguments.length<2]",
  "> MemberExpression",
].join("");

const messageId = "prefer-ast-path-getters";

const getNodeFunctionNames = new Set(["getValue", "getNode"]);
const getParentNodeFunctionName = "getParentNode";

function isPathMemberExpression(node) {
  return node.object?.name?.toLowerCase().endsWith("path");
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/prefer-ast-path-getters.js",
    },
    fixable: "code",
    messages: {
      [messageId]:
        "Prefer `AstPath#{{ getter }}` over `AstPath#{{ method }}({{ arg }})`.",
    },
  },
  create(context) {
    const report = (node, callExprArgumentValues, getterName) => {
      context.report({
        node,
        messageId,
        data: {
          getter: getterName,
          method: node.property.name,
          arg: callExprArgumentValues,
        },
        fix: (fixer) => [
          fixer.replaceTextRange(
            [
              node.property.range[0],
              // remove `()` for CallExpression
              node.property.range[1] + 2 + callExprArgumentValues.length,
            ],
            getterName
          ),
        ],
      });
    };
    return {
      [selector](node) {
        if (!isPathMemberExpression(node)) {
          return;
        }

        const propertyName = node.property.name;
        const callExprArgumentValues = node.parent.arguments.map(
          ({ value }) => value
        );

        if (
          getNodeFunctionNames.has(propertyName) &&
          callExprArgumentValues.length === 0
        ) {
          // path.getNode() or path.getValue()
          report(node, callExprArgumentValues, "node");
        }

        if (propertyName === getParentNodeFunctionName) {
          if (
            // path.getParentNode()
            callExprArgumentValues.length === 0 ||
            // path.getParentNode(0)
            callExprArgumentValues[0] === 0
          ) {
            // path.getParentNode()
            report(node, callExprArgumentValues, "parent");
          } else if (callExprArgumentValues[0] === 1) {
            // path.getParentNode(1)
            report(node, callExprArgumentValues, "grandparent");
          }
        }
      },
    };
  },
};

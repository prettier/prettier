"use strict";

const selector = [
  "CallExpression[arguments.length<2]",
  "> MemberExpression",
].join("");

const messageId = "prefer-ast-path-node";

const getNodeFunctionNames = new Set(["getValue", "getNode"]);
const getParentNodeFunctionName = "getParentNode";

function isPathMemberExpression(node) {
  return node.object?.name?.toLowerCase().endsWith("path");
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/prefer-ast-path-node.js",
    },
    fixable: "code",
    messages: {
      [messageId]: "Prefer {{ getter }} instead of {{ method }} for path.",
    },
  },
  create(context) {
    const report = (node, argumentsLength, getterName) => {
      const data =
        getterName === "node"
          ? {
              getter: "`path.node`",
              method: "`path.getValue()` or `path.getNode()`",
            }
          : getterName === "parent"
          ? {
              getter: "`path.parent`",
              method: "`path.getParent()`",
            }
          : getterName === "grandparent"
          ? {
              getter: "`path.grandparent`",
              method: "`path.getParent(1)`",
            }
          : null;
      context.report({
        node,
        messageId,
        data,
        fix: (fixer) => [
          fixer.replaceTextRange(
            [
              node.property.range[0],
              // remove `()` for CallExpression
              node.property.range[1] + 2 + argumentsLength,
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

        const propertyName = node.property?.name;
        const callExprArguments = node.parent.arguments;

        if (
          getNodeFunctionNames.has(propertyName) &&
          callExprArguments.length === 0
        ) {
          // path.getNode() or path.getValue()
          report(node, callExprArguments.length, "node");
        }

        if (propertyName === getParentNodeFunctionName) {
          if (callExprArguments.length === 0) {
            // path.getParentNode()
            report(node, callExprArguments.length, "parent");
          } else if (callExprArguments[0].value === 0) {
            // path.getParentNode(0)
            report(node, callExprArguments.length, "parent");
          } else if (callExprArguments[0].value === 1) {
            // path.getParentNode(1)
            report(node, callExprArguments.length, "grandparent");
          }
        }
      },
    };
  },
};

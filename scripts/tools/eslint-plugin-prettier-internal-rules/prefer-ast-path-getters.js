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
    return {
      [selector](node) {
        if (!isPathMemberExpression(node)) {
          return;
        }

        const propertyName = node.property.name;
        const callExprArgumentValues = node.parent.arguments.map(
          ({ value }) => value
        );

        const report = (getterName) => {
          context.report({
            node,
            messageId,
            data: {
              getter: getterName,
              method: propertyName,
              arg: callExprArgumentValues,
            },
            fix: (fixer) => [
              fixer.replaceTextRange(
                [node.property.range[0], node.parent.range[1]],
                getterName
              ),
            ],
          });
        };

        if (
          getNodeFunctionNames.has(propertyName) &&
          callExprArgumentValues.length === 0
        ) {
          // path.getNode() or path.getValue()
          report("node");
        }

        if (propertyName === getParentNodeFunctionName) {
          if (
            // path.getParentNode()
            callExprArgumentValues.length === 0 ||
            // path.getParentNode(0)
            callExprArgumentValues[0] === 0
          ) {
            // path.getParentNode()
            report("parent");
          } else if (callExprArgumentValues[0] === 1) {
            // path.getParentNode(1)
            report("grandparent");
          }
        }
      },
    };
  },
};

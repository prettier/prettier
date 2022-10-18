"use strict";

const selector = [
  "CallExpression",
  "[optional=false]",
  "[arguments.length<2]",
  '[callee.type="MemberExpression"]',
  "[callee.computed=false]",
  "[callee.optional=false]",
  '[callee.property.type="Identifier"]',
  '[callee.type="MemberExpression"]',
  '[callee.object.type="Identifier"]',
  "[callee.object.name=/[pP]ath$/]",
].join("");

const messageId = "prefer-ast-path-getters";

function getReplacement(callExpression) {
  const method = callExpression.callee.property.name;
  const description = `${method}()`;
  switch (method) {
    case "getValue":
    case "getNode":
      if (callExpression.arguments.length === 0) {
        return { getter: "node", description };
      }
      break;

    case "getParentNode": {
      // `path.getParentNode()`
      if (callExpression.arguments.length === 0) {
        return { getter: "parent", description };
      }

      // `path.getParentNode(count)`
      const [countNode] = callExpression.arguments;
      if (countNode.type !== "Literal") {
        return;
      }

      const count = countNode.value;
      if (count === 0) {
        return { getter: "parent", description: `${method}(0)` };
      }

      if (count === 1) {
        return { getter: "grandparent", description: `${method}(1)` };
      }
      break;
    }
  }
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
        "Prefer `AstPath#{{ getter }}` over `AstPath#{{ description }}`.",
    },
  },
  create(context) {
    return {
      [selector](callExpression) {
        const replacement = getReplacement(callExpression);
        if (!replacement) {
          return;
        }

        context.report({
          node: callExpression.callee,
          messageId,
          data: {
            getter: replacement.getter,
            description: replacement.description,
          },
          fix: (fixer) =>
            fixer.replaceTextRange(
              [
                callExpression.callee.property.range[0],
                callExpression.range[1],
              ],
              replacement.getter
            ),
        });
      },
    };
  },
};

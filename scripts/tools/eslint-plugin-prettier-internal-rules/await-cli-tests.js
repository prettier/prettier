const selector = [
  "CallExpression",
  '[callee.type="Identifier"]',
  '[callee.name="runCli"]',
].join("");

const MESSAGE_ID_CALL = "await-cli-tests/call";
const MESSAGE_ID_GETTER = "await-cli-tests/getter";

export default {
  meta: {
    type: "suggestion",
    messages: {
      [MESSAGE_ID_CALL]: "'runCli()' should be awaited or calling `.test()`.",
      [MESSAGE_ID_GETTER]: "'runCli().{{property}}' should be awaited.",
    },
  },
  create(context) {
    return {
      [selector](callExpression) {
        const { parent } = callExpression;
        if (
          parent.type === "AwaitExpression" &&
          parent.argument === callExpression
        ) {
          return;
        }

        // wrapped
        // `const runCliWithoutGitignore = () => runCli()`
        // `const runCliWithoutGitignore = () => { return runCli() }`
        if (
          (parent.type === "ArrowFunctionExpression" &&
            parent.body === callExpression) ||
          (parent.type === "ReturnStatement" &&
            parent.argument === callExpression)
        ) {
          return;
        }

        if (
          parent.type === "MemberExpression" &&
          parent.object === callExpression &&
          parent.property.type === "Identifier" &&
          parent.property.name === "test" &&
          parent.parent.type === "CallExpression" &&
          parent.parent.callee === parent
        ) {
          return;
        }

        if (
          parent.type === "MemberExpression" &&
          parent.object === callExpression &&
          parent.property.type === "Identifier" &&
          ["status", "write", "stdout", "stderr"].includes(parent.property.name)
        ) {
          const memberExpression = callExpression.parent;
          if (
            memberExpression.parent.type === "AwaitExpression" &&
            memberExpression.parent.argument === memberExpression
          ) {
            return;
          }

          context.report({
            node: memberExpression.property,
            messageId: MESSAGE_ID_GETTER,
            data: { property: memberExpression.property.name },
          });
          return;
        }

        context.report({ node: callExpression, messageId: MESSAGE_ID_CALL });
      },
    };
  },
};

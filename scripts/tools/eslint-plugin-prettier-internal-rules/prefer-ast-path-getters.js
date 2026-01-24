const selector = [
  "CallExpression",
  "[optional=false]",
  "[arguments.length<2]",
  '[callee.type="MemberExpression"]',
  "[callee.computed=false]",
  "[callee.optional=false]",
  '[callee.object.type="Identifier"]',
  "[callee.object.name=/[pP]ath$/]",
  '[callee.property.type="Identifier"]',
].join("");

const messageId = "prefer-ast-path-getters";
const messageIdSuggestion = "prefer-ast-path-getters/suggestion";

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
    case "getName":
      return { getters: ["key", "index"], description };

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

export default {
  meta: {
    type: "suggestion",
    fixable: "code",
    hasSuggestions: true,
    messages: {
      [messageId]: "Prefer {{replacement}} over `AstPath#{{ description }}`.",
      [messageIdSuggestion]: "Use `AstPath#{{getter}}`.",
    },
  },
  create(context) {
    return {
      [selector](callExpression) {
        const replacement = getReplacement(callExpression);
        if (!replacement) {
          return;
        }

        const getters = replacement.getters ?? [replacement.getter];
        const problem = {
          node: callExpression.callee,
          messageId,
          data: {
            replacement: new Intl.ListFormat("en-US", {
              type: "disjunction",
            }).format(getters.map((getter) => `\`AstPath#${getter}\``)),
            description: replacement.description,
          },
        };

        const useGetter = (getter) => (fixer) =>
          fixer.replaceTextRange(
            [callExpression.callee.property.range[0], callExpression.range[1]],
            getter,
          );

        if (replacement.getter) {
          problem.fix = useGetter(replacement.getter);
        } else {
          problem.suggest = getters.map((getter) => ({
            messageId: messageIdSuggestion,
            data: { getter },
            fix: useGetter(getter),
          }));
        }

        context.report(problem);
      },
    };
  },
};

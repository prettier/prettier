import { findVariable } from "@eslint-community/eslint-utils";

const ERROR = "error";
const SUGGESTION = "suggestion";
const selector = [
  "Identifier",
  '[name="n"]',
  `:not(${[
    "MemberExpression[computed=false] > .property",
    "Property[shorthand=false][computed=false] > .key",
  ].join(", ")})`,
].join("");

export default {
  meta: {
    type: "suggestion",
    messages: {
      [ERROR]: "Please rename variable 'n'.",
      [SUGGESTION]: "Rename to `node`.",
    },
    fixable: "code",
    hasSuggestions: true,
  },
  create(context) {
    const variables = new Map();
    return {
      [selector](node) {
        const scope = context.sourceCode.getScope(node);
        const variable = findVariable(scope, node);

        /* istanbul ignore next */
        if (!variable) {
          return;
        }

        if (!variables.has(variable)) {
          variables.set(variable, { fixable: true });
        }

        const data = variables.get(variable);
        if (!data.fixable) {
          return;
        }

        const nodeVariable = findVariable(scope, "node");
        if (nodeVariable) {
          data.fixable = false;
        }
      },
      "Program:exit"() {
        for (const [variable, { fixable }] of variables.entries()) {
          const [node] = variable.identifiers;

          const fix = function* (fixer) {
            const identifiers = new Set([
              ...variable.identifiers,
              ...variable.references.map((reference) => reference.identifier),
            ]);

            for (const identifier of identifiers) {
              const { parent } = identifier;
              if (parent && parent.type === "Property" && parent.shorthand) {
                yield fixer.replaceText(identifier, "n: node");
              } else {
                yield fixer.replaceText(identifier, "node");
              }
            }
          };

          const problem = { node, messageId: ERROR };
          if (fixable) {
            problem.fix = fix;
          } else {
            problem.suggest = [{ messageId: SUGGESTION, fix }];
          }
          context.report(problem);
        }
      },
    };
  },
};

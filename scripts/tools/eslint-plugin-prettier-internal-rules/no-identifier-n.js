"use strict";

// eslint-disable-next-line import/no-extraneous-dependencies
const { findVariable } = require("eslint-utils");
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

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/no-identifier-n.js",
    },
    messages: {
      [ERROR]: "Please rename variable 'n'.",
      [SUGGESTION]: "Rename to `node`.",
    },
    fixable: "code",
  },
  create(context) {
    const variables = new Map();
    return {
      [selector](node) {
        const scope = context.getScope();
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
              if (
                parent &&
                parent.type === "Property" &&
                parent.shorthand &&
                parent.key === identifier
              ) {
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

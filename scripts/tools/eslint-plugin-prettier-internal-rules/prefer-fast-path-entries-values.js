"use strict";

// eslint-disable-next-line import/no-extraneous-dependencies
const { outdent } = require("outdent");

const selector = [
  "CallExpression",
  "[optional=false]",
  "[arguments.length>1]",
  '[callee.type="MemberExpression"]',
  "[callee.computed=false]",
  "[callee.optional=false]",
  '[callee.property.type="Identifier"]',
  '[callee.property.name="each"]',
].join("");

const preferEntriesValues = "prefer-entries-or-values";
const preferEntries = "prefer-entries";
const preferValues = "prefer-values";
const suggestionMessageId = "suggestion";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url:
        "https://github.com/prettier/prettier/blob/master/scripts/eslint-plugin-prettier-internal-rules/prefer-fast-path-entries-values.js",
    },
    messages: {
      [preferEntriesValues]:
        "Prefer `FastPath#entries()` or `FastPath#values()`  over `FastPath#each()`.",
      [preferEntries]: "Prefer `FastPath#entries()` over `FastPath#each()`.",
      [preferValues]: "Prefer `FastPath#values()` over `FastPath#each()`.",
      [suggestionMessageId]:
        "Replace `FastPath#each()` with `FastPath#{{method}}()`.",
    },
    fixable: "code",
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      [selector](node) {
        const [iterator] = node.arguments;

        const problem = {
          node,
          messageId: preferEntriesValues,
        };

        const path = sourceCode.getText(node.callee.object);
        const lastName = node.arguments[node.arguments.length - 1];
        const names = sourceCode.text.slice(
          node.arguments[1].range[0],
          lastName.range[1]
        );
        if (
          iterator.type === "FunctionExpression" ||
          iterator.type === "ArrowFunctionExpression"
        ) {
          const [childPath, index] = iterator.params;
          if (index) {
            problem.messageId = preferEntries;
            problem.fix = function (fixer) {
              const childPathText = sourceCode.getText(childPath);
              const indexText = sourceCode.getText(index);
              const iteratorBodyText = sourceCode.getText(iterator.body);
              return fixer.replaceText(
                node,
                outdent`
                  for (const [${indexText}, ${childPathText}] of ${path}.entries(${names})) ${iteratorBodyText}
                `
              );
            };
          } else {
            problem.messageId = preferValues;
            problem.fix = function (fixer) {
              const childPathText = sourceCode.getText(childPath);
              const iteratorBodyText = sourceCode.getText(iterator.body);
              return fixer.replaceText(
                node,
                outdent`
                  for (const ${childPathText} of ${path}.values(${names})) ${iteratorBodyText}
                `
              );
            };
          }
        } else {
          problem.suggest = [
            {
              messageId: suggestionMessageId,
              data: { method: "entries" },
              fix(fixer) {
                const iteratorText = sourceCode.getText(iterator);
                return fixer.replaceText(
                  node,
                  outdent`
                    for (const [index, childPath] of ${path}.entries(${names})) {
                      ${iteratorText}(childPath, index);
                    }
                  `
                );
              },
            },
            {
              messageId: suggestionMessageId,
              data: { method: "values" },
              fix(fixer) {
                const iteratorText = sourceCode.getText(iterator);
                fixer.replaceText(
                  node,
                  outdent`
                    for (const childPath of ${path}.values(${names})) {
                      ${iteratorText}(childPath);
                    }
                  `
                );
              },
            },
          ];
        }

        context.report(problem);
      },
    };
  },
};

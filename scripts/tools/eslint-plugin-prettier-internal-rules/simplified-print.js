"use strict";

// TODO: check `astPath.map`

const selector = [
  "CallExpression",
  "[optional=false]",
  '[callee.type="MemberExpression"]',
  "[callee.optional=false]",
  '[callee.property.type="Identifier"]',
  '[callee.property.name="call"]',
  "[arguments.length>0]",
].join("");

const messageId = "simplified-print";

function getNamesText(node, sourceCode) {
  const [, firstName, ...restNames] = node.arguments;
  if (!firstName) {
    return "";
  }

  if (restNames.length === 0) {
    return sourceCode.getText(
      firstName.type === "SpreadElement" ? firstName.argument : firstName
    );
  }

  const start = firstName.range[0];
  const end = (restNames.length === 0
    ? firstName
    : restNames[restNames.length - 1]
  ).range[1];
  return `[${sourceCode.text.slice(start, end)}]`;
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url:
        "https://github.com/prettier/prettier/blob/main/scripts/eslint-plugin-prettier-internal-rules/simplified-print.js",
    },
    messages: {
      [messageId]: "Do not use `AstPath#call` to print.",
    },
    fixable: "code",
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      [selector](node) {
        const problem = {
          node,
          messageId,
        };

        // Only fix cases that first argument is `print`
        const [firstArgument] = node.arguments;
        if (
          firstArgument.type === "Identifier" &&
          firstArgument.name === "print"
        ) {
          problem.fix = (fixer) =>
            fixer.replaceText(node, `print(${getNamesText(node, sourceCode)})`);
        }

        context.report(problem);
      },
    };
  },
};

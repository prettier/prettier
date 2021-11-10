"use strict";
const path = require("path");

// `node.comments`
const memberExpressionSelector = [
  "MemberExpression[computed=false]",
  "",
  ">",
  "Identifier.property",
  '[name="comments"]',
].join("");

// `const {comments} = node`
// `const {comments: nodeComments} = node`
const objectPatternSelector = [
  "ObjectPattern",
  ">",
  "Property.properties",
  ">",
  "Identifier.key",
  '[name="comments"]',
].join("");

const selector = `:matches(${memberExpressionSelector}, ${objectPatternSelector})`;

const messageId = "no-node-comments";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/no-node-comments.js",
    },
    messages: {
      [messageId]: "Do not access node.comments.",
    },
  },
  create(context) {
    const fileName = context.getFilename();
    const ignored = new Map(
      context.options.map((option) => {
        if (typeof option === "string") {
          option = { file: option };
        }
        const { file, functions } = option;
        return [
          path.join(__dirname, "../../..", file),
          functions ? new Set(functions) : true,
        ];
      })
    );
    // avoid report on `const {comments} = node` twice
    const reported = new Set();
    return {
      [selector](node) {
        if (reported.has(node)) {
          return;
        }

        if (ignored.has(fileName)) {
          const functionNames = ignored.get(fileName);
          if (functionNames === true) {
            return;
          }
          let isIgnored;
          let currentNode = node.parent;
          while (currentNode) {
            if (
              currentNode.type === "FunctionDeclaration" &&
              currentNode.id &&
              currentNode.id.type === "Identifier" &&
              functionNames.has(currentNode.id.name)
            ) {
              isIgnored = true;
              break;
            }
            currentNode = currentNode.parent;
          }
          if (isIgnored) {
            return;
          }
        }
        reported.add(node);
        context.report({
          node,
          messageId,
        });
      },
    };
  },
};

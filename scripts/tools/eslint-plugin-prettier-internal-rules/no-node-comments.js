"use strict";

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
const ObjectPatternSelector = [
  "ObjectPattern",
  ">",
  "Property.properties",
  ">",
  "Identifier.key",
  '[name="comments"]',
].join("");

const selector = `:matches(${memberExpressionSelector}, ${ObjectPatternSelector})`;

const messageId = "no-node-comments";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url:
        "https://github.com/prettier/prettier/blob/master/scripts/eslint-plugin-prettier-internal-rules/no-node-comments.js",
    },
    messages: {
      [messageId]: "Do not access node.comments.",
    },
  },
  create(context) {
    return {
      [selector](node) {
        context.report({
          node,
          messageId,
        });
      },
    };
  },
};

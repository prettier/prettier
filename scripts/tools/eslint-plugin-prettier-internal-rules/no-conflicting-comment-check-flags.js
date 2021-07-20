"use strict";
const MESSAGE_ID_UNIQUE = "unique";
const MESSAGE_ID_CONFLICTING = "conflicting";

const conflictingFlags = [
  ["Leading", "Trailing", "Dangling"],
  ["Block", "Line"],
];

const isCommentCheckFlags = (node) =>
  node.type === "MemberExpression" &&
  !node.computed &&
  !node.optional &&
  node.object.type === "Identifier" &&
  node.object.name === "CommentCheckFlags" &&
  node.property.type === "Identifier";

const flatFlags = (node) => {
  const flags = [];
  const binaryExpressions = [node];
  while (binaryExpressions.length > 0) {
    const { left, right } = binaryExpressions.shift();
    for (const node of [left, right]) {
      if (node.type === "BinaryExpression" && node.operator === "|") {
        binaryExpressions.push(node);
        continue;
      }

      if (!isCommentCheckFlags(node)) {
        return [];
      }

      flags.push(node);
    }
  }

  return flags.map((node) => node.property.name);
};

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/no-conflicting-comment-check-flags.js",
    },
    messages: {
      [MESSAGE_ID_UNIQUE]: "Do not use same flag multiple times.",
      [MESSAGE_ID_CONFLICTING]: "Do not use {{flags}} together.",
    },
  },
  create(context) {
    return {
      ':not(BinaryExpression) > BinaryExpression[operator="|"]'(node) {
        const flags = flatFlags(node);

        if (flags.length < 2) {
          return;
        }

        const uniqueFlags = new Set(flags);
        if (uniqueFlags.size !== flags.length) {
          context.report({
            node,
            messageId: MESSAGE_ID_UNIQUE,
          });
          return;
        }

        for (const group of conflictingFlags) {
          const presentFlags = group.filter((flag) => uniqueFlags.has(flag));
          if (presentFlags.length > 1) {
            context.report({
              node,
              messageId: MESSAGE_ID_CONFLICTING,
              data: {
                flags: presentFlags
                  .map((flag) => `'CommentCheckFlags.${flag}'`)
                  .join(", "),
              },
            });
          }
        }
      },
    };
  },
};

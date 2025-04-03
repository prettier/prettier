import { createTypeCheckFunction } from "../utils/index.js";

const isEstreeChainElement = createTypeCheckFunction([
  "MemberExpression",
  "CallExpression",
]);

const isBabelChainElement = createTypeCheckFunction([
  "OptionalMemberExpression",
  "OptionalCallExpression",
]);

function shouldAddParenthesesToChainElement(path) {
  const { node, ancestors } = path;

  let level = 0;
  let ancestor;

  for (; level < ancestors.length; level++) {
    ancestor = ancestors[level];
    if (ancestor.type !== "TSNonNullExpression") {
      break;
    }
  }

  if (isEstreeChainElement(node)) {
    if (ancestor?.type !== "ChainExpression") {
      return false;
    }

    level += 1;
  }

  if (isBabelChainElement(node) && isBabelChainElement(ancestor)) {
    return false;
  }

  for (; level < ancestors.length; level++) {
    ancestor = ancestors[level];
    if (ancestor.type !== "TSNonNullExpression") {
      break;
    }
  }
  const child = ancestors[level - 1] ?? node;

  return (
    (ancestor.type === "MemberExpression" && ancestor.object === child) ||
    (ancestor.type === "CallExpression" && ancestor.callee === child) ||
    (ancestor.type === "NewExpression" && ancestor.callee === child) ||
    (ancestor.type === "TaggedTemplateExpression" && ancestor.tag === child)
  );
}

export { shouldAddParenthesesToChainElement };

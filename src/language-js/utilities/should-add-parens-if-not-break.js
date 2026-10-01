import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { startsWithNoLookaheadToken } from "./starts-with-no-lookahead-token.js";

const shouldAddParensIfNotBreakCache = new WeakMap();

/**
 * An arrow function body that is printed with parentheses when it does not
 * break, in order to avoid confusion between
 *
 *     a => a ? a : a
 *     a <= a ? a : a
 */
function shouldAddParensIfNotBreak(node) {
  return getOrInsertComputed(
    shouldAddParensIfNotBreakCache,
    node,
    (node) =>
      node.type === "ConditionalExpression" &&
      !startsWithNoLookaheadToken(
        node,
        (node) => node.type === "ObjectExpression",
      ),
  );
}

export { shouldAddParensIfNotBreak };

import { CommentCheckFlags, hasComment } from "./comments.js";
import { getLeftSide, hasNakedLeftSide } from "./left-side.js";
import { isCallExpression } from "./node-types.js";

/**
@import { Node } from "../types/estree.js";
*/

/**
 * `UnaryExpression` prints its argument in parentheses when the argument has
 * comments, e.g. `!(/* comment *\/ foo)`.
 *
 * A leading comment of a node on the left side of the argument is printed in
 * the same position (`!(/* comment *\/ foo).bar` -> `!/* comment *\/ foo.bar`),
 * and gets attached to the argument itself when the output is formatted again,
 * so it has to be treated the same way to keep the output stable.
 *
 * @param {Node} node - the `argument` of a `UnaryExpression`
 * @returns {boolean}
 */
function unaryExpressionArgumentHasComment(node) {
  if (hasComment(node)) {
    return true;
  }

  while (hasNakedLeftSide(node)) {
    const leftSide = getLeftSide(node);

    // Comments of IIFE callee and tagged template tag are printed inside the parentheses
    if (
      (isCallExpression(node) || node.type === "TaggedTemplateExpression") &&
      (leftSide.type === "FunctionExpression" ||
        leftSide.type === "ArrowFunctionExpression")
    ) {
      return false;
    }

    if (hasComment(leftSide, CommentCheckFlags.Leading)) {
      return true;
    }

    node = leftSide;
  }

  return false;
}

export { unaryExpressionArgumentHasComment };

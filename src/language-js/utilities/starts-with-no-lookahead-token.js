/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * Tests if the leftmost node of the expression matches the predicate. E.g.,
 * used to check whether an expression statement needs to be wrapped in extra
 * parentheses because it starts with:
 *
 * - `{`
 * - `function`, `class`, or `do {}`
 * - `let[`
 *
 * Will be overzealous if there already are necessary grouping parentheses.
 *
 * @param {Node} node
 * @param {(leftmostNode: Node) => boolean} predicate
 * @returns {boolean}
 */
function startsWithNoLookaheadToken(node, predicate) {
  switch (node.type) {
    case "BinaryExpression":
    case "LogicalExpression":
    case "AssignmentExpression":
    case "NGPipeExpression":
      return startsWithNoLookaheadToken(node.left, predicate);
    case "MemberExpression":
    case "OptionalMemberExpression":
      return startsWithNoLookaheadToken(node.object, predicate);
    case "TaggedTemplateExpression":
      if (node.tag.type === "FunctionExpression") {
        // IIFEs are always already parenthesized
        return false;
      }
      return startsWithNoLookaheadToken(node.tag, predicate);
    case "CallExpression":
    case "OptionalCallExpression":
      if (node.callee.type === "FunctionExpression") {
        // IIFEs are always already parenthesized
        return false;
      }
      return startsWithNoLookaheadToken(node.callee, predicate);
    case "ConditionalExpression":
      return startsWithNoLookaheadToken(node.test, predicate);
    case "UpdateExpression":
      return (
        !node.prefix && startsWithNoLookaheadToken(node.argument, predicate)
      );
    case "BindExpression":
      return node.object && startsWithNoLookaheadToken(node.object, predicate);
    case "SequenceExpression":
      return startsWithNoLookaheadToken(node.expressions[0], predicate);
    case "ChainExpression":
    case "TSNonNullExpression":
    case "TSSatisfiesExpression":
    case "TSAsExpression":
    case "AsExpression":
    case "AsConstExpression":
    case "SatisfiesExpression":
      return startsWithNoLookaheadToken(node.expression, predicate);
    default:
      return predicate(node);
  }
}

export { startsWithNoLookaheadToken };

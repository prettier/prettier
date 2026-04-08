import { isCallExpression } from "./node-types.js";

/**
@import {
  Node,
  NodeMap,
  Comment,
  NumericLiteral,
  StringLiteral,
  RegExpLiteral,
  BigIntLiteral,
} from "../types/estree.js";
@import AstPath from "../../common/ast-path.js";
*/

// Logic to determine if a call is a “long curried function call”.
// See https://github.com/prettier/prettier/issues/1420.
//
// `connect(a, b, c)(d)`
// In the above call expression, the second call is the parent node and the
// first call is the current node.
/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function isLongCurriedCallExpression(path) {
  const { node, parent, key } = path;
  return (
    key === "callee" &&
    isCallExpression(node) &&
    isCallExpression(parent) &&
    parent.arguments.length > 0 &&
    node.arguments.length > parent.arguments.length
  );
}

export { isLongCurriedCallExpression };

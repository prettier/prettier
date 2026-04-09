import { isNumericLiteral } from "./node-types.js";

/**
@import {
  Node,
  NodeMap,
  NumericLiteral,
} from "../types/estree.js";
*/

/**
@param {Node} node
@returns {node is NodeMap["UnaryExpression"] & {operator: "+" | "-", argument: NumericLiteral}}
*/
function isSignedNumericLiteral(node) {
  return (
    node.type === "UnaryExpression" &&
    (node.operator === "+" || node.operator === "-") &&
    isNumericLiteral(node.argument)
  );
}

export { isSignedNumericLiteral };

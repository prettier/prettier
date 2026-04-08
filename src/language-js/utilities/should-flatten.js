import { getPrecedence } from "./get-precedence.js";

const equalityOperators = {
  "==": true,
  "!=": true,
  "===": true,
  "!==": true,
};
const multiplicativeOperators = {
  "*": true,
  "/": true,
  "%": true,
};
const bitshiftOperators = {
  ">>": true,
  ">>>": true,
  "<<": true,
};

function shouldFlatten(parentOp, nodeOp) {
  if (getPrecedence(nodeOp) !== getPrecedence(parentOp)) {
    return false;
  }

  // ** is right-associative
  // x ** y ** z --> x ** (y ** z)
  if (parentOp === "**") {
    return false;
  }

  // x == y == z --> (x == y) == z
  if (equalityOperators[parentOp] && equalityOperators[nodeOp]) {
    return false;
  }

  // x * y % z --> (x * y) % z
  if (
    (nodeOp === "%" && multiplicativeOperators[parentOp]) ||
    (parentOp === "%" && multiplicativeOperators[nodeOp])
  ) {
    return false;
  }

  // x * y / z --> (x * y) / z
  // x / y * z --> (x / y) * z
  if (
    nodeOp !== parentOp &&
    multiplicativeOperators[nodeOp] &&
    multiplicativeOperators[parentOp]
  ) {
    return false;
  }

  // x << y << z --> (x << y) << z
  if (bitshiftOperators[parentOp] && bitshiftOperators[nodeOp]) {
    return false;
  }

  return true;
}

export { bitshiftOperators, shouldFlatten };

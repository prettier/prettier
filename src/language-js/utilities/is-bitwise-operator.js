import { bitshiftOperators } from "./should-flatten.js";

function isBitwiseOperator(operator) {
  return (
    Boolean(bitshiftOperators[operator]) ||
    operator === "|" ||
    operator === "^" ||
    operator === "&"
  );
}

export { isBitwiseOperator };

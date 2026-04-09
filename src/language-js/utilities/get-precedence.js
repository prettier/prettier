const PRECEDENCE = new Map(
  [
    ["|>"],
    ["??"],
    ["||"],
    ["&&"],
    ["|"],
    ["^"],
    ["&"],
    ["==", "===", "!=", "!=="],
    ["<", ">", "<=", ">=", "in", "instanceof"],
    [">>", "<<", ">>>"],
    ["+", "-"],
    ["*", "/", "%"],
    ["**"],
  ].flatMap((operators, index) =>
    operators.map((operator) => [operator, index]),
  ),
);
function getPrecedence(operator) {
  return PRECEDENCE.get(operator);
}

export { getPrecedence };

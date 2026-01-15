/*
- `TSNonNullExpression` (TypeScript)
- `NonNullExpression` (Flow)
*/
function printNonNulExpression(path, options, print) {
  return [print("expression"), "!"];
}

export { printNonNulExpression };

/*
- `TSNonNullExpression` (TypeScript)
- `NonNullExpression` (Flow)
*/
function printNonNullExpression(path, options, print) {
  return [print("expression"), "!"];
}

export { printNonNullExpression };

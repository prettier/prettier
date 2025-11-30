/*
- `TSTypeQuery` (TypeScript)
- `TypeofTypeAnnotation` (flow)
*/
function printTypeQuery({ node }, print) {
  const argumentPropertyName =
    node.type === "TSTypeQuery" ? "exprName" : "argument";
  return ["typeof ", print(argumentPropertyName), print("typeArguments")];
}

export { printTypeQuery };

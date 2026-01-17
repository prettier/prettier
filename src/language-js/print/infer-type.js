/*
- `TSInferType`(TypeScript)
- `InferTypeAnnotation`(flow)
*/
function printInferType(path, options, print) {
  return ["infer ", print("typeParameter")];
}

export { printInferType };

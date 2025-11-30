/*
- `TSRestType`(TypeScript)
- `TupleTypeSpreadElement`(flow)
*/
function printRestType(path, options, print) {
  const { node } = path;

  return [
    "...",
    ...(node.type === "TupleTypeSpreadElement" && node.label
      ? [print("label"), ": "]
      : []),
    print("typeAnnotation"),
  ];
}

export { printRestType };

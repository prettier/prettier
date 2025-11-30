/*
- `TSNamedTupleMember`(TypeScript)
- `TupleTypeLabeledElement`(flow)
*/
function printNamedTupleMember(path, options, print) {
  const { node } = path;

  return [
    // `TupleTypeLabeledElement` only
    node.variance ? print("variance") : "",
    print("label"),
    node.optional ? "?" : "",
    ": ",
    print("elementType"),
  ];
}

export { printNamedTupleMember };

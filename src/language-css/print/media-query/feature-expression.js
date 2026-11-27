function printFeatureExpression(path, options, print) {
  const { node } = path;
  if (!node.nodes) {
    return node.value;
  }
  return ["(", ...path.map(print, "nodes"), ")"];
}

export { printFeatureExpression };

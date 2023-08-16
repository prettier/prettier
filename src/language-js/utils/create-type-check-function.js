function createTypeCheckFunction(types) {
  types = new Set(types);
  return (node) => types.has(node?.type);
}

export default createTypeCheckFunction;

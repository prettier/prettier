function isMethod(node) {
  return (
    (node.method && node.kind === "init") ||
    node.kind === "get" ||
    node.kind === "set"
  );
}

export { isMethod };

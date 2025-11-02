function isUnknownNamespace(node) {
  return (
    node.kind === "element" &&
    !node.hasExplicitNamespace &&
    !["html", "svg"].includes(node.namespace)
  );
}

export default isUnknownNamespace;

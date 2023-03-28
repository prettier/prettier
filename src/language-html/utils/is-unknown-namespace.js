function isUnknownNamespace(node) {
  return (
    node.type === "element" &&
    !node.hasExplicitNamespace &&
    !["html", "svg"].includes(node.namespace)
  );
}

export default isUnknownNamespace;

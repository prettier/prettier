function addTypePrefix(node, prefix, skipPrefix) {
  if (node && typeof node === "object") {
    delete node.parent;
    for (const key in node) {
      addTypePrefix(node[key], prefix, skipPrefix);
      if (
        key === "type" &&
        typeof node[key] === "string" &&
        !node[key].startsWith(prefix) &&
        (!skipPrefix || !skipPrefix.test(node[key]))
      ) {
        node[key] = prefix + node[key];
      }
    }
  }
  return node;
}

function addMissingType(node) {
  if (node && typeof node === "object") {
    delete node.parent;
    for (const key in node) {
      addMissingType(node[key]);
    }
    if (!Array.isArray(node) && node.value && !node.type) {
      node.type = "unknown";
    }
  }
  return node;
}

export { addTypePrefix, addMissingType };

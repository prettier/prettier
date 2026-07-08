function isScssNestedPropertyNode(node, options) {
  if (options.parser !== "scss") {
    return false;
  }

  /* c8 ignore next 3 */
  if (!node.selector) {
    return false;
  }

  return node.selector
    .replaceAll(/\/\*.*?\*\//g, "")
    .replaceAll(/\/\/.*\n/g, "")
    .trim()
    .endsWith(":");
}

export default isScssNestedPropertyNode;

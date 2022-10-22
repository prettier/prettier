function isSCSSNestedPropertyNode(node, options) {
  if (options.parser !== "scss") {
    return false;
  }

  /* c8 ignore next 3 */
  if (!node.selector) {
    return false;
  }

  return node.selector
    .replace(/\/\*.*?\*\//, "")
    .replace(/\/\/.*\n/, "")
    .trim()
    .endsWith(":");
}

export default isSCSSNestedPropertyNode;

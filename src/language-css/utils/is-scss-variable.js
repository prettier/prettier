function isSCSSVariable(node, options) {
  return Boolean(
    options.parser === "scss" &&
      node &&
      node.type === "word" &&
      node.value.startsWith("$")
  );
}

export default isSCSSVariable;

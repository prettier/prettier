function getRaw(node) {
  return node.extra?.raw ?? node.raw;
}

export default getRaw;

const getValueRoot = (node) => {
  while (node.parent) {
    node = node.parent;
  }

  return node;
};

export default getValueRoot;

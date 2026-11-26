function printSelectorNamespace(node) {
  if (!node.namespace) {
    return "";
  }

  return [
    node.namespace === true
      ? ""
      : (node.raws?.namespace ?? node.namespace).trim(),
    "|",
  ];
}

export { printSelectorNamespace };

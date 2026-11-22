function printUniversalSelector(path /* , options , print */) {
  const { node } = path;

  return [
    node.namespace
      ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
      : "",
    node.value,
  ];
}

export { printUniversalSelector };

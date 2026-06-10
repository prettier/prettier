function printDirectiveAttributes(path) {
  const { node } = path;

  const values = Object.entries(node.attributes).map(([key, value]) =>
    key === "id"
      ? `#${value}`
      : key === "class"
        ? `.${value}`
        : value
          ? `${key}=${value}`
          : key,
  );

  return values.length > 0 ? "{" + values.join(" ") + "}" : "";
}

export { printDirectiveAttributes };

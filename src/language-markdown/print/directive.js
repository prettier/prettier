// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L196
function printDirectiveAttributes(path) {
  const { node } = path;
  const { attributes } = node;

  const values = Object.entries(attributes).map(([key, value]) => {
    if (key === "id") {
      return `#${value}`;
    }
    if (key === "class") {
      return value
        .split(/[\t\n\r ]+/)
        .map((className) => `.${className}`)
        .join("");
    }

    if (!value) {
      return key;
    }

    return `${key}="${value}"`;
  });

  return values.length > 0 ? "{" + values.join(" ") + "}" : "";
}

export { printDirectiveAttributes };

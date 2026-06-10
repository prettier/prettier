import { printChildren } from "./children.js";

// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L480
function isInlineDirectiveLabel(node) {
  return Boolean(node?.type === "paragraph" && node.data?.directiveLabel);
}

// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L136
function printDirectiveLabel(path, options, print) {
  const { node } = path;
  const [head] = node.children;

  if (!isInlineDirectiveLabel(head)) {
    return "";
  }

  return ["[", print(["children", 0]), "]"];
}

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

function printDirectiveChildren(path, options, print) {
  let hasChildren = false;

  const parts = printChildren(path, options, print, {
    processor({ isFirst, node }) {
      if (isFirst && isInlineDirectiveLabel(node)) {
        return false;
      }

      hasChildren = true;

      return print();
    },
  });

  return hasChildren ? parts : "";
}

export {
  printDirectiveAttributes,
  printDirectiveChildren,
  printDirectiveLabel,
};

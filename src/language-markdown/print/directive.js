import { printChildren } from "./children.js";

// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L480
function isInlineDirectiveLabel(node) {
  return Boolean(node?.type === "paragraph" && node.data?.directiveLabel);
}

// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L136
function printDirectiveLabel(path, options, print) {
  const { node } = path;

  if (
    (node.type === "containerDirective" &&
      isInlineDirectiveLabel(node.children[0])) ||
    (node.type !== "containerDirective" && node.children.length === 1)
  ) {
    return ["[", print(["children", 0]), "]"];
  }

  return "";
}

// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L196
function printDirectiveAttributes(path, options) {
  const { node } = path;
  const { attributes } = node;
  if (Object.keys(attributes).length === 0) {
    return "";
  }

  let start = node.position.start.offset;
  start = options.originalText.indexOf("{", start);
  const end = options.originalText.indexOf("\n", start);
  const text = options.originalText.slice(start, end).trimEnd();

  return text;

  console.log({ text, node });

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

// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L490
function printDirectiveFence(path) {
  let size = 0;

  const { node } = path;
  if (node.type === "containerDirective") {
    const { ancestors } = path;

    let nesting = 0;
    for (let level = 0; level < ancestors.length; level++) {
      if (ancestors[level].type === "containerDirective") {
        nesting++;
      }

      if (nesting > size) {
        size = nesting;
      }
    }

    size += 3;
  } else if (node.type === "leafDirective") {
    size = 2;
  } else {
    size = 1;
  }

  return ":".repeat(size);
}

export {
  printDirectiveAttributes,
  printDirectiveChildren,
  printDirectiveFence,
  printDirectiveLabel,
};

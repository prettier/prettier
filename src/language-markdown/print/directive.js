import { hardline } from "../../document/index.js";
import { printChildren } from "./children.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

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
    (node.type !== "containerDirective" && node.children.length > 0)
  ) {
    return ["[", print(["children", 0]), "]"];
  }

  return "";
}

// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L196
function printDirectiveAttributes(path) {
  const { attributes } = path.node;

  if (!attributes || Object.keys(attributes).length === 0) {
    return "";
  }

  const values = Object.entries(attributes).map(([key, value]) => {
    if (key === "id" && value) {
      return `#${value}`;
    }

    if (key === "class" && value) {
      return value
        .split(/[\t\n\r ]+/)
        .map((className) => `.${className}`)
        .join("");
    }

    if (!value) {
      return key;
    }

    return `${key}="${value.replaceAll('"', "&quot;")}"`;
  });

  return "{" + values.join(" ") + "}";
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

// The fence of a container must be longer than the fences of every container
// nested inside it, so its size depends on the depth of descendants, see
// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L490
function getContainerDirectiveDepth(node) {
  let depth = 0;

  if (node.children) {
    for (const child of node.children) {
      const childDepth =
        getContainerDirectiveDepth(child) +
        (child.type === "containerDirective" ? 1 : 0);

      if (childDepth > depth) {
        depth = childDepth;
      }
    }
  }

  return depth;
}

function printDirectiveFence(node) {
  if (node.type === "containerDirective") {
    return ":".repeat(3 + getContainerDirectiveDepth(node));
  }

  return node.type === "leafDirective" ? "::" : ":";
}

function printContainerDirective(path, options, print) {
  const { node } = path;
  const fence = printDirectiveFence(node);
  const parts = [
    fence,
    node.name,
    printDirectiveLabel(path, options, print),
    printDirectiveAttributes(path),
  ];

  const childrenDocs = printDirectiveChildren(path, options, print);

  if (childrenDocs) {
    parts.push(hardline, childrenDocs);
  }

  parts.push(hardline, fence);

  return parts;
}

function printLeafOrTextDirective(path, options, print) {
  const { node } = path;
  return [
    printDirectiveFence(node),
    node.name,
    printDirectiveLabel(path, options, print),
    printDirectiveAttributes(path),
  ];
}

export { printContainerDirective, printLeafOrTextDirective };

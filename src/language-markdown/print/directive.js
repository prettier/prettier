import { hardline } from "../../document/index.js";
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

/**
 * Where the attributes begin: the `{` after the name and, when there is one,
 * after the whole `[label]`. A label can itself contain braces, so the first
 * `{` in the directive is not necessarily the attributes.
 * Returns -1 when the directive has no attribute block.
 */
function findAttributesStart(text, node) {
  let index = node.position.start.offset;
  const end = node.position.end.offset;

  while (text[index] === ":") {
    index++;
  }
  while (index < end && /[\w-]/u.test(text[index])) {
    index++;
  }

  if (text[index] === "[") {
    let depth = 0;
    for (; index < end; index++) {
      if (text[index] === "\\") {
        index++;
      } else if (text[index] === "[") {
        depth++;
      } else if (text[index] === "]" && --depth === 0) {
        index++;
        break;
      }
    }
  }

  return text[index] === "{" ? index : -1;
}

/**
 * The attributes exactly as they were written, `{`...`}` included.
 *
 * They are copied from the original text rather than rebuilt from
 * `node.attributes`, because the parser keeps only the resolved values:
 * shorthands (`{#id.class}`), quoting and character references (`&amp;`) are
 * all lost, and reprinting them would change the document.
 *
 * The end is found by matching braces, minding quotes, so an attribute value
 * containing `}` and anything written after the directive both survive.
 */
function printDirectiveAttributes(path, options) {
  const { node } = path;
  if (Object.keys(node.attributes).length === 0) {
    return "";
  }

  const { originalText } = options;
  const start = findAttributesStart(originalText, node);
  if (start === -1) {
    return "";
  }

  let quote;
  for (let index = start; index < node.position.end.offset; index++) {
    const character = originalText[index];
    if (quote) {
      if (character === quote) {
        quote = undefined;
      }
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "}") {
      return originalText.slice(start, index + 1);
    }
  }

  return "";
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

function printDirectiveContainer(path, options, print) {
  const { node } = path;
  const fence = printDirectiveFence(path);
  const parts = [
    fence,
    node.name,
    printDirectiveLabel(path, options, print),
    printDirectiveAttributes(path, options),
  ];

  const childrenDocs = printDirectiveChildren(path, options, print);

  if (childrenDocs) {
    parts.push(hardline, childrenDocs);
  }

  if (fence === ":::") {
    parts.push(hardline, fence);
  }

  return parts;
}

function printLeafDirective(path, options, print) {
  const { node } = path;
  return [
    printDirectiveFence(path),
    node.name,
    printDirectiveLabel(path, options, print),
    printDirectiveAttributes(path, options),
  ];
}

export { printDirectiveContainer, printLeafDirective };

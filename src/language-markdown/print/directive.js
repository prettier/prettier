import { hardline, replaceEndOfLine } from "../../document/index.js";
import { printChildren } from "./children.js";

// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L480
function isInlineDirectiveLabel(node) {
  return Boolean(node?.type === "paragraph" && node.data?.directiveLabel);
}

function getNameEnd(node, text) {
  let index = node.position.start.offset;
  while (text[index] === ":") {
    index++;
  }
  return index + node.name.length;
}

/**
 * Returns the offset right after the label (`[…]`), or right after the name if
 * there is no label.
 */
function getLabelEnd(node, text) {
  const nameEnd = getNameEnd(node, text);
  if (text[nameEnd] !== "[") {
    return nameEnd;
  }

  if (node.type === "containerDirective") {
    // The label paragraph includes the brackets
    return isInlineDirectiveLabel(node.children[0])
      ? node.children[0].position.end.offset
      : text.indexOf("]", nameEnd) + 1;
  }

  const searchStart = node.children.at(-1)?.position.end.offset ?? nameEnd + 1;
  return text.indexOf("]", searchStart) + 1;
}

// `}` can only appear in attributes inside quoted values
function getAttributesEnd(text, start) {
  let quote;
  for (let index = start + 1; index < text.length; index++) {
    const character = text[index];
    if (quote) {
      if (character === quote) {
        quote = undefined;
      }
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "}") {
      return index + 1;
    }
  }

  /* c8 ignore next */
  return text.length;
}

function printDirectiveLabel(path, options, print) {
  const { node } = path;
  const text = options.originalText;
  if (text[getNameEnd(node, text)] !== "[") {
    return "";
  }

  if (node.type === "containerDirective") {
    return [
      "[",
      isInlineDirectiveLabel(node.children[0]) ? print(["children", 0]) : "",
      "]",
    ];
  }

  return ["[", printChildren(path, options, print), "]"];
}

const CONTAINER_WITH_LINE_PREFIX_TYPES = new Set([
  "blockquote",
  "listItem",
  "footnoteDefinition",
]);

const escapeAttributeValue = (value) =>
  value.replaceAll(
    /["&\n\r]/g,
    (character) => `&#x${character.codePointAt(0).toString(16)};`,
  );

// Attributes are printed as-is
function printDirectiveAttributes(path, options) {
  const { node } = path;
  const text = options.originalText;
  const start = getLabelEnd(node, text);
  if (text[start] !== "{") {
    return "";
  }

  const raw = text.slice(start, getAttributesEnd(text, start));

  if (!raw.includes("\n")) {
    return raw;
  }

  // Continuation lines contain the prefixes (`>`, indentation) of the
  // enclosing blocks, which will be printed again, so print from the parsed values
  if (
    path.ancestors.some((ancestor) =>
      CONTAINER_WITH_LINE_PREFIX_TYPES.has(ancestor.type),
    )
  ) {
    const attributes = Object.entries(node.attributes).map(([name, value]) =>
      value ? `${name}="${escapeAttributeValue(value)}"` : name,
    );
    return ["{", attributes.join(" "), "}"];
  }

  return replaceEndOfLine(raw, hardline);
}

// The fence must be longer than the fences of nested container directives
// https://github.com/syntax-tree/mdast-util-directive/blob/a683327fafc4e48f81caf8d09d15fef8dd42a627/lib/index.js#L490
function getContainerDirectiveFenceSize(node) {
  let maxNesting = 0;

  const visit = (node, nesting) => {
    for (const child of node.children ?? []) {
      if (child.type === "containerDirective") {
        maxNesting = Math.max(maxNesting, nesting + 1);
        visit(child, nesting + 1);
      } else {
        visit(child, nesting);
      }
    }
  };
  visit(node, 0);

  return maxNesting + 3;
}

function printDirectiveOpening(path, options, print, fence) {
  const { node } = path;
  return [
    fence,
    node.name,
    printDirectiveLabel(path, options, print),
    printDirectiveAttributes(path, options),
  ];
}

function printContainerDirective(path, options, print) {
  const { node } = path;
  const fence = ":".repeat(getContainerDirectiveFenceSize(node));

  const contentNodes = node.children.filter(
    (child, index) => !(index === 0 && isInlineDirectiveLabel(child)),
  );

  if (contentNodes.length === 0) {
    return [
      printDirectiveOpening(path, options, print, fence),
      hardline,
      fence,
    ];
  }

  const content = printChildren(path, options, print, {
    processor({ isFirst, node }) {
      if (isFirst && isInlineDirectiveLabel(node)) {
        return false;
      }

      return print();
    },
  });

  const { start, end } = node.position;
  const hasBlankLineAfterOpening =
    contentNodes[0].position.start.line > start.line + 1;
  const hasBlankLineBeforeClosing =
    contentNodes.at(-1).position.end.line < end.line - 1;

  return [
    printDirectiveOpening(path, options, print, fence),
    hardline,
    hasBlankLineAfterOpening ? hardline : "",
    content,
    hardline,
    hasBlankLineBeforeClosing ? hardline : "",
    fence,
  ];
}

function printLeafDirective(path, options, print) {
  return printDirectiveOpening(path, options, print, "::");
}

function printTextDirective(path, options, print) {
  return printDirectiveOpening(path, options, print, ":");
}

export { printContainerDirective, printLeafDirective, printTextDirective };

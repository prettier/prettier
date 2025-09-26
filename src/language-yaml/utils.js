import isNonEmptyArray from "../utils/is-non-empty-array.js";

/**
 * @param {any} value
 * @param {string[]=} types
 */
function isNode(value, types) {
  return (
    typeof value?.type === "string" && (!types || types.includes(value.type))
  );
}

function mapNode(node, callback, parent) {
  return callback(
    "children" in node
      ? {
          ...node,
          children: node.children.map((childNode) =>
            mapNode(childNode, callback, node),
          ),
        }
      : node,
    parent,
  );
}

function defineShortcut(x, key, getter) {
  Object.defineProperty(x, key, {
    get: getter,
    enumerable: false,
  });
}

function isNextLineEmpty(node, text) {
  let newlineCount = 0;
  const textLength = text.length;
  for (let i = node.position.end.offset - 1; i < textLength; i++) {
    const char = text[i];

    if (char === "\n") {
      newlineCount++;
    }

    if (newlineCount === 1 && /\S/u.test(char)) {
      return false;
    }

    if (newlineCount === 2) {
      return true;
    }
  }

  return false;
}

function isLastDescendantNode(path) {
  const { node } = path;

  switch (node.type) {
    case "tag":
    case "anchor":
    case "comment":
      return false;
  }

  const pathStackLength = path.stack.length;

  for (let i = 1; i < pathStackLength; i++) {
    const item = path.stack[i];
    const parentItem = path.stack[i - 1];

    if (
      Array.isArray(parentItem) &&
      typeof item === "number" &&
      item !== parentItem.length - 1
    ) {
      return false;
    }
  }

  return true;
}

function getLastDescendantNode(node) {
  return isNonEmptyArray(node.children)
    ? getLastDescendantNode(node.children.at(-1))
    : node;
}

function isPrettierIgnore(comment) {
  return comment.value.trim() === "prettier-ignore";
}

function hasPrettierIgnore(path) {
  const { node } = path;

  if (node.type === "documentBody") {
    const documentHead = path.parent.head;
    return (
      hasEndComments(documentHead) &&
      isPrettierIgnore(documentHead.endComments.at(-1))
    );
  }

  return (
    hasLeadingComments(node) && isPrettierIgnore(node.leadingComments.at(-1))
  );
}

function isEmptyNode(node) {
  return !isNonEmptyArray(node.children) && !hasComments(node);
}

function hasComments(node) {
  return (
    hasLeadingComments(node) ||
    hasMiddleComments(node) ||
    hasIndicatorComment(node) ||
    hasTrailingComment(node) ||
    hasEndComments(node)
  );
}

function hasLeadingComments(node) {
  return isNonEmptyArray(node?.leadingComments);
}

function hasMiddleComments(node) {
  return isNonEmptyArray(node?.middleComments);
}

function hasIndicatorComment(node) {
  return node?.indicatorComment;
}

function hasTrailingComment(node) {
  return node?.trailingComment;
}

function hasEndComments(node) {
  return isNonEmptyArray(node?.endComments);
}

/**
" a   b c   d e   f " -> [" a   b", "c   d", "e   f "]

@param {string} text
*/
function splitWithSingleSpace(text) {
  return text ? text.split(/(?<!^| ) (?! |$)/u) : [];
}

/**
@param {string} nodeType
@param {string} content
*/
function getFlowScalarLineContents(nodeType, content, options) {
  const rawLineContents = content
    .split("\n")
    .map((lineContent, index, lineContents) =>
      index === 0 && index === lineContents.length - 1
        ? lineContent
        : index !== 0 && index !== lineContents.length - 1
          ? lineContent.trim()
          : index === 0
            ? lineContent.trimEnd()
            : lineContent.trimStart(),
    );

  if (options.proseWrap === "preserve") {
    return rawLineContents.map((lineContent) =>
      lineContent ? [lineContent] : [],
    );
  }

  /** @type {string[][]} */
  const lines = [];
  for (const [index, line] of rawLineContents.entries()) {
    const words = splitWithSingleSpace(line);

    if (
      index > 0 &&
      rawLineContents[index - 1].length > 0 &&
      words.length > 0 &&
      !(
        // trailing backslash in quoteDouble should be preserved
        (nodeType === "quoteDouble" && lines.at(-1).at(-1).endsWith("\\"))
      )
    ) {
      lines[lines.length - 1] = [...lines.at(-1), ...words];
    } else {
      lines.push(words);
    }
  }

  return options.proseWrap === "never"
    ? lines.map((words) => [words.join(" ")])
    : lines;
}

function getBlockValueLineContents(
  node,
  { parentIndent, isLastDescendant, options },
) {
  /** @type {string} */
  const content =
    node.position.start.line === node.position.end.line
      ? ""
      : options.originalText
          .slice(node.position.start.offset, node.position.end.offset)
          // exclude open line `>` or `|`
          .match(/^[^\n]*\n(.*)$/su)[1];

  /** @type {number} */
  let leadingSpaceCount;
  if (node.indent === null) {
    const matches = content.match(/^(?<leadingSpace> *)[^\n\r ]/mu);
    leadingSpaceCount = matches
      ? matches.groups.leadingSpace.length
      : Number.POSITIVE_INFINITY;
  } else {
    leadingSpaceCount = node.indent - 1 + parentIndent;
  }

  const rawLineContents = content
    .split("\n")
    .map((lineContent) => lineContent.slice(leadingSpaceCount));

  if (options.proseWrap === "preserve" || node.type === "blockLiteral") {
    return removeUnnecessaryTrailingNewlines(
      rawLineContents.map((lineContent) => (lineContent ? [lineContent] : [])),
    );
  }

  /** @type {string[][]} */
  let lines = [];
  for (const [index, line] of rawLineContents.entries()) {
    const words = splitWithSingleSpace(line);

    if (
      index > 0 &&
      words.length > 0 &&
      rawLineContents[index - 1].length > 0 &&
      !/^\s/u.test(words[0]) &&
      // This test against a `string[]`, should be a mistake
      // originally introduced in https://github.com/prettier/prettier/pull/4742/files#diff-a4dc2e1922e1d8d5ac20818480f777c9a2d5af739eaa3a0409b08bf29a9d0f74R282
      // @ts-expect-error -- see comment above
      !/^\s|\s$/u.test(lines.at(-1))
    ) {
      lines[lines.length - 1] = [...lines.at(-1), ...words];
    } else {
      lines.push(words);
    }
  }

  lines = lines.map((originalWords) => {
    const words = [];
    for (const word of originalWords) {
      // disallow trailing spaces
      if (words.length > 0 && /\s$/u.test(words.at(-1))) {
        words[words.length - 1] += " " + word;
      } else {
        words.push(word);
      }
    }
    return words;
  });

  if (options.proseWrap === "never") {
    lines = lines.map((words) => [words.join(" ")]);
  }

  return removeUnnecessaryTrailingNewlines(lines);

  /**
  @param {string[][]} lineContents
  */
  function removeUnnecessaryTrailingNewlines(lineContents) {
    if (node.chomping === "keep") {
      return lineContents.at(-1).length === 0
        ? lineContents.slice(0, -1)
        : lineContents;
    }

    let trailingNewlineCount = 0;
    for (let i = lineContents.length - 1; i >= 0; i--) {
      if (lineContents[i].length === 0) {
        trailingNewlineCount++;
      } else {
        break;
      }
    }

    return trailingNewlineCount === 0
      ? lineContents
      : trailingNewlineCount >= 2 && !isLastDescendant
        ? // next empty line
          lineContents.slice(0, -(trailingNewlineCount - 1))
        : lineContents.slice(0, -trailingNewlineCount);
  }
}

function isInlineNode(node) {
  /* c8 ignore next 3 */
  if (!node) {
    return true;
  }

  switch (node.type) {
    case "plain":
    case "quoteDouble":
    case "quoteSingle":
    case "alias":
    case "flowMapping":
    case "flowSequence":
      return true;
    default:
      return false;
  }
}

export {
  defineShortcut,
  getBlockValueLineContents,
  getFlowScalarLineContents,
  getLastDescendantNode,
  hasEndComments,
  hasIndicatorComment,
  hasLeadingComments,
  hasMiddleComments,
  hasPrettierIgnore,
  hasTrailingComment,
  isEmptyNode,
  isInlineNode,
  isLastDescendantNode,
  isNextLineEmpty,
  isNode,
  mapNode,
};

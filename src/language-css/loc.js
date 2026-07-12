import isNonEmptyArray from "../utilities/is-non-empty-array.js";
import lineColumnToIndex from "../utilities/line-column-to-index.js";
import { skipEverythingButNewLine } from "../utilities/skip.js";

function fixValueWordLoc(node, originalIndex) {
  const { value } = node;
  if (value === "-" || value === "--" || value.charAt(0) !== "-") {
    return originalIndex;
  }
  return originalIndex - (value.charAt(1) === "-" ? 2 : 1);
}

function calculateLocStart(node, text) {
  // `postcss>=8`
  if (typeof node.source?.start?.offset === "number") {
    return node.source.start.offset;
  }

  // value-* nodes have this
  if (typeof node.sourceIndex === "number") {
    if (node.type === "value-word") {
      return fixValueWordLoc(node, node.sourceIndex);
    }
    return node.sourceIndex;
  }

  if (node.source?.start) {
    return lineColumnToIndex(node.source.start, text);
  }

  /* c8 ignore next */
  throw Object.assign(new Error("Can not locate node."), { node });
}

function calculateLocEnd(node, text) {
  if (node.type === "css-comment" && node.inline) {
    return skipEverythingButNewLine(text, node.source.startOffset);
  }

  if (node.type === "value-paren" && typeof node.sourceIndex === "number") {
    return node.sourceIndex + (node.value === ")" ? node.value.length : 0);
  }

  // `postcss>=8`
  if (typeof node.source?.end?.offset === "number") {
    return node.source.end.offset;
  }

  if (node.source) {
    if (node.source.end) {
      const index = lineColumnToIndex(node.source.end, text);
      if (node.type === "value-word") {
        return fixValueWordLoc(node, index);
      }
      return index;
    }

    if (isNonEmptyArray(node.nodes)) {
      return calculateLocEnd(node.nodes.at(-1), text);
    }

    if (node.type === "css-atrule" && typeof node.name === "string") {
      return (
        calculateLocStart(node, text) +
        1 +
        node.name.length +
        node.raws.afterName.length +
        node.raws.params.length
      );
    }
  }

  if (typeof node.sourceIndex === "number" && typeof node.value === "string") {
    return node.sourceIndex + node.value.length;
  }

  return null;
}

function calculateLoc(node, text) {
  calculateNodeLoc(node, text, 0, false);
}

function calculateNodeLoc(node, text, rootOffset, isRootOfText) {
  if (isRootOfText && typeof node.type === "string") {
    node.source ??= {};
    node.source.startOffset = rootOffset;
    node.source.endOffset = rootOffset + text.length;
  } else if (
    typeof node.source?.startOffset === "number" &&
    typeof node.source?.endOffset === "number"
  ) {
    // Already calculated while walking another view of the same nested tree.
  } else if (node.source || typeof node.sourceIndex === "number") {
    node.source ??= {};
    const maxEndOffset = rootOffset + text.length;
    node.source.startOffset = Math.min(
      calculateLocStart(node, text) + rootOffset,
      maxEndOffset,
    );
    const endOffset = calculateLocEnd(node, text);
    node.source.endOffset =
      typeof endOffset === "number"
        ? Math.min(endOffset + rootOffset, maxEndOffset)
        : endOffset;
  }

  for (const key in node) {
    const child = node[key];

    if (key === "source" || !child || typeof child !== "object") {
      continue;
    }

    const children = Array.isArray(child) ? child : [child];
    for (const childNode of children) {
      if (!childNode || typeof childNode !== "object") {
        continue;
      }

      const nestedLoc = getNestedLoc(node, childNode, rootOffset);

      if (nestedLoc) {
        calculateNodeLoc(childNode, nestedLoc.text, nestedLoc.rootOffset, true);
      } else {
        calculateNodeLoc(childNode, text, rootOffset, false);
      }

      fillEmptyLocFromParent(childNode, node);
    }
  }

  fillLocFromChildren(node);
  fillEmptyChildLocs(node);
}

function getNestedLoc(parentNode, node, rootOffset) {
  if (node.type === "value-root" || node.type === "value-unknown") {
    return {
      rootOffset: getValueRootOffset(parentNode),
      text: node.text || node.value || "",
    };
  }

  if (node.type === "media-query-list" || parentNode.params === node) {
    return {
      rootOffset: getAtRuleParamsRootOffset(parentNode),
      text: parentNode.raws?.params || node.value || "",
    };
  }

  if (node.type?.startsWith("selector-")) {
    const selectorText = getSelectorText(parentNode, node);

    if (typeof selectorText === "string") {
      return {
        rootOffset: getSelectorRootOffset(
          parentNode,
          node,
          selectorText,
          rootOffset,
        ),
        text: selectorText,
      };
    }
  }
}

function getValueRootOffset(node) {
  let result = node.source.startOffset;
  if (typeof node.prop === "string") {
    result += node.prop.length;
  }

  if (node.type === "css-atrule" && typeof node.name === "string") {
    result +=
      1 + node.name.length + node.raws.afterName.match(/^\s*:?\s*/)[0].length;
  }

  if (node.type !== "css-atrule" && typeof node.raws?.between === "string") {
    result += node.raws.between.length;
  }

  return result;
}

function getAtRuleParamsRootOffset(node) {
  let result = node.source.startOffset;

  if (node.type === "css-atrule" && typeof node.name === "string") {
    result +=
      1 + node.name.length + node.raws.afterName.match(/^\s*:?\s*/)[0].length;
  }

  return result;
}

function getSelectorText(parentNode, selectorNode) {
  if (typeof selectorNode.raws?.selector === "string") {
    return selectorNode.raws.selector;
  }

  if (parentNode.selector !== selectorNode) {
    return;
  }

  if (parentNode.mixin) {
    return (
      parentNode.raws.identifier +
      parentNode.name +
      parentNode.raws.afterName +
      parentNode.raws.params
    );
  }

  if (typeof parentNode.raws?.selector === "string") {
    return parentNode.raws.selector;
  }

  if (
    parentNode.customSelector &&
    typeof parentNode.raws?.params === "string"
  ) {
    return parentNode.raws.params
      .slice(parentNode.customSelector.length)
      .trim();
  }

  if (typeof parentNode.raws?.params === "string") {
    return parentNode.raws.params;
  }

  if (
    parentNode.type === "css-decl" &&
    typeof parentNode.raws?.value === "string"
  ) {
    const { value } = parentNode.raws;

    if (parentNode.extend && value.startsWith("extend(")) {
      return value.slice("extend(".length, -1);
    }

    return value;
  }
}

function getSelectorRootOffset(
  parentNode,
  selectorNode,
  selectorText,
  rootOffset,
) {
  if (
    typeof selectorNode.sourceIndex === "number" &&
    typeof selectorNode.raws?.selector === "string"
  ) {
    return rootOffset + selectorNode.sourceIndex;
  }

  if (parentNode.mixin) {
    return parentNode.source.startOffset;
  }

  if (typeof parentNode.raws?.selector === "string") {
    return (
      parentNode.source.startOffset +
      getStringOffset(parentNode.raws.selector, selectorText)
    );
  }

  if (typeof parentNode.raws?.params === "string") {
    return (
      getAtRuleParamsRootOffset(parentNode) +
      getStringOffset(parentNode.raws.params, selectorText)
    );
  }

  if (
    parentNode.type === "css-decl" &&
    typeof parentNode.raws?.value === "string"
  ) {
    return (
      getValueRootOffset(parentNode) +
      getStringOffset(parentNode.raws.value, selectorText)
    );
  }

  return rootOffset;
}

function getStringOffset(text, search) {
  const index = text.indexOf(search);
  return index === -1 ? 0 : index;
}

function fillLocFromChildren(node) {
  if (typeof node.type !== "string") {
    return;
  }

  const hasOffsets =
    typeof node.source?.startOffset === "number" &&
    typeof node.source?.endOffset === "number";
  const hasLineColumn = node.source?.start && node.source.end;

  if (hasOffsets && hasLineColumn) {
    return;
  }

  let startOffset = Number.POSITIVE_INFINITY;
  let endOffset = Number.NEGATIVE_INFINITY;
  let start;
  let end;

  for (const key in node) {
    if (key === "source" || key === "raws" || key === "spaces") {
      continue;
    }

    const child = node[key];
    const children = Array.isArray(child) ? child : [child];

    for (const childNode of children) {
      if (
        !childNode ||
        typeof childNode !== "object" ||
        typeof childNode.source?.startOffset !== "number" ||
        typeof childNode.source?.endOffset !== "number"
      ) {
        continue;
      }

      if (childNode.source.startOffset < startOffset) {
        startOffset = childNode.source.startOffset;
        start = childNode.source.start;
      }

      if (childNode.source.endOffset > endOffset) {
        endOffset = childNode.source.endOffset;
        end = childNode.source.end;
      }
    }
  }

  if (startOffset !== Number.POSITIVE_INFINITY) {
    node.source ??= {};
    if (!hasOffsets) {
      node.source.startOffset = startOffset;
      node.source.endOffset = endOffset;
    }
    node.source.start ??= start;
    node.source.end ??= end;
  }
}

function fillEmptyLocFromParent(node, parentNode) {
  if (
    typeof node.type !== "string" ||
    node.source ||
    typeof parentNode.source?.startOffset !== "number" ||
    typeof parentNode.source?.endOffset !== "number" ||
    !isEmptyLocNode(node)
  ) {
    return;
  }

  node.source = {
    startOffset: parentNode.source.startOffset,
    endOffset: parentNode.source.startOffset,
    start: parentNode.source.start,
    end: parentNode.source.start,
  };
}

function fillEmptyChildLocs(node) {
  if (
    typeof node.source?.startOffset !== "number" ||
    typeof node.source?.endOffset !== "number"
  ) {
    return;
  }

  for (const key in node) {
    if (key === "source" || key === "raws" || key === "spaces") {
      continue;
    }

    const child = node[key];
    const children = Array.isArray(child) ? child : [child];

    for (const childNode of children) {
      if (childNode && typeof childNode === "object") {
        fillEmptyLocFromParent(childNode, node);
      }
    }
  }
}

function isEmptyLocNode(node) {
  return (
    (Array.isArray(node.nodes) && node.nodes.length === 0) ||
    (Array.isArray(node.groups) && node.groups.length === 0)
  );
}

/**
 * Workaround for a bug: quotes and asterisks in inline comments corrupt loc data of subsequent nodes.
 * This function replaces the quotes and asterisks with spaces. Later, when the comments are printed,
 * their content is extracted from the original text.
 * - https://github.com/prettier/prettier/issues/7780
 * - https://github.com/shellscape/postcss-less/issues/145
 * - https://github.com/prettier/prettier/issues/8130
 * @param text {string}
 */
function replaceQuotesInInlineComments(text) {
  /** @typedef { 'initial' | 'single-quotes' | 'double-quotes' | 'url' | 'comment-block' | 'comment-inline' } State */
  /** @type {State} */
  let state = "initial";
  /** @type {State} */
  let stateToReturnFromQuotes = "initial";
  let inlineCommentStartIndex;
  let inlineCommentContainsQuotes = false;
  const inlineCommentsToReplace = [];

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    switch (state) {
      case "initial":
        if (c === "'") {
          state = "single-quotes";
          continue;
        }

        if (c === '"') {
          state = "double-quotes";
          continue;
        }

        if (
          (c === "u" || c === "U") &&
          text.slice(i, i + 4).toLowerCase() === "url("
        ) {
          state = "url";
          i += 3;
          continue;
        }

        if (c === "/") {
          const nextCharacter = text[i + 1];
          if (nextCharacter === "*") {
            state = "comment-block";
            i++;
          } else if (nextCharacter === "/") {
            state = "comment-inline";
            inlineCommentStartIndex = i;
            i++;
          }
          continue;
        }

        continue;

      case "single-quotes":
        if (c === "'" && text[i - 1] !== "\\") {
          state = stateToReturnFromQuotes;
          stateToReturnFromQuotes = "initial";
        }
        if (c === "\n" || c === "\r") {
          return text; // invalid input
        }
        continue;

      case "double-quotes":
        if (c === '"' && text[i - 1] !== "\\") {
          state = stateToReturnFromQuotes;
          stateToReturnFromQuotes = "initial";
        }
        if (c === "\n" || c === "\r") {
          return text; // invalid input
        }
        continue;

      case "url":
        if (c === ")") {
          state = "initial";
        } else if (c === "\n" || c === "\r") {
          return text; // invalid input
        }
        if (c === "'") {
          state = "single-quotes";
          stateToReturnFromQuotes = "url";
          continue;
        }
        if (c === '"') {
          state = "double-quotes";
          stateToReturnFromQuotes = "url";
          continue;
        }
        continue;

      case "comment-block":
        if (c === "/" && text[i - 1] === "*") {
          state = "initial";
        }
        continue;

      case "comment-inline":
        if (c === '"' || c === "'" || c === "*") {
          inlineCommentContainsQuotes = true;
        } else if (c === "\n" || c === "\r") {
          if (inlineCommentContainsQuotes) {
            inlineCommentsToReplace.push([inlineCommentStartIndex, i]);
          }
          state = "initial";
          inlineCommentContainsQuotes = false;
        }
        continue;
    }
  }

  for (const [start, end] of inlineCommentsToReplace) {
    text =
      text.slice(0, start) +
      text.slice(start, end).replaceAll(/["'*]/g, " ") +
      text.slice(end);
  }

  return text;
}

const locStart = (node) => node.source.startOffset;
const locEnd = (node) => node.source.endOffset;

export { calculateLoc, locEnd, locStart, replaceQuotesInInlineComments };

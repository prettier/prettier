import isNonEmptyArray from "../utils/is-non-empty-array.js";
import lineColumnToIndex from "../utils/line-column-to-index.js";
import { skipEverythingButNewLine } from "../utils/skip.js";

function calculateLocStart(node, text) {
  // `postcss>=8`
  if (typeof node.source?.start?.offset === "number") {
    return node.source.start.offset;
  }

  // value-* nodes have this
  if (typeof node.sourceIndex === "number") {
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

  // `postcss>=8`
  if (typeof node.source?.end?.offset === "number") {
    return node.source.end.offset;
  }

  if (node.source) {
    if (node.source.end) {
      return lineColumnToIndex(node.source.end, text);
    }

    if (isNonEmptyArray(node.nodes)) {
      return calculateLocEnd(node.nodes.at(-1), text);
    }
  }

  return null;
}

function calculateLoc(node, text) {
  if (node.source) {
    node.source.startOffset = calculateLocStart(node, text);
    node.source.endOffset = calculateLocEnd(node, text);
  }

  for (const key in node) {
    const child = node[key];

    if (key === "source" || !child || typeof child !== "object") {
      continue;
    }

    if (child.type === "value-root" || child.type === "value-unknown") {
      calculateValueNodeLoc(
        child,
        getValueRootOffset(node),
        child.text || child.value,
      );
    } else {
      calculateLoc(child, text);
    }
  }
}

function calculateValueNodeLoc(node, rootOffset, text) {
  if (node.source) {
    node.source.startOffset = calculateLocStart(node, text) + rootOffset;
    node.source.endOffset = calculateLocEnd(node, text) + rootOffset;
  }

  for (const key in node) {
    const child = node[key];

    if (key === "source" || !child || typeof child !== "object") {
      continue;
    }

    calculateValueNodeLoc(child, rootOffset, text);
  }
}

function getValueRootOffset(node) {
  let result = node.source.startOffset;
  if (typeof node.prop === "string") {
    result += node.prop.length;
  }

  if (node.type === "css-atrule" && typeof node.name === "string") {
    result +=
      1 + node.name.length + node.raws.afterName.match(/^\s*:?\s*/u)[0].length;
  }

  if (node.type !== "css-atrule" && typeof node.raws?.between === "string") {
    result += node.raws.between.length;
  }

  return result;
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

        if (c === "*" && text[i - 1] === "/") {
          state = "comment-block";
          continue;
        }

        if (c === "/" && text[i - 1] === "/") {
          state = "comment-inline";
          inlineCommentStartIndex = i - 1;
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
        }
        if (c === "\n" || c === "\r") {
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
        }
        if (c === "\n" || c === "\r") {
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
      text.slice(start, end).replaceAll(/["'*]/gu, " ") +
      text.slice(end);
  }

  return text;
}

function locStart(node) {
  return node.source?.startOffset;
}

function locEnd(node) {
  return node.source?.endOffset;
}

export { calculateLoc, locEnd, locStart, replaceQuotesInInlineComments };

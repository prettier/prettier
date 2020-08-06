"use strict";

const lineColumnToIndex = require("../utils/line-column-to-index");
const { getLast, skipEverythingButNewLine } = require("../common/util");

function calculateLocStart(node, text) {
  if (node.source) {
    return lineColumnToIndex(node.source.start, text) - 1;
  }
  return null;
}

function calculateLocEnd(node, text) {
  if (node.type === "css-comment" && node.inline) {
    return skipEverythingButNewLine(text, node.source.startOffset);
  }
  const endNode = node.nodes && getLast(node.nodes);
  if (endNode && node.source && !node.source.end) {
    node = endNode;
  }
  if (node.source && node.source.end) {
    return lineColumnToIndex(node.source.end, text);
  }
  return null;
}

function calculateLoc(node, text) {
  if (node && typeof node === "object") {
    if (node.source) {
      node.source.startOffset = calculateLocStart(node, text);
      node.source.endOffset = calculateLocEnd(node, text);
    }

    for (const key in node) {
      calculateLoc(node[key], text);
    }
  }
}

/**
 * Workaround for a bug: quotes in inline comments corrupt loc data of subsequent nodes.
 * This function replaces the quotes with U+FFFE and U+FFFF. Later, when the comments are printed,
 * their content is extracted from the original text or restored by replacing the placeholder
 * characters back with quotes.
 * - https://github.com/prettier/prettier/issues/7780
 * - https://github.com/shellscape/postcss-less/issues/145
 * - About noncharacters (U+FFFE and U+FFFF): http://www.unicode.org/faq/private_use.html#nonchar1
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
        if (c === '"' || c === "'") {
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
      text.slice(start, end).replace(/'/g, "\ufffe").replace(/"/g, "\uffff") +
      text.slice(end);
  }

  return text;
}

function restoreQuotesInInlineComments(text) {
  return text.replace(/\ufffe/g, "'").replace(/\uffff/g, '"');
}

module.exports = {
  calculateLoc,
  replaceQuotesInInlineComments,
  restoreQuotesInInlineComments,
};

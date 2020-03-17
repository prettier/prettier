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

// Workaround for a bug: quotes in inline comments corrupt loc data of subsequent nodes.
// This function replaces the quotes with spaces. Later, when the comments are printed,
// their content is extracted from the original text.
// https://github.com/prettier/prettier/issues/7780
// https://github.com/shellscape/postcss-less/issues/145
/** @param text {string} */
function replaceQuotesInInlineComments(text) {
  /** @type { 'initial' | 'single-quotes' | 'double-quotes' | 'url' | 'comment-block' | 'comment-inline' } */
  let state = "initial";
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

        if (c === "(" && /\burl$/i.test(text.slice(i - 4, i))) {
          state = "url";
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
          state = "initial";
        }
        if (c === "\n" || c === "\r") {
          return text; // invalid input
        }
        continue;

      case "double-quotes":
        if (c === '"' && text[i - 1] !== "\\") {
          state = "initial";
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
      text.slice(start, end).replace(/'|"/g, " ") +
      text.slice(end);
  }

  return text;
}

module.exports = { calculateLoc, replaceQuotesInInlineComments };

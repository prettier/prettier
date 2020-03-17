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
// https://github.com/prettier/prettier/issues/7780
// https://github.com/shellscape/postcss-less/issues/145
function replaceQuotesInInlineComments(text) {
  return text.replace(/^(.*)\/\/(.+?)$/gm, (line, before, after) => {
    let insideParens = false;
    let insideQuotes = false;
    for (let i = 0; i < before.length; i++) {
      const c = before[i];

      if (insideQuotes) {
        if (c === insideQuotes) {
          insideQuotes = false;
        }
      } else {
        if (c === "(" && !insideParens) {
          insideParens = true;
        }

        if (c === ")" && insideParens) {
          insideParens = false;
        }

        if (c === "'" || c === '"') {
          insideQuotes = c;
        }
      }
    }
    return insideQuotes || insideParens
      ? line
      : before + "//" + after.replace(/['"]/g, " ");
  });
}

module.exports = { calculateLoc, replaceQuotesInInlineComments };

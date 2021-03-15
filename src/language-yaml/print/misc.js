"use strict";

const {
  builders: { softline, align },
} = require("../../document");

const { hasEndComments, isNextLineEmpty, isNode } = require("../utils");

const printedEmptyLineCache = new WeakMap();
function printNextEmptyLine(path, originalText) {
  const node = path.getValue();
  const root = path.stack[0];

  let isNextEmptyLinePrintedSet;
  if (printedEmptyLineCache.has(root)) {
    isNextEmptyLinePrintedSet = printedEmptyLineCache.get(root);
  } else {
    isNextEmptyLinePrintedSet = new Set();
    printedEmptyLineCache.set(root, isNextEmptyLinePrintedSet);
  }

  if (!isNextEmptyLinePrintedSet.has(node.position.end.line)) {
    isNextEmptyLinePrintedSet.add(node.position.end.line);
    if (
      isNextLineEmpty(node, originalText) &&
      !shouldPrintEndComments(path.getParentNode())
    ) {
      return softline;
    }
  }

  return "";
}

function shouldPrintEndComments(node) {
  return (
    hasEndComments(node) &&
    !isNode(node, [
      "documentHead",
      "documentBody",
      "flowMapping",
      "flowSequence",
    ])
  );
}

function alignWithSpaces(width, doc) {
  return align(" ".repeat(width), doc);
}

module.exports = {
  alignWithSpaces,
  shouldPrintEndComments,
  printNextEmptyLine,
};

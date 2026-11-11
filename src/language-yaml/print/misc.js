import { align, softline } from "../../document/index.js";
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { hasEndComments, isNextLineEmpty, isNode } from "../utilities.js";

const printedEmptyLineCache = new WeakMap();
const getNextEmptyLinePrintedSet = (path) =>
  getOrInsertComputed(printedEmptyLineCache, path.root, () => new Set());
const markNextEmptyLinePrinted = (path, node = path.node) => {
  getNextEmptyLinePrintedSet(path).add(node.position.end.offset);
};
const hasNextEmptyLineBeenPrinted = (path, node = path.node) =>
  getNextEmptyLinePrintedSet(path).has(node.position.end.offset);

function printNextEmptyLine(path, originalText) {
  if (!hasNextEmptyLineBeenPrinted(path)) {
    markNextEmptyLinePrinted(path);

    const { node } = path;
    if (
      isNextLineEmpty(node, originalText) &&
      !shouldPrintEndComments(path.parent)
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

export {
  alignWithSpaces,
  markNextEmptyLinePrinted,
  printNextEmptyLine,
  shouldPrintEndComments,
};

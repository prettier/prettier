import { align, softline } from "../../document/index.js";
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { hasEndComments, isNextLineEmpty, isNode } from "../utilities.js";

const printedEmptyLineCache = new WeakMap();
function getNextEmptyLinePrintedSet(root) {
  return getOrInsertComputed(printedEmptyLineCache, root, () => new Set());
}

function markNextEmptyLinePrinted(root, node) {
  getNextEmptyLinePrintedSet(root).add(node.position.end.offset);
}

function printNextEmptyLine(path, originalText) {
  const { node, root } = path;

  const isNextEmptyLinePrintedSet = getNextEmptyLinePrintedSet(root);

  if (!isNextEmptyLinePrintedSet.has(node.position.end.offset)) {
    isNextEmptyLinePrintedSet.add(node.position.end.offset);
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

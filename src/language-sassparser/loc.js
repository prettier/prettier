import isNonEmptyArray from "../utils/is-non-empty-array.js";
import lineColumnToIndex from "../utils/line-column-to-index.js";
import { skipEverythingButNewLine } from "../utils/skip.js";

function calculateLocStart(node, text) {
  // `postcss>=8`
  if (typeof node.source?.start?.offset === "number") {
    return node.source.start.offset;
  }

  if (node.source?.start) {
    return lineColumnToIndex(node.source.start, text);
  }

  /* c8 ignore next */
  throw Object.assign(new Error("Can not locate node."), { node });
}

function calculateLocEnd(node, text) {
  if (node.sassType === "sass-comment") {
    return skipEverythingButNewLine(text, node.source.startOffset);
  }

  // `postcss>=8`
  if (typeof node.source?.end?.offset === "number") {
    return node.source.end.offset;
  }

  if (node.source) {
    if (node.source.end) {
      const index = lineColumnToIndex(node.source.end, text);
      return index;
    }

    if (isNonEmptyArray(node.nodes)) {
      return calculateLocEnd(node.nodes.at(-1), text);
    }
  }

  return null;
}

function calculateLoc(node, text) {
  // TODO: "configuration" nodes do not have `source.span` implemented yet
  if (node.sassType === "configuration") {
    return;
  }

  if (node.source) {
    node.source.startOffset = calculateLocStart(node, text);
    node.source.endOffset = calculateLocEnd(node, text);
  }

  for (const key in node) {
    const child = node[key];

    if (
      ["parent", "source"].includes(key) ||
      !child ||
      typeof child !== "object"
    ) {
      continue;
    }

    calculateLoc(child, text);
  }
}

function locStart(node) {
  return node.source?.startOffset;
}

function locEnd(node) {
  return node.source?.endOffset;
}

export { calculateLoc, locEnd, locStart };

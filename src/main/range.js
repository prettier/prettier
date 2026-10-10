import * as assert from "#universal/assert";
import { childNodesCache } from "./comments/attach.js";
import getSortedChildNodes from "./utilities/get-sorted-child-nodes.js";

function dropLeafNonSourceElements(nodeAndAncestors, isSourceElement) {
  const index = nodeAndAncestors.findIndex((node, i, nodes) =>
    isSourceElement(node, nodes[i + 1]),
  );

  if (index === -1) {
    return;
  }

  return nodeAndAncestors.slice(index);
}

function dropRootParents(parents) {
  const index = parents.findLastIndex(
    (node) => node.type !== "Program" && node.type !== "File",
  );

  if (index === -1) {
    return parents;
  }

  return parents.slice(0, index + 1);
}

function findSiblingAncestors(
  startNodeAndAncestors,
  endNodeAndAncestors,
  isSourceElement,
  options,
) {
  [startNodeAndAncestors, endNodeAndAncestors] = [
    startNodeAndAncestors,
    endNodeAndAncestors,
  ].map((nodeAndAncestors) =>
    dropLeafNonSourceElements(nodeAndAncestors, isSourceElement),
  );
  if (!startNodeAndAncestors || !endNodeAndAncestors) {
    return;
  }

  const { locStart, locEnd } = options;
  let [resultStartNode, ...startNodeAncestors] = startNodeAndAncestors;
  let [resultEndNode, ...endNodeAncestors] = endNodeAndAncestors;

  if (resultStartNode === resultEndNode) {
    return [resultStartNode, resultEndNode];
  }

  const startNodeStart = locStart(resultStartNode);
  for (const endAncestor of dropRootParents(endNodeAncestors)) {
    if (locStart(endAncestor) >= startNodeStart) {
      resultEndNode = endAncestor;
    } else {
      break;
    }
  }

  const endNodeEnd = locEnd(resultEndNode);
  for (const startAncestor of dropRootParents(startNodeAncestors)) {
    if (locEnd(startAncestor) <= endNodeEnd) {
      if (isSourceElement(startAncestor)) {
        resultStartNode = startAncestor;
      }
    } else {
      break;
    }
    if (resultStartNode === resultEndNode) {
      break;
    }
  }

  return [resultStartNode, resultEndNode];
}

function findNodeAtOffset(
  node,
  offset,
  options,
  ancestors = [],
  type,
  locFunctions,
) {
  const { locStart, locEnd } = locFunctions;
  const start = locStart(node);
  const end = locEnd(node);

  if (
    offset > end ||
    offset < start ||
    (type === "rangeEnd" && offset === start) ||
    (type === "rangeStart" && offset === end)
  ) {
    return;
  }

  const nodeAndAncestors = [node, ...ancestors];
  const childNodes = getSortedChildNodes(node, nodeAndAncestors, {
    cache: childNodesCache,
    locStart,
    locEnd,
    getVisitorKeys: options.getVisitorKeys,
    // These two property should be removed, since we don't care if it can attach comment
    filter: options.printer.canAttachComment,
    getChildren: options.printer.getCommentChildNodes,
  });
  for (const child of childNodes) {
    const childAndAncestors = findNodeAtOffset(
      child,
      offset,
      options,
      nodeAndAncestors,
      type,
      locFunctions,
    );
    if (childAndAncestors) {
      return childAndAncestors;
    }
  }

  return nodeAndAncestors;
}

/**
@param {string} text
@param {*} opts
@param {*} ast
@returns {[number, number]}
*/
function calculateRange(text, opts, ast) {
  let { rangeStart: start, rangeEnd: end } = opts;
  assert.ok(end > start);
  // Contract the range so that it has non-whitespace characters at its endpoints.
  // This ensures we can format a range that doesn't end on a node.
  const firstNonWhitespaceCharacterIndex = text.slice(start, end).search(/\S/);
  const isAllWhitespace = firstNonWhitespaceCharacterIndex === -1;
  if (!isAllWhitespace) {
    start += firstNonWhitespaceCharacterIndex;
    for (; end > start; --end) {
      if (/\S/.test(text[end - 1])) {
        break;
      }
    }
  }

  const locFunctions =
    opts.printer.features?.experimental_locForRangeFormat ?? opts;
  const startNodeAndAncestors = findNodeAtOffset(
    ast,
    start,
    opts,
    [],
    "rangeStart",
    locFunctions,
  );
  if (!startNodeAndAncestors) {
    return;
  }

  const endNodeAndAncestors =
    // No need find Node at `end`, it will be the same as `startNodeAndAncestors`
    isAllWhitespace
      ? startNodeAndAncestors
      : findNodeAtOffset(ast, end, opts, [], "rangeEnd", locFunctions);
  if (!endNodeAndAncestors) {
    return;
  }

  const { getRangeNodes } = opts.printer;
  if (!getRangeNodes) {
    return;
  }

  const { startNode, endNode } = getRangeNodes(
    startNodeAndAncestors,
    endNodeAndAncestors,
    opts,
  );

  const { locStart, locEnd } = locFunctions;
  return [
    Math.min(locStart(startNode), locStart(endNode)),
    Math.max(locEnd(startNode), locEnd(endNode)),
  ];
}

export { calculateRange, findSiblingAncestors };

"use strict";

const assert = require("assert");
const comments = require("./comments.js");

const isJsonParser = ({ parser }) =>
  parser === "json" || parser === "json5" || parser === "json-stringify";

function findCommonAncestor(
  startNodeAndParents,
  endNodeAndParents,
  isSourceElement
) {
  const startNodeAndAncestors = [
    startNodeAndParents.node,
    ...startNodeAndParents.parentNodes,
  ];
  const endNodeAndAncestors = new Set([
    endNodeAndParents.node,
    ...endNodeAndParents.parentNodes,
  ]);
  return startNodeAndAncestors.find(
    (node) => isSourceElement(node) && endNodeAndAncestors.has(node)
  );
}

function dropRootParents(parents) {
  let lastParentIndex = parents.length - 1;
  for (;;) {
    const parent = parents[lastParentIndex];
    if (parent && (parent.type === "Program" || parent.type === "File")) {
      lastParentIndex--;
    } else {
      break;
    }
  }
  return parents.slice(0, lastParentIndex + 1);
}

function findSiblingAncestors(
  startNodeAndParents,
  endNodeAndParents,
  { locStart, locEnd }
) {
  let resultStartNode = startNodeAndParents.node;
  let resultEndNode = endNodeAndParents.node;

  if (resultStartNode === resultEndNode) {
    return {
      startNode: resultStartNode,
      endNode: resultEndNode,
    };
  }

  const startNodeStart = locStart(startNodeAndParents.node);
  for (const endParent of dropRootParents(endNodeAndParents.parentNodes)) {
    if (locStart(endParent) >= startNodeStart) {
      resultEndNode = endParent;
    } else {
      break;
    }
  }

  const endNodeEnd = locEnd(endNodeAndParents.node);
  for (const startParent of dropRootParents(startNodeAndParents.parentNodes)) {
    if (locEnd(startParent) <= endNodeEnd) {
      resultStartNode = startParent;
    } else {
      break;
    }
  }

  return {
    startNode: resultStartNode,
    endNode: resultEndNode,
  };
}

function findNodeAtOffset(
  node,
  offset,
  options,
  predicate,
  parentNodes = [],
  type
) {
  const { locStart, locEnd } = options;
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

  for (const childNode of comments.getSortedChildNodes(node, options)) {
    const childResult = findNodeAtOffset(
      childNode,
      offset,
      options,
      predicate,
      [node, ...parentNodes],
      type
    );
    if (childResult) {
      return childResult;
    }
  }

  if (!predicate || predicate(node, parentNodes[0])) {
    return {
      node,
      parentNodes,
    };
  }
}

function calculateRange(text, opts, ast) {
  let { rangeStart: start, rangeEnd: end, locStart, locEnd } = opts;
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

  const { printer } = opts;

  const isSourceElement =
    typeof printer.isSourceElement === "function"
      ? printer.isSourceElement
      : () => false;

  const startNodeAndParents = findNodeAtOffset(
    ast,
    start,
    opts,
    (node, parentNode) => isSourceElement(node, parentNode, opts),
    [],
    "rangeStart"
  );
  const endNodeAndParents =
    // No need find Node at `end`, it will be the same as `startNodeAndParents`
    isAllWhitespace
      ? startNodeAndParents
      : findNodeAtOffset(
          ast,
          end,
          opts,
          (node) => isSourceElement(node, undefined, opts),
          [],
          "rangeEnd"
        );
  if (!startNodeAndParents || !endNodeAndParents) {
    return {
      rangeStart: 0,
      rangeEnd: 0,
    };
  }

  let startNode;
  let endNode;
  if (isJsonParser(opts)) {
    const commonAncestor = findCommonAncestor(
      startNodeAndParents,
      endNodeAndParents,
      (node) => isSourceElement(node, undefined, opts)
    );
    startNode = commonAncestor;
    endNode = commonAncestor;
  } else {
    ({ startNode, endNode } = findSiblingAncestors(
      startNodeAndParents,
      endNodeAndParents,
      opts
    ));
  }

  return {
    rangeStart: Math.min(locStart(startNode), locStart(endNode)),
    rangeEnd: Math.max(locEnd(startNode), locEnd(endNode)),
  };
}

module.exports = {
  calculateRange,
  findNodeAtOffset,
};

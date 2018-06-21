"use strict";

function getLast(array) {
  return array[array.length - 1];
}

function getAncestorCount(path, filter) {
  let counter = 0;
  for (let i = 0; i < path.stack.length - 1; i++) {
    const value = path.stack[i];
    if (isNode(value) && filter(value)) {
      counter++;
    }
  }
  return counter;
}

function isNode(value) {
  return value && typeof value.type === "string";
}

function mapNode(node, callback, parent) {
  return callback(
    "children" in node
      ? Object.assign({}, node, {
          children: node.children.map(childNode =>
            mapNode(childNode, callback, node)
          )
        })
      : node,
    parent
  );
}

function defineShortcut(x, key, getter) {
  Object.defineProperty(x, key, {
    get: getter,
    enumerable: false
  });
}

function createNull() {
  return {
    type: "null",
    position: {
      start: { line: -1, column: -1, offset: -1 },
      end: { line: -1, column: -1, offset: -1 }
    }
  };
}

function isNextLineEmpty(node, text) {
  let newlineCount = 0;

  for (let i = node.position.end.offset - 1; i < text.length; i++) {
    const char = text[i];

    if (char === "\n") {
      newlineCount++;
    }

    if (newlineCount === 1 && /\S/.test(char)) {
      return false;
    }

    if (newlineCount === 2) {
      return true;
    }
  }

  return false;
}

function isLastDescendantNode(path) {
  const node = path.getValue();

  switch (node.type) {
    case "comment":
    case "verbatimTag":
    case "shorthandTag":
    case "nonSpecificTag":
      return false;
  }

  for (let i = 1; i < path.stack.length; i++) {
    const item = path.stack[i];
    const parentItem = path.stack[i - 1];

    if (
      Array.isArray(parentItem) &&
      typeof item === "number" &&
      item !== parentItem.length - 1
    ) {
      return false;
    }
  }

  return true;
}

function getLastDescendantNode(node) {
  return "children" in node && node.children.length !== 0
    ? getLastDescendantNode(getLast(node.children))
    : node;
}

function isPrettierIgnore(comment) {
  return comment.value.trim() === "prettier-ignore";
}

function hasPrettierIgnore(path) {
  const node = path.getValue();

  if (node.type === "documentBody") {
    const document = path.getParentNode();
    return (
      document.head.children.length !== 0 &&
      (lastItem => lastItem.type === "comment" && isPrettierIgnore(lastItem))(
        getLast(document.head.children)
      )
    );
  }

  return (
    "leadingComments" in node &&
    node.leadingComments.length !== 0 &&
    isPrettierIgnore(getLast(node.leadingComments))
  );
}

function hasExplicitDocumentEndMarker(document, text) {
  return (
    text.slice(
      document.position.end.offset - 4,
      document.position.end.offset
    ) === "\n..."
  );
}

function restoreBlockFoldedValue(value) {
  const lines = value.split("\n");

  let hasChecked = false;
  let isIndented = false;
  for (let i = 0; i < lines.length; i++) {
    const lineContent = lines[i];

    if (!lineContent) {
      continue;
    }

    if (/^\s/.test(lineContent[0])) {
      isIndented = true;
    } else {
      if (!isIndented && i !== 0 && hasChecked) {
        lines[i] = "\n" + lineContent;
      }
      isIndented = false;
    }

    hasChecked = true;
  }

  return lines.join("\n");
}

function isBlockValue(node) {
  switch (node.type) {
    case "blockFolded":
    case "blockLiteral":
      return true;
    default:
      return false;
  }
}

function hasLeadingComments(node) {
  return "leadingComments" in node && node.leadingComments.length !== 0;
}

function hasMiddleComments(node) {
  return "middleComments" in node && node.middleComments.length !== 0;
}

function hasTrailingComments(node) {
  return "trailingComments" in node && node.trailingComments.length !== 0;
}

module.exports = {
  getLast,
  getAncestorCount,
  isNode,
  isBlockValue,
  mapNode,
  defineShortcut,
  createNull,
  isNextLineEmpty,
  isLastDescendantNode,
  getLastDescendantNode,
  hasPrettierIgnore,
  hasLeadingComments,
  hasMiddleComments,
  hasTrailingComments,
  hasExplicitDocumentEndMarker,
  restoreBlockFoldedValue
};

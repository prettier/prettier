"use strict";

function getLast(array) {
  return array[array.length - 1];
}

function getParentNode(path, count) {
  return path.getParentNode(count);
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

function getRoot(path) {
  return path.stack[0];
}

function isLastNode(path) {
  for (let i = 2; i < path.stack.length; i++) {
    const lastLastItem = path.stack[i - 2];
    if (
      lastLastItem === "leadingComments" ||
      lastLastItem === "middleComments" ||
      lastLastItem === "trailingComments"
    ) {
      return false;
    }
    const item = path.stack[i];
    const lastItem = path.stack[i - 1];
    if (
      Array.isArray(lastItem) &&
      typeof item === "number" &&
      item !== lastItem.length - 1
    ) {
      return false;
    }
  }
  return true;
}

function getLastDescendantNode(node) {
  if ("children" in node && node.children.length !== 0) {
    return getLastDescendantNode(getLast(node.children));
  }
  return node;
}

function isPrettierIgnore(comment) {
  return comment.value.trim() === "prettier-ignore";
}

function hasPrettierIgnore(path) {
  const node = path.getValue();
  // console.log(node.type)
  if (node.type === "documentBody") {
    const document = getParentNode(path);
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

function hasExplicitDocumentEnd(endPoint, text) {
  return text.slice(endPoint.offset - 4, endPoint.offset) === "\n...";
}

module.exports = {
  getLast,
  getParentNode,
  getAncestorCount,
  isNode,
  mapNode,
  defineShortcut,
  createNull,
  isNextLineEmpty,
  getRoot,
  isLastNode,
  getLastDescendantNode,
  hasPrettierIgnore,
  hasExplicitDocumentEnd
};

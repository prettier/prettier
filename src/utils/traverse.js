"use strict";

const isObject = (node) =>
  node && typeof node === "object" && !Array.isArray(node);

function traverse(node, fn) {
  const visited = new WeakSet();

  function traverseNode(node) {
    if (!isObject(node) || visited.has(node)) {
      return node;
    }
    visited.add(node);

    let result = fn(node);
    if (typeof result === "undefined") {
      result = node;
    }

    if (isObject(node)) {
      // Traverse the new node
      if (result !== node) {
        return traverseNode(result);
      }

      for (const [key, child] of Object.entries(node)) {
        if (Array.isArray(child)) {
          node[key] = child.map((child) => traverseNode(child));
        } else {
          const result = traverseNode(child);
          if (result === null) {
            delete node[key];
          } else {
            node[key] = result;
          }
        }
      }
    }

    return node;
  }

  return traverseNode(node);
}

module.exports = traverse;

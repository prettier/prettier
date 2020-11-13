"use strict";

const isObject = (node) =>
  node && typeof node === "object" && !Array.isArray(node);

function traverse(node, fn) {
  const visited = new WeakSet();

  function traverseNode(node, key, parent) {
    if (!isObject(node) || visited.has(node)) {
      return node;
    }
    visited.add(node);

    const result = fn(node, key, parent);
    if (typeof result !== "undefined") {
      node = result;
    }

    if (!isObject(node)) {
      return node;
    }

    for (const [key, child] of Object.entries(node)) {
      if (Array.isArray(child)) {
        node[key] = child.map((child) => traverseNode(child, key, node));
      } else {
        const result = traverseNode(child, key, node);
        if (result !== null) {
          node[key] = result;
        }
      }
    }

    return node;
  }

  return traverseNode(node);
}

module.exports = traverse;

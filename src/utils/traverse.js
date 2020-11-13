"use strict";

function traverse(node, fn) {
  const visited = new WeakSet();

  function traverseNode(node, key, parent) {
    const isArray = Array.isArray(node);
    const isObject = node && typeof node === "object";
    if ((!isArray && !isObject) || visited.has(node)) {
      return node;
    }

    const entries = isArray ? node.entries() : Object.entries(node);
    for (const [key, child] of entries) {
      node[key] = traverseNode(child, key, node);
    }

    visited.add(node);

    if (isObject) {
      const result = fn(node, key, parent);
      if (typeof result !== "undefined") {
        return result;
      }
    }
    return node;
  }

  return traverseNode(node, fn);
}

module.exports = traverse;

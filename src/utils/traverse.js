"use strict";

function traverse(node, fn) {
  const seen = new Set();

  function traverseNode(node, key, parent) {
    if (seen.has(node)) {
      return node;
    }
    let entries;
    if (Array.isArray(node)) {
      entries = node.entries();
    } else if (node && typeof node === "object") {
      entries = Object.entries(node);
    } else {
      return node;
    }

    for (const [key, child] of entries) {
      node[key] = traverseNode(child, key, node);
    }

    if (!Array.isArray(node)) {
      const result = fn(node, key, parent);
      if (typeof result !== "undefined") {
        return result;
      }
      seen.add(node);
    }

    return node;
  }

  return traverseNode(node, fn);
}

module.exports = traverse;

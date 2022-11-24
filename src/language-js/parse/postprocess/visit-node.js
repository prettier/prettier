"use strict";

function visitNode(node, fn) {
  if (Array.isArray(node)) {
    // As of Node.js 16 using raw for loop over Array.entries provides a
    // measurable difference in performance. Array.entries returns an iterator
    // of arrays.
    for (let i = 0; i < node.length; i++) {
      node[i] = visitNode(node[i], fn);
    }
    return node;
  }
  if (node && typeof node === "object" && typeof node.type === "string") {
    // As of Node.js 16 this is benchmarked to be faster over Object.entries.
    // Object.entries returns an array of arrays. There are multiple ways to
    // iterate over objects but the Object.keys combined with a for loop
    // benchmarks well.
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      node[keys[i]] = visitNode(node[keys[i]], fn);
    }
    return fn(node) || node;
  }
  return node;
}

module.exports = visitNode;

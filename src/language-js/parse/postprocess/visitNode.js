"use strict";

function visitNode(node, fn) {
  let entries;

  if (Array.isArray(node)) {
    entries = node.entries();
  } else if (
    node &&
    typeof node === "object" &&
    typeof node.type === "string"
  ) {
    entries = Object.entries(node);
  } else {
    return node;
  }

  for (const [key, child] of entries) {
    node[key] = visitNode(child, fn);
  }

  if (Array.isArray(node)) {
    return node;
  }

  return fn(node) || node;
}

module.exports = visitNode;

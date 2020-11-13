"use strict";

const isObject = (node) =>
  node && typeof node === "object" && !Array.isArray(node);

function traverse(node, fn) {
  const visited = new WeakSet();

  function traverseArray(array) {
    if (visited.has(array)) {
      return array;
    }
    visited.add(array);

    const deleted = [];
    for (const [index, value] of array.entries()) {
      if (Array.isArray(value)) {
        array[index] = traverseArray(value);
      } else if (isObject(value)) {
        const result = traverseNode(value);
        // Return `null` to delete from array
        if (result === null) {
          deleted.unshift(index);
        } else {
          array[index] = traverseArray(value);
        }
      }
      // Keep original value, even it's `null`
    }

    for (const index of deleted) {
      array.splice(index, 1);
    }

    return array;
  }

  function traverseNode(node) {
    if (visited.has(node)) {
      return node;
    }
    visited.add(node);

    let result = fn(node);
    if (typeof result === "undefined") {
      result = node;
    }

    if (Array.isArray(result)) {
      return traverseArray(result);
    } else if (
      isObject(result) &&
      // Traverse the new node
      result !== node
    ) {
      return traverseNode(result);
    }

    if (isObject(result)) {
      for (const [key, value] of Object.entries(node)) {
        if (Array.isArray(value)) {
          node[key] = traverseArray(value);
        } else if (isObject(value)) {
          const result = traverseNode(value);
          // Return `null` to delete node
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

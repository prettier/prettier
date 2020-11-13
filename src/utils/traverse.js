"use strict";

const isObject = (node) =>
  node && typeof node === "object" && !Array.isArray(node);

function traverse(node, fn) {
  const visited = new WeakMap();
  const cache = (fn) => (arrayOrNode) => {
    if (!visited.has(arrayOrNode)) {
      visited.set(arrayOrNode, fn(arrayOrNode));
    }
    return visited.get(arrayOrNode);
  };

  const traverseArray = cache((array) => {
    for (let index = 0; index < array.length; index++) {
      const value = array[index];
      if (Array.isArray(value)) {
        array[index] = traverseArray(value);
      } else if (isObject(value)) {
        const result = traverseNode(value);
        // Return `null` to delete from array
        if (result === null) {
          array.splice(index, 1);
          index--;
        } else {
          array[index] = result;
        }
      }
      // Keep original value, even it's `null`
    }

    return array;
  });

  const traverseNode = cache((node) => {
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
  });

  return traverseNode(node);
}

module.exports = traverse;

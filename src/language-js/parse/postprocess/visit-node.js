import ignoredProperties from "../../ignored-properties.js";

function visitNode(node, fn) {
  if (node !== null && typeof node === "object") {
    if (Array.isArray(node)) {
      // As of Node.js 16 using raw for loop over Array.entries provides a
      // measurable difference in performance. Array.entries returns an iterator
      // of arrays.
      for (let i = 0; i < node.length; i++) {
        node[i] = visitNode(node[i], fn);
      }
      return node;
    }
    if (typeof node.type === "string") {
      // As of Node.js 16 this is benchmarked to be faster over Object.entries.
      // Object.entries returns an array of arrays. There are multiple ways to
      // iterate over objects but the Object.keys combined with a for loop
      // benchmarks well. for-in is fast too and doesn't create an array.
      for (const key in node) {
        if (
          Object.prototype.hasOwnProperty.call(node, key) &&
          !ignoredProperties.has(key)
        ) {
          node[key] = visitNode(node[key], fn);
        }
      }
      return fn(node) || node;
    }
  }
  return node;
}

export default visitNode;

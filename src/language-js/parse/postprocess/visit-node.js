import getVisitorKeys from "../../traverse/get-visitor-keys.js";

function visitNode(node, fn) {
  if (!(node !== null && typeof node === "object")) {
    return node;
  }

  if (Array.isArray(node)) {
    // As of Node.js 16 using raw for loop over Array.entries provides a
    // measurable difference in performance. Array.entries returns an iterator
    // of arrays.
    for (let i = 0; i < node.length; i++) {
      node[i] = visitNode(node[i], fn);
    }
    return node;
  }

  const keys = getVisitorKeys(node);
  for (let i = 0; i < keys.length; i++) {
    node[keys[i]] = visitNode(node[keys[i]], fn);
  }

  return fn(node) || node;
}

export default visitNode;
